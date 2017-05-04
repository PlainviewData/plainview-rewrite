const noodle = require('noodlejs');
const parseDomain = require('parse-domain');
const MESSAGES = require('../bin/messages');
const config = require('../config/scraper');
const supportedWebsite = require('../models/supportedWebsite');
const some = require('lodash.some');
const find = require('lodash.find');

const CURRENT_SCRAPING_METHOD = "Noodle/CSS Selectors";
var SUPPORTED_WEBSITES;

supportedWebsite.getAll()
  .then(function(sites){
    SUPPORTED_WEBSITES = sites;
  })

var scrape = function(url){
  return new Promise(function(resolve, reject){
    const domain = parseDomain(url).domain;
    if (some(SUPPORTED_WEBSITES, ['domain', domain]) === false){
      reject(MESSAGES.UNSUPPORTED_WEBSITE);
      return;
    }
    var content = {};
    var fields_processed = 0;
    htmlTags = find(SUPPORTED_WEBSITES, {domain:domain}).tags_retrieval;
    htmlTags.forEach(function(htmlTag){
      noodle.query({url: url, selector: htmlTag.tag, type: 'html', extract: 'text'})
      .then(function(data){
        if (config.tags_retrieval[htmlTag.field_name].combine_fields) {
          content[htmlTag.field_name] = data.results[0].results.join(" ").replace(/\s+/g, " ");
          if (content[htmlTag.field_name] == "" && config.tags_retrieval[htmlTag.field_name].required) return reject(MESSAGES.COULD_NOT_GET_ARTICLE_INFO);
        } else {
          content[htmlTag.field_name] = data.results[0].results;
          if (content[htmlTag.field_name].length < 1 && config.tags_retrieval[htmlTag.field_name].required) return reject(MESSAGES.COULD_NOT_GET_ARTICLE_INFO);
        }
        fields_processed++;
        if (fields_processed === htmlTags.length) resolve(content);
      }).catch(function(err){
        fields_processed++;
        if (fields_processed === htmlTags.length) resolve(content);
      });
    });
  });
}

module.exports = {
  CURRENT_SCRAPING_METHOD: CURRENT_SCRAPING_METHOD,
  SUPPORTED_WEBSITES: SUPPORTED_WEBSITES,
  scrape: scrape
};
