process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const chaiHttp = require('chai-http');
const app = require('../app');
const MESSAGES = require('../bin/messages');

chai.use(chaiAsPromised);
chai.use(chaiHttp);

chai.should();

require('it-each')();

describe('', function(){
  describe('Create archive with quote not found', function(){

  });

  describe('Create archive with existing article', function(){

  });

  describe('Create archive with new article', function(){

  });

  describe('Getting an archive by invalid id', function(){
    const invalidIds = ['a', '1', '123'];
    it.each(invalidIds, 'should inform of an invalid id and give back a 400 status code', function(id, next){
      chai.request(app)
      .get('/archives/'+id)
      .end((err, res) => {
          res.status.should.be.equal(400);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.INVALID_ID.description);
          next();
      });
    });
  });

  describe('Getting an archive by id that doesn\'t exist', function(){
    const nonexistentIds = ['123456', 'aaaaaa', 'bbbbbb'];
    it.each(nonexistentIds, 'should inform of an nonexistent id and give back a 400 status code', function(id, next){
      chai.request(app)
      .get('/archives/'+id)
      .end((err, res) => {
          res.status.should.be.equal(404);
          res.text.should.be.a('string');
          res.text.should.be.eql(MESSAGES.COULD_NOT_FIND_ARCHIVE.description);
          next();
      });
    });
  });

  describe('Getting an archive by id', function(){
    const ids = ['HyC5q_ACx', 'BJa05dRRl', 'B1gejO00l'];
    it.each(ids, 'should return an archive and give back a 200 status code', function(id, next){
      chai.request(app)
      .get('/archives/'+id)
      .end((err, res) => {
          res.status.should.be.equal(200);
          res.body.should.be.a('object');
          res.body.should.have.ownProperty('_id');
          res.body.should.have.ownProperty('user_quote');
          res.body.should.have.ownProperty('article');
          res.body.should.have.ownProperty('time_init');
          res.body.should.have.ownProperty('time_fin');
          next();
      });
    });
  });

  describe('Get archives with the same article', function(){

  });
});
