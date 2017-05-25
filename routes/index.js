const express = require('express');
const router = express.Router();
const supportedWebsite = require('../models/SupportedWebsite');
var SUPPORTED_WEBSITES;

supportedWebsite.getAll()
  .then(function(sites){
    SUPPORTED_WEBSITES = sites.filter(function(site){return site.hidden == false});
  })

router.get('/supported_websites', function(req, res, next) {
  res.send(SUPPORTED_WEBSITES);
});

module.exports = router;
