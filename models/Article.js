const mongoose = require('mongoose');
const shortid = require('shortid');
const jsdiff = require('diff');
const parseDomain = require('parse-domain');
const some = require('lodash.some');
const isEqual = require('lodash.isequal');
const isEqualWith = require('lodash.isequalwith');
const isEmpty = require('lodash.isempty');
const moment = require('moment');
const validator = require('validator');
const archive_is = require('archive.is');
const scraper = require('../bin/scraper');
const MESSAGES = require('../bin/messages');
const Schema = mongoose.Schema;
const SupportedWebsite = require('../models/SupportedWebsite');

SupportedWebsite.getAll()
  .then(function(sites){
    SUPPORTED_WEBSITES = sites;
  })

const revision_comparisons = [
  {field: 'original_headline', comparison: 'headline', diff_field: 'headline_revisions'},
  {field: 'original_story_content', comparison: 'story', diff_field: 'story_content_revisions'},
  {field: 'original_authors', comparison: 'author', diff_field: 'authors_revisions'}, //change comparison to authors
  {field: 'original_date_posted', comparison: 'date', diff_field: 'date_posted_revisions'}
];

const articleSchema = new Schema({
	_id: { type: String, 'default': shortid.generate, required: true, unique: true},
  scraped_using: {type: String, required: true},
	news_site_url: {type: String, required: true},
  original_archive_time: {type: Date, default: Date.now, required: true},
  last_checked_for_revision: {type: Date, default: Date.now, required: true},

	original_headline: {type: String, required: true},
	original_story_content: {type: String, required: true},
	original_authors: [String],
  original_date_posted: [String],

  headline_revisions: [],
  story_content_revisions: [],
  authors_revisions: [],
  date_posted_revisions: [],

	archive_is_id: String,
});

articleSchema.virtual('news_site_domain').get(function () {
  return parseDomain(this.news_site_url).domain;
});

articleSchema.statics.createNew = function createNew(url, options){
  var Archive = this;
  return new Promise(function(resolve, reject){
    if (typeof url !== 'string' && (url instanceof String) === false || validator.isURL(url) === false || parseDomain(url) == null) reject(MESSAGES.INVALID_URL);
    if (some(SUPPORTED_WEBSITES, ['domain', parseDomain(url).domain]) === false) reject(MESSAGES.UNSUPPORTED_WEBSITE);

    Archive.findByUrl(url, options)
    .then(function(archive){
      if (archive) {
        resolve (archive);
      } else {
        url = validator.trim(url);
        var article = new Article();
        article.news_site_url = url;
        scraper.scrape(url)
        .then(function(content){
          article.scraped_using = scraper.CURRENT_SCRAPING_METHOD;
          article.original_headline = content.headline;
          article.original_story_content = content.story;
          article.original_authors = content.author; //change to authors
          article.original_date_posted = content.date; //change to date_posted
        }).then(function(){
          if (options.post_to_archive_is){
            return archive_is.save(article.news_site_url).then(function (result) {
              article.archive_is_id = result.id;
            });
          } else {
            article.archive_is_id = null;
            return;
          }
        }).then(function(){
          article.save(function(err, article){
            if (err) reject(err);
            resolve(article);
          }).catch(function(err){
            reject(err);
          });
        }).catch(function(err){
          reject(err);
        });
      }
    })
    .catch(function(err){
      reject(err); return;
    });
  });
};

articleSchema.statics.findById = function findById(id, options) {
  return new Promise(function(resolve, reject){
    if (shortid.isValid(id) === false) reject(MESSAGES.INVALID_ID);
    Article.findOne({ _id: id }, function(err, article){
      if (err) reject(err);
      if (article == null) {
        resolve(null);
      } else {
        if (options.ignore_article_min_time_passed || moment.duration(moment().diff(article.last_checked_for_revision)).asHours() > 1){
          article.checkForChanges()
          .then(function(article){
            resolve(article);
          }).catch(function(err){
            reject(err);
          });
        } else {
          resolve(article);
        }
      }
    });
  });
};

articleSchema.statics.findByUrl = function findByUrl(url, options) {
  var article = this;
  return new Promise(function(resolve, reject){
    article.findOne({ news_site_url: url }, function(err, article){
      if (err) reject(err);
      if (article === null) {
        resolve(null);
      } else {
        if (options.ignore_article_min_time_passed || moment.duration(moment().diff(article.last_checked_for_revision)).asHours() > 1){
          article.checkForChanges()
          .then(function(article){
            resolve(article);
          }).catch(function(err){
            reject(err);
          });
        } else {
          resolve(article);
        }
      }
    });
  });
};

articleSchema.methods.checkForChanges = function checkForChanges() {
  var article = this;
  return new Promise(function(resolve, reject){
    scraper.scrape(article.news_site_url)
    .then(function(content){
      var changes = [];
      revision_comparisons.forEach(function(revision_comparison){
        var diff;
        if (typeof article[revision_comparison.field] === 'string'){
          diff = jsdiff.diffChars(article[revision_comparison.field], content[revision_comparison.comparison]);
        } else if (typeof article[revision_comparison.field] === 'object'){
          diff = jsdiff.diffArrays(article[revision_comparison.field], content[revision_comparison.comparison]);
        }
        if (some(diff, ['removed', true]) || some(diff, ['added', true])){
          diff.forEach(function(d){
            for (k in d){
              if (d[k] == undefined) d[k] = null;
            }
          });
          var found = false;
          article[revision_comparison.diff_field].forEach(function(revision){
            if (isEqual(revision, diff)){
              found = true;
            }
          });
          if (found == false){
            changes.push({diff:diff, field: revision_comparison.diff_field});
          }
        }
      });
      if (isEmpty(changes) == false){
        article.addRevisions(changes)
        .then(function(article){
          resolve(article);
        });
      } else {
        resolve(article);
      }
    }).catch(function(err){
      reject(err);
    });
  });
};

articleSchema.methods.addRevisions = function addRevisions(changes) {
  var article = this;
  var pushedObject = {};
  changes.forEach(function(change){
    pushedObject[change.field] = {change: change.diff, time_observed: new Date()};
  });
  return new Promise(function(resolve, reject){
    Article.findOneAndUpdate({ _id: article._id }, { $push: pushedObject }, {new: true}, function(err, updatedArticle){
      if (err) reject(err);
      resolve(updatedArticle);
    });
  });
};

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
