const express = require('express');
const router = express.Router();
const SUPPORTED_WEBSITES = require('../config/supported_websites');
const PUBLIC_SUPPORTED_WEBSITES = SUPPORTED_WEBSITES.filter(function(site){
  return site.hidden == undefined;
});

router.get('/supported_websites', function(req, res, next) {
  res.send(PUBLIC_SUPPORTED_WEBSITES);
});

module.exports = router;
