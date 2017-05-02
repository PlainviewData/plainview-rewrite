const mongoose = require('mongoose');
const shortid = require('shortid');
const _ = require('lodash');
const validator = require('validator');
const aws = require('aws-sdk');
const Article = require('./Article');
const MESSAGES = require('../bin/messages');
const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const archiveSchema = new Schema({
	_id: {type: String, 'default': shortid.generate, unique: true},

  user_quote: {type: String, required: true},
  article: {type: String, ref: 'Article', required: true, validate: [shortid.isValid, MESSAGES.GENERIC_SERVER_ERROR]},
	webpage_screenshot_url: String,

  time_init: {type: Date, required: true},
  time_fin: {type: Date, default: Date.now, required: true},
});

archiveSchema.statics.createNew = function createNew(url, quote, options){
	return new Promise(function(resolve, reject){
		if (typeof url !== 'string' && (url instanceof String) === false || validator.isURL(url) === false) reject(MESSAGES.INVALID_URL);
		if (typeof quote !== 'string' && (quote instanceof String) === false || validator.isEmpty(quote) === true) reject(MESSAGES.INVALID_QUOTE);
    quote = validator.trim(quote);
    url = validator.trim(url);

		var archive = new Archive();
		var article;
		archive.time_init = Date.now();
		archive.user_quote = quote;

		Article.findByUrl(url, options)
		.then(function(foundArticle){
			if (foundArticle != null){
				article = foundArticle;
				archive.article = article._id;
			} else {
				return Article.createNew(url)
				.then(function(newArticle){
					article = newArticle;
					archive.article = article._id;
				}).catch(function(err){
					reject(err);
					return;
				});
			}
		}).then(function(){
			if (article.original_headline.indexOf(quote) === -1 && article.original_story_content.indexOf(quote) === -1){
				reject(MESSAGES.COULD_NOT_FIND_QUOTE);
			}
		}).then(function(){
			//take screenshot and upload to S3 (without saving and deleting the image)
			return 1;
		}).then(function(){
			archive.save(function(err, archive){
				if (err) reject(err);
				resolve({archive: archive, article: article});
			});
		}).catch(function(err){
			reject(err);
		});
  });
};

archiveSchema.statics.findById = function findById(id, options) {
  return new Promise(function(resolve, reject){
		if (shortid.isValid(id) === false) reject(MESSAGES.INVALID_ID);
    Archive.findOne({ _id: id }, function(err, archive){
      if (err) reject(err);
      resolve(archive);
    });
  });
};

archiveSchema.statics.findArchivesWithSameArticle = function findArchivesWithSameArticle(articleId) {
  return new Promise(function(resolve, reject){
    Archive.find({ article: articleId }, function(err, archives){
      if (err) reject(err);
      resolve(archives);
    });
  });
};

var Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;
