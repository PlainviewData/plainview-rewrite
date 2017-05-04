const mongoose = require('mongoose');
const shortid = require('shortid');
const dbConfig = require('../config/db');
const ObjectId = mongoose.SchemaTypes.ObjectId;
const Schema = mongoose.Schema;
const parseDomain = require('parse-domain');

const supportedWebsiteSchema = new Schema({
	_id: String,
  tags_retrieval: [],
  site_url: String,
  logo_url: String,
  display_name: String,
  hidden: Boolean
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

supportedWebsiteSchema.virtual('domain').get(function () {
  return parseDomain(this.site_url).domain;
});

supportedWebsiteSchema.statics.getAll = function(){
  var supportedWebsite = this;
  return new Promise(function(resolve, reject){
    supportedWebsite.find({}, function(err, websites){
      if (err) reject(err);
      resolve(websites);
    });
  });
};

var SupportedWebsite = mongoose.model('SupportedWebsite', supportedWebsiteSchema);

module.exports = SupportedWebsite;
