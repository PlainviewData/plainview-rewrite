process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http');
const app = require('../app');
const MESSAGES = require('../bin/messages');
const shortid = require('shortid');
const loremIpsum = require('lorem-ipsum')

chai.use(chaiAsPromised);
chai.use(chaiHttp);

chai.should();

require('it-each')();

describe('', function(){
  describe('Creating an article with invalid url', function(){
    const invalidUrls = ['a', 'a.b', 'htp:/aa.', ''];
    it.each(invalidUrls, 'should inform of an invalid url and give back a 400 status code', function(url, next){
      chai.request(app)
      .post('/articles')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({url: url})
      .end((err, res) => {
          res.status.should.be.equal(400);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.INVALID_URL.description);
          next();
      });
    });
  });

  describe('Creating an article with unsupported website', function(){
    const urls = ['http://www.google.com', 'http://www.cna.com', 'http://www.webs.com'];
    it.each(urls, 'should inform of a nonsupported website and give back a 400 status code', function(url, next){
      chai.request(app)
      .post('/articles')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({url: url})
      .end((err, res) => {
          res.status.should.be.equal(400);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.UNSUPPORTED_WEBSITE.description);
          next();
      });
    });
  });

  describe('Creating an article with a supported website- article doesn\'t exist', function(){
    var id = shortid.generate();
    var story = loremIpsum({count: Math.floor(Math.random() * (30 - 10 + 1)) + 10, units:'sentences' , paragraphLowerBound: 4, paragraphLowerBound: 8});
    var author = loremIpsum({count: Math.floor(Math.random() * (3 - 2 + 1)) + 2, units:'words'});
    var dateObj = new Date(); var date = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' +  dateObj.getFullYear();
    var headline = loremIpsum({count: 1, units: 'sentences'});
    var content = {id: id, story: story, author: author, date: date, headline: headline};

    it.each([0], 'should scrape the site and give a 201 status code', function(iteration, next){
      chai.request('http://plainview-test.herokuapp.com')
      .post('/temp_article')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(content)
      .end((err, res) => {
        chai.request(app)
        .post('/articles')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({url: 'http://plainview-test.herokuapp.com/temp_article/'+id})
        .end((err, res) => {
          res.status.should.be.equal(201);
          res.body.should.be.a('object');
          res.body.should.have.ownProperty('_id');
          res.body.original_story_content.should.equal(story);
          res.body.original_headline.should.equal(headline);
          res.body.original_authors.should.eql([author]);
          res.body.original_date_posted.should.eql([date]);
          next();
        });
      });
    });
  });

  describe('Creating an article with a supported website but no article on the page', function(){
    const websites = ['http://www.cnn.com', 'http://www.bbc.com/foo', 'http://nytimes.org/']
    it.each(websites, 'should inform of the failure to scrape the article', function(website){
      chai.request(app)
      .post('/articles')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({url: website})
      .end((err, res) => {
        res.status.should.be.equal(500);
        res.text.should.be.a('string');
        res.text.should.be.eql(MESSAGES.COULD_NOT_GET_ARTICLE_INFO.description);
        next();
      });
    });
  });

  describe('Getting an article by invalid id', function(){
    const invalidIds = ['a', '1', '123'];
    it.each(invalidIds, 'should inform of an invalid id and give back a 400 status code', function(id, next){
      chai.request(app)
      .get('/articles/'+id)
      .end((err, res) => {
          res.status.should.be.equal(400);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.INVALID_ID.description);
          next();
      });
    });
  });

  describe('Getting an article by id that doesn\'t exist', function(){
    const nonexistentIds = ['123456', 'aaaaaa', 'bbbbbb'];
    it.each(nonexistentIds, 'should inform of an nonexistent id and give back a 400 status code', function(id, next){
      chai.request(app)
      .get('/articles/'+id)
      .end((err, res) => {
          res.status.should.be.equal(404);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.COULD_NOT_FIND_ARTICLE.description);
          next();
      });
    });
  });

  describe('Getting an article by id that does exist; article is not revised', function(){

  });

  describe('Getting an article by id that does exist; article is revised', function(){

  });
});
