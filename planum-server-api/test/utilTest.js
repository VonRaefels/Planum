var model = require('../domain/model');
var util = require('../util');
var request = require('supertest');
var expect = require('chai').expect;
var assert = require('chai').assert;
var should = require('chai').should();




describe('util', function() {
  before(function(done){
    util.dumpDummyData(done);
  });

  it('should find an id of Game model type', function(done) {
    util.findModelId(model.Game, function(err, id) {
      if(err) { console.log(err); }
      expect(err).to.be.false;
      id.should.be.a('object');
      done();
    });
  });

  it('should find a publication by song name', function(done) {
    util.findPublicationBySongName('Nocturne', function(err, pub) {
      if(err) { console.log(err); }
      expect(err).to.be.false;
      expect(pub).not.to.be.null;
      pub.should.be.a('object');
      done();
    });
  });
});