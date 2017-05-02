const express = require('express');
const includes = require('lodash.includes');
const router = express.Router();
const Article = require('../models/Article');
const MESSAGES = require('../bin/messages');
const sanitizeGetRequestQuery = require('../bin/article_get_sanitizer').sanitizeGetRequestQuery;
const sanitizePostRequestBody = require('../bin/article_post_sanitizer').sanitizePostRequestBody;

router.get('/:id', function(req, res, next){
  req.query = sanitizeGetRequestQuery(req.query);
  next();
});

router.post('/', function(req, res, next){
  req.body = sanitizePostRequestBody(req.body);
  next();
});

router.get('/:id', function(req, res, next) {
  Article.findById(req.params.id, req.body.options)
  .then(function(article){
    if (article !== null) {
      res.status(200).json(article);
    } else {
      res.status(404).send(MESSAGES.COULD_NOT_FIND_ARTICLE.description);
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
  console.log(req.body)
  Article.createNew(req.body.url, req.body.options)
  .then(function(article){
    res.status(201).json(article);
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
