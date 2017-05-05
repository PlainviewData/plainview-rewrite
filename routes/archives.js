const express = require('express');
const includes = require('lodash.includes');
const router = express.Router();
const Archive = require('../models/Archive');
const MESSAGES = require('../bin/messages');
const sanitizeGetRequestQuery = require('../bin/archive_get_sanitizer').sanitizeGetRequestQuery;
const sanitizePostRequestBody = require('../bin/archive_post_sanitizer').sanitizePostRequestBody;

router.get('/:id', function(req, res, next){
  req.query = sanitizeGetRequestQuery(req.query);
  next();
});

router.post('/', function(req, res, next){
  req.body = sanitizePostRequestBody(req.body);
  next();
});

router.get('/:id', function(req, res, next) {
  Archive.findById(req.params.id, req.body.options)
  .then(function(archive){
    if (archive !== null) {
      res.status(200).json(archive);
    } else {
      res.status(404).send(MESSAGES.COULD_NOT_FIND_ARCHIVE.description);
    }
  }).catch(function(err){
    console.log(err);
    if (includes(MESSAGES, err)){
      res.status(err.status).send(err.description);
    } else {
      res.status(500).send(MESSAGES.GENERIC_SERVER_ERROR.description);
    }
  });
});

router.post('/', function(req, res, next){
  console.log(req.body.options);
  Archive.createNew(req.body.url, req.body.quote, req.body.options)
  .then(function(archiveWithArticle){
    res.status(201).json(archiveWithArticle);
  }).catch(function(err){
    console.log(err);
    if (includes(MESSAGES, err)){
      res.status(err.status).send(err.description);
    } else {
      res.status(500).send(MESSAGES.GENERIC_SERVER_ERROR.description);
    }
  });
});

module.exports = router;
