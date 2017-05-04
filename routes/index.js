const express = require('express');
const router = express.Router();
const supportedWebsite = require('../models/supportedWebsite');

supportedWebsite.getAll()
  .then(function(sites){
    SUPPORTED_WEBSITES = sites;
  })

router.get('/supported_websites', function(req, res, next) {
  res.send(PUBLIC_SUPPORTED_WEBSITES);
});

module.exports = router;
