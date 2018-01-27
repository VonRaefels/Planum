var request = require('supertest');
var app = require("../app");
var expect = require('chai').expect;
var assert = require('chai').assert;
var should = require('chai').should();


describe('GET /oauth/test', function() {
  it('should respond with 400 beacuse no auth was established', function(done) {
    request(app)
      .get('/oauth/test')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        if(err){console.log(err);}
        res.status.should.equal(400);
        var body = res.body;
        body.should.be.a('object');
        body.code.should.equal(400);
        body.error.should.equal('invalid_request');
        done();
      });
  });
  it('should respond with 200 OK because authorization was granted', function(done) {
    preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
      if(err){console.log(err);}
      should.equal(err, null);
      request(app)
        .get('/oauth/test')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + accessToken)
        .end(function(err, res) {
          if(err){console.log(err);}
          res.status.should.equal(200);
          var body = res.body;
          body.should.be.a('object');
          body.should.have.property('ok');
          body.ok.should.equal(true);
          done();
        });
    });
  });
});

describe('POST /oauth-token', function() {
  it('should responde with 400 and invalid_parameter because no Content-Type header was set', function(done) {
    request(app)
      .post('/oauth/token')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        if(err){console.log(err)};
        res.status.should.equal(400);
        var body = res.body;
        body.should.be.a('object');
        body.code.should.equal(400);
        body.error.should.equal('invalid_request');
        done();
      });
  });
  it('should responde with 400 and invalid_parameter because no params where set', function(done) {
    request(app)
      .post('/oauth/token')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .end(function(err, res) {
        if(err){console.log(err)};
        res.status.should.equal(400);
        var body = res.body;
        body.should.be.a('object');
        body.code.should.equal(400);
        body.error.should.equal('invalid_request');
        done();
      });
  });
  it('should responde with 400 and invalid_parameter because no params where set', function(done) {
    var postData = {
      username: "jorge",
      password: "password",
      grant_type: "password"
    };

    request(app)
      .post('/oauth/token')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(postData)
      .end(function(err, res) {
        if(err){console.log(err)};
        res.status.should.equal(400);
        var body = res.body;
        body.should.be.a('object');
        body.code.should.equal(400);
        body.error.should.equal('invalid_client');
        done();
      });
  });
  it('should responde with 200 OK', function(done) {
    var postData = {
      username: "jorge",
      password: "password",
      grant_type: "password"
    };

    var client_id = "s6BhdRkqt3";
    var client_password = "12345";
    var authorizationHeader = "Basic " + new Buffer(client_id + ":" + client_password).toString('base64');

    preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
      if(err){console.log(err)};
      should.equal(err, null);
      status.should.equal(200);
      tokenType.should.equal('bearer');
      accessToken.should.be.a('string');
      refreshToken.should.be.a('string');
      done();
    });
  });
  it('should respond 200 OK because refresh_token was set properly', function(done) {
    preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
      if(err){console.log(err)};
      should.equal(err, null);
      status.should.equal(200);
        var postData = {
          grant_type: "refresh_token",
          refresh_token: refreshToken
        };
        preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
          if(err){console.log(err)};
          should.equal(err, null);
          status.should.equal(200);
          tokenType.should.equal('bearer');
          accessToken.should.be.a('string');
          refreshToken.should.be.a('string');
          done();
        }, postData);
    });
  });
  it('should respond 400 because refresh_token was invalid', function(done) {
    preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
      if(err){console.log(err)};
      should.equal(err, null);
      status.should.equal(200);
        var postData = {
          grant_type: "refresh_token",
          refresh_token: 'BAD_TOKEN'
        };
        preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
          if(err){console.log(err)};
          should.equal(err, null);
          status.should.equal(400);
          done();
        }, postData);
    });
  });
  it('should perform a logout', function(done) {
    preparePostTokenRequest(function(err, status, tokenType, accessToken, refreshToken) {
      if(err){console.log(err)};
      should.equal(err, null);
      status.should.equal(200);
      request(app)
        .post('/oauth/logout')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + accessToken)
        .end(function(err ,res) {
          expect(err).to.be.null;
          res.status.should.equal(200);
          res.body.ok.should.be.true;
          request(app)
            .get('/oauth/test')
            .set('Accept', 'application/json')
            .end(function(err, res) {
              if(err){console.log(err);}
              res.status.should.equal(400);
              var body = res.body;
              body.should.be.a('object');
              body.code.should.equal(400);
              body.error.should.equal('invalid_request');
              done();
            });
        });
    });
  });
});

function preparePostTokenRequest(cb, postData) {
  if(postData === undefined) {
    postData = {
      username: "jorge",
      password: "password",
      grant_type: "password"
    };
  }

  var client_id = "s6BhdRkqt3";
  var client_password = "12345";
  var authorizationHeader = "Basic " + new Buffer(client_id + ":" + client_password).toString('base64');

  return request(app)
          .post('/oauth/token')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Authorization', authorizationHeader)
          .send(postData)
          .end(function(err, res) {
            if(!err && res) {
              var body = res.body;
              cb(err, res.status, body.token_type, body.access_token, body.refresh_token);
            }else {
              cb(err);
            }
          });
}

function jsonToQuery(obj) {
    var parts = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
    }
    return "?" + parts.join('&');
}