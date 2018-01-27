var request = require('supertest');
var app = require("../app");
var expect = require('chai').expect;
var assert = require('chai').assert;
var storage = require('../domain/storage');
var model = require('../domain/model');
var util = require('../util');
var should = require('chai').should();
var assertProperty = util.assertProperty;


var accessToken;
describe('Api', function() {
  before(function(done){
    util.dumpDummyData(function(err) {
      if(err) { console.log(err); return; }
      preparePostTokenRequest(function(err, status, tokenType, _accessToken, refreshToken) {
        accessToken = _accessToken;
        done();
      });
    });
  });

  it('should return HTTP401 because no token was provided', function(done) {
    request(app)
    .get('/api/game')
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if(err){ console.log(err); }
      expect(err).to.be.null;
      res.status.should.equal(401);
      res.body.should.have.property('error');
      done();
    });
  });

  it('should return HTTP401 (invalid token) because token provided was invalid', function(done) {
    request(app)
    .get('/api/game')
    .set('Accept', 'application/json')
    .set('Authorization', '-')
    .end(function(err, res) {
      if(err){ console.log(err); }
      expect(err).to.be.null;
      res.status.should.equal(401);
      res.body.should.have.property('error');
      res.body.error.should.be.equal('Invalid authorization header');
      done();
    });
  });

  it('should GET a game', function(done) {
    bootstrapRequest('/api/game', 'get')
    .end(function(err, res) {
      if(err){ console.log(err); }
      var body = res.body;
      res.status.should.equal(200);
      body.should.be.a('object');
      assertProperty(body, 'string', 'name');
      assertProperty(body, 'Boolean', 'active');
      assertProperty(body, 'string', 'activeRound');
      assertProperty(body, 'array', 'rounds');
      assertProperty(body, 'array', 'players');
      done();
    });
  });

  it('should POST a new game', function(done) {
    bootstrapRequest('/api/game', 'post')
    .send({ name: 'Test' })
    .end(function(err, res) {
      if(err){ console.log(err); }
      var body = res.body;
      res.status.should.equal(200);
      body.should.be.a('array');
      body[1].active.should.equal(true);
      body[1].players.length.should.equal(1);
      body[1].rounds.length.should.equal(1);
      body[1].activeRound.should.be.a('string');
      done();
    });
  });

  it('should GET the player data', function(done) {
    bootstrapRequest('/api/me', 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      var body = res.body;
      res.status.should.equal(200);
      assertProperty(body, 'string', 'name');
      assertProperty(body, 'string', 'thumbLink');
      expect(body.oauthuser).to.be.undefined;
      expect(body.firstName).to.be.a('string');
      done();
    });
  });

  it('should register a new player', function(done) {
    var player = { name: 'test', firstName: 'Test', game: 'Indie/Rock', password: 'password', lastName: 'lastname', email: 'emailtest', thumbLink: '/img/players/test.jpg' };
    request(app)['post']('/api/players')
    .send(player)
    .end(function(err, res) {
      if(err) { console.log(err); }
      var body = res.body;
      res.status.should.equal(200);
      assertProperty(body, 'string', 'name');
      assertProperty(body, 'string', 'thumbLink');
      expect(body.oauthuser).to.be.undefined;
      expect(body.password).to.be.undefined;
      expect(body.firstName).to.be.a('string');
      util.assertUserExists(body._id, function(exists) {
        exists.should.be.true;
        done();
      });
    });
  });

  it('should choose a game', function(done) {
    util.findModelId(model.Player, function(err, playerId) {
      util.findModelId(model.Game, function(err, gameId) {
        bootstrapRequest('/api/chooseGame', 'post')
        .send({ player: playerId, game: gameId})
        .end(function(err, res) {
          if(err) { console.log(err); }
          var body = res.body;
          body._id.should.be.equal(playerId.toString());
          body.activeGame.should.be.equal(gameId.toString());
          res.status.should.equal(200);
          done();
        });
      });
    });
  });

  // it('should unchoose a game', function(done) {
  //   util.findModelId(model.Player, function(err, playerId) {
  //     bootstrapRequest('/api/chooseGame', 'post')
  //     .send({ player: playerId, game: ''})
  //     .end(function(err, res) {
  //       if(err) { console.log(err); }
  //       var body = res.body;
  //       body._id.should.be.equal(playerId.toString());
  //       res.status.should.equal(200);
  //       done();
  //     });
  //   });
  // });

  it('should GET the players of the game', function(done) {
    bootstrapRequest('/api/players', 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      var body = res.body;
      res.status.should.equal(200);
      var body = res.body;
      body.length.should.be.above(0);
      body[0].name.should.be.a('string');
      expect(body[0].oauthuser).to.be.undefined;
      expect(body[0].firstName).to.be.a('string');
      done();
    });
  });

  it('should GET another player data', function(done) {
    util.findModelId(model.Player, function(err, playerId) {
      bootstrapRequest('/api/players/' + playerId, 'get')
      .end(function(err, res) {
        if(err) { console.log(err); }
        var body = res.body;
        res.status.should.equal(200);
        assertProperty(body, 'string', 'name');
        assertProperty(body, 'string', 'thumbLink');
        expect(body.oauthuser).to.be.undefined;
        expect(body.firstName).to.be.a('string');
        done();
      });
    });
  });

  it('should GET a list of publications', function(done) {
    util.findModelId(model.Round, function(err, roundId) {
      if(err) { console.log(err); }
      bootstrapRequest('/api/rounds/' + roundId + '/publications', 'get')
      .end(function(err, res) {
        if(err) { console.log(err); }
        expect(err).to.be.null;
        var body = res.body;
        body.length.should.be.above(0);
        body[0].voted.should.be.a('boolean');
        expect(body[0].player).to.be.undefined;
        res.status.should.equal(200);
        done();
      });
    });
  });

  it('should GET a publication with vote info', function(done) {
    bootstrapRequest('/api/me', 'get')
    .end(function(err, res) {
      var playerId = res.body._id;
      model.Vote.findOne({ player: playerId }, function(err, vote) {
        bootstrapRequest('/api/publications/' + vote.publication, 'get')
        .end(function(err, res) {
          if(err) { console.log(err); }
          expect(err).to.be.null;
          res.status.should.equal(200);
          var publication = res.body;
          publication.should.not.be.null;
          publication.should.be.a('object');
          publication.voted.should.be.true;
          expect(publication.player).to.be.undefined;
          publication.votedTags.should.be.a('array');
          done();
        });
      });
    });
  });

  it('should GET a list of votes for a give publication', function(done) {
    util.findModelId(model.Publication, function(err, publicationId) {
      if(err) { console.log(err); }
      bootstrapRequest('/api/publications/' + publicationId + '/votes', 'get')
      .end(function(err, res) {
        if(err){ console.log(err); }
        expect(err).to.be.null;
        var body = res.body;
        body.should.be.a('array');
        res.status.should.equal(200);
        done();
      });
    });
  });

  it('should GET a list of comments for a give publication', function(done) {
    util.findModelId(model.Publication, function(err, publicationId) {
      if(err) { console.log(err); }
      bootstrapRequest('/api/publications/' + publicationId + '/comments', 'get')
      .end(function(err, res) {
        if(err){ console.log(err); }
        expect(err).to.be.null;
        var body = res.body;
        body.should.be.a('array');
        res.status.should.equal(200);
        done();
      });
    });
  });

  it('should GET a list of all the tags available', function(done) {
    bootstrapRequest('/api/tags?active=true', 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      expect(err).to.be.null;
      var body = res.body;
      body.should.be.a('array');
      res.status.should.equal(200);
      done();
    });
  });

  it('should GET a list of searched songs', function(done) {
    var artist = 'Chamillionaire';
    var name = 'Ridin\' Dirty';
    bootstrapRequest('/api/songs?artist=' + artist + '&name=' + name, 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      expect(err).to.be.null;
      var body = res.body;
      body.should.be.a('array');
      res.status.should.equal(200);
      body[0].artist.should.be.equal(artist);
      done();
    });
  });

  it('should GET a list of searched songs from youtube', function(done) {
    var artist = 'Periphery';
    var name = 'Icarus Lives';
    bootstrapRequest('/api/songs/youtube?artist=' + artist + '&name=' + name, 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      expect(err).to.be.null;
      var body = res.body;
      body.should.be.a('array');
      body[0].title.should.be.a('string');
      body[0].youtubeId.should.be.a('string');
      res.status.should.equal(200);
      done();
    });
  });

  // it('should get artist info', function(done) {
  //   var artist = 'hozier';
  //   bootstrapRequest('/api/search/artists?artist=' + artist, 'get')
  //   .end(function(err, res) {
  //     if(err) { console.log(err); }
  //     var body = res.body;
  //     res.status.should.equal(200);
  //     body.should.be.a('array');
  //     body.length.should.be.above(0);
  //     done();
  //   });
  // });

  // it('should get songs from artist', function(done) {
  //   var artistId = '/en/the_beatles';
  //   var song = 'Yesterday';
  //   bootstrapRequest('/api/search/songs?artistId=' + artistId + '&song=' + song, 'get')
  //   .end(function(err, res) {
  //     if(err) { console.log(err); }
  //     var body = res.body;
  //     res.status.should.equal(200);
  //     body.should.be.a('array');
  //     body.length.should.be.above(0);
  //     done();
  //   });
  // });

  it('should GET the queue of songs of the player', function(done) {
    bootstrapRequest('/api/queue?populate=true', 'get')
    .end(function(err, res) {
      if(err) { console.log(err); }
      expect(err).to.be.null;
      var body = res.body;
      body.should.be.a('array');
      expect(body.length).to.be.above(0);
      body[0].name.should.be.a('string');
      res.status.should.equal(200);
      done();
    });
  });

  it('should POST an exisiting song to the player queue', function(done) {
    model.Song.findOne({ name: 'Ridin\' Dirty' }, function(err, song) {
      bootstrapRequest('/api/queue', 'post')
      .send({ song: song })
      .end(function(err, res) {
        if(err) { console.log(err); }
        var songResponse = res.body;
        res.status.should.equal(200);
        expect(err).to.be.null;
        expect(JSON.stringify(song)).to.equal(JSON.stringify(songResponse));
        done();
      });
    });
  });

  it('should POST a new song to the player queue', function(done) {
    var song = { name: 'Icarus Lives!', artist: 'Periphery', youtubeId: '23hhx342', freebaseId: '1', lastfmId: '2' };
    bootstrapRequest('/api/queue', 'post')
    .send({ song: song })
    .end(function(err, res) {
      if(err) { console.log(err); }
      var songResponse = res.body;
      res.status.should.equal(200);
      expect(err).to.be.null;
      assertProperty(songResponse, 'string', '_id');
      assertProperty(songResponse, 'string', 'name');
      assertProperty(songResponse, 'string', 'artist');
      assertProperty(songResponse, 'string', 'youtubeId');
      assertProperty(songResponse, 'string', 'freebaseId');
      assertProperty(songResponse, 'string', 'lastfmId');
      done();
    });
  });

  it('should DELETE an exisiting song of the player queue', function(done) {
    model.Song.findOne({ name: 'Ridin\' Dirty' }, function(err, song) {
      bootstrapRequest('/api/queue/' + song._id, 'delete')
      .end(function(err, res) {
        if(err) { console.log(err); }
        var songResponse = res.body;
        res.status.should.equal(200);
        expect(err).to.be.null;
        done();
      });
    });
  });

  it('should PUT a vote', function(done) {
    util.findModelId(model.Publication, function(err, publicationId) {
      if(err) { console.log(err); }
      util.findABunchOfTagsIds(function(err, tags) {
        if(err) { console.log(err); }
        var voteJSON = { comment: 'This is a comment hue', publication: publicationId, tags: tags };
        bootstrapRequest('/api/votes', 'put')
        .send({ vote: voteJSON })
        .end(function(err, res) {
          if(err) { console.log(err); }
          var vote = res.body;
          res.status.should.equal(200);
          expect(err).to.be.null;
          vote.should.not.be.null;
          vote.should.be.a('object');
          new Date(vote.date).should.be.a('date');
          vote.tags.should.not.be.null;
          assertProperty(vote, 'string', 'comment');
          assertProperty(vote, 'string', 'publication');
          assertProperty(vote, 'string', 'player');
          assertProperty(vote, 'Array', 'tags');
          done();
        });
      });
    });
  });

  it('should PUT a comment', function(done) {
    util.findModelId(model.Publication, function(err, publicationId) {
      if(err) { console.log(err); }
      var commentJson = { comment: 'This is a comment hue', publication: publicationId };
      bootstrapRequest('/api/comments', 'put')
      .send({ comment: commentJson })
      .end(function(err, res) {
        if(err){ console.log(err); }
        var comment = res.body;
        res.status.should.equal(200);
        expect(err).to.be.null;
        comment.should.not.be.null;
        comment.should.be.a('object');
        new Date(comment.date).should.be.a('date');
        assertProperty(comment, 'string', 'comment');
        assertProperty(comment, 'string', 'publication');
        assertProperty(comment, 'string', 'player');
        done();
      });
    });
  });

  // TO DO
  it('should POST a comment', function(done) {
    done();
  });

  it('should POST a vote', function(done) {
    done();
  });
});

function bootstrapRequest(url, method) {
  return request(app)[method](url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken);
}

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

  return request('http://oauth.planum.com')
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