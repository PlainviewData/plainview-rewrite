const noodle = require('noodlejs');
const _ = require('lodash');
const fs = require('fs');
const validator = require('validator');
const path = require('path');
const parseDomain = require('parse-domain');
const MESSAGES = require('../bin/messages');
const config = require('../config/scraper');
const FileHound = require('filehound');

const CURRENT_SCRAPING_METHOD = "Noodle/CSS Selectors";
var SUPPORTED_WEBSITES = {};
//TODO: GET RID OF CONSTANT FILE READS, STORE IN MEMORY DUMBO


FileHound.create()
  .paths(path.join(__dirname, "./supported_websites"))
  .ext('json')
  .find()
  .then(function(files){
    files.forEach(function(file){
      var fileContents = JSON.parse(fs.readFileSync(file));
      console.log(fileContents.site_url)
      //console.log(parseDomain(fileContents));
      //SUPPORTED_WEBSITES[parseDomain(fileContents.site_url).domain] = fileContents;
    });
    console.log(SUPPORTED_WEBSITES);
  });

var scrape = function(url){
  return new Promise(function(resolve, reject){
    var domain = parseDomain(url).domain;
    var fileName = path.join(__dirname, "./supported_websites/" + domain + ".json");
    if (fs.existsSync(fileName) == false){
      reject(MESSAGES.UNSUPPORTED_WEBSITE);
      return;
    }
    fs.readFile(fileName, 'utf8', function(err, htmlTags){
      var content = {};
      var fields_processed = 0;
      htmlTags = JSON.parse(htmlTags)[domain].tags_retrieval; //TODO: remove the domain field
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
  });
}

module.exports = {
  CURRENT_SCRAPING_METHOD: CURRENT_SCRAPING_METHOD,
  scrape: scrape
};
