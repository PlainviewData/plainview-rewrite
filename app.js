const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const aws = require('aws-sdk');

const DB_CONFIG = require('./config/db');

const index = require('./routes/index');
const archives = require('./routes/archives');
const articles = require('./routes/articles');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(DB_CONFIG.DB_CONNECTION, {"useMongoClient":true});
aws.config.update({accessKeyId: DB_CONFIG.AWS_ACCESS_KEY, secretAccessKey: DB_CONFIG.AWS_SECRET_KEY});
const s3 = new aws.S3();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/archives', archives);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  res.send("Not found")
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;
