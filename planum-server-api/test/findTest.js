var request = require('supertest');
var app = require("../app");
var expect = require('chai').expect;
var assert = require('chai').assert;
var storage = require('../domain/storage');
var model = require('../domain/model');
var util = require('../util');
var should = require('chai').should();
var assertProperty = util.assertProperty;

describe('Storage', function() {
  before(function(done){
    util.dumpDummyData(function(err) {
      if(err) { console.log(err); return; }
      done();
    });
  });

  it('should find the game for a give playerId', function(done) {
    function cb(err, game) {
      if(err) { console.log(err); }
      err.should.be.equal(false);
      expect(game).not.to.be.null;

      assertProperty(game, 'string', 'name');
      assertProperty(game, 'Boolean', 'active');
      assertProperty(game, 'Array', 'players');
      game.players.length.should.be.above(0);

      game.players.forEach(function(player) {
        player.should.be.a('object');
      });
      done();
    };

    util.findModelId(model.Player, function(err, id) {
      if(err) { console.log(err); }
      storage.findPlayerGame(id, cb);
    });
  });

  it('should find the active publications of the current round given a game', function(done) {
    function cb(err, publications) {
      if(err) { console.log(err); }

      err.should.be.equal(false);
      expect(publications).not.to.be.null;
      publications.should.be.a('Array');

      publications.forEach(function(publication) {
        expect(publications).not.to.be.null;
        publication.should.be.a('object');

        assertProperty(publication, 'object', 'song');
        assertProperty(publication, 'Date', 'date');
      });
      done();
    }

    util.findModelId(model.Game, function(err, id) {
      if(err) { console.log(err); }
      model.Game.findById(id, function(err, game) {
        if(err) { console.log(err); }
        var populate = true;
        storage.findActivePublicationsByGame(game, populate, cb);
      });
    })
  });

  it('should find a single publicaction by Id', function(done) {
    model.Vote.findOne({}, function(err, vote) {
      if(err) { console.log(err); }
      storage.findPublication(vote.publication, vote.player, function(err, publication) {
        expect(err).to.be.equal(false);
        publication.should.be.a('object');
        done();
      });
    });
  });

  it('should find the tags of a publication', function(done) {
    model.Game.findOne({}, function(err, game) {
      model.Publication.findOne({ round: game.activeRound }, function(err, publication) {
        publication.getTags(game.players[0], function(err, tags) {
          expect(err).not.to.be.null;
          expect(tags).not.to.be.null;
          tags.should.be.a('array');
          tags.length.should.be.above(0);
          tags[0].should.be.a('object');
          done();
        });
      });
    });
  });

  it('should find all tags available', function(done) {
    function cb(err, tags) {
      if(err) { console.log(err); }
      err.should.be.equal(false);

      tags.should.be.a('Array');
      tags.length.should.be.above(0);

      tags.forEach(function(tag) {
        tag.should.be.a('object');
        assertProperty(tag, 'string', 'name');
        assertProperty(tag, 'string', 'imgLink');
        assertProperty(tag, 'Boolean', 'active')
        assertProperty(tag, 'Number', 'value');
      });

      done();
    }
    storage.findActiveTags(cb);
  });

  it('should find the votes of a publication', function(done) {
    function cb(err, votes) {
      if(err) { console.log(err); }
      err.should.be.equal(false);

      votes.should.be.a('Array');
      votes.length.should.be.above(0);
      votes.forEach(function(vote) {
        vote.should.be.a('object');
        assertProperty(vote, 'string', 'comment');
        assertProperty(vote, 'object', 'player');
        assertProperty(vote, 'object', 'publication');
        assertProperty(vote, 'date', 'date');
        assertProperty(vote, 'Array', 'tags');
      });

      done();
    }

    util.findPublicationBySongName('Nocturne', function(err, pub) {
      if(err) { console.log(err); }
      storage.findVotesByPublicationId(pub._id, cb);
    });
  });

  it('should find comments of a publication', function(done) {
    function cb(err, comments) {
      if(err) { console.log(err); }
      err.should.be.equal(false);

      comments.should.be.a('Array');
      comments.length.should.be.above(0);
      comments.forEach(function(comment) {
        comment.should.be.a('object');
        assertProperty(comment, 'string', 'comment');
        assertProperty(comment, 'object', 'player');
        assertProperty(comment, 'date', 'date');
        assertProperty(comment, 'object', 'publication');
      });

      done();
    }

    util.findPublicationBySongName('Nocturne', function(err, pub) {
      if(err) { console.log(err); }
      storage.findCommentsByPublicationId(pub._id, cb);
    });
  });

  it('should find a the song queue of the given user', function(done) {
    util.findModelId(model.Player, function(err, id) {
      if(err) { console.log(err); }
      storage.findSongQueueByUser(id, true, function(err, songQueue) {
        if(err) { console.log(err); }
        expect(err).to.be.false;
        songQueue.should.be.a('object');
        assertProperty(songQueue, 'object', 'player');
        assertProperty(songQueue, 'array', 'songs');
        assertProperty(songQueue.songs[0], 'string', 'artist');
        assertProperty(songQueue.songs[0], 'string', 'name');
        done();
      });
    });
  });

  it('should find a song on the database given the input song', function(done) {
    var song = { artist: 'Chamillionaire', name: 'Ridin\' Dirty' }
    storage.searchSongs(song, function(err, songs) {
      if(err) { console.log(err); }
      expect(err).to.be.false;
      songs.should.not.be.null;
      songs.should.be.a('array');
      expect(songs.length).to.be.above(0);
      songs[0].artist.should.be.equal(song.artist);
      done();
    });
  });

  it('should find the players of a game', function(done) {
    util.findModelId(model.Game, function(err, id) {
      if(err) { console.log(err); }
      storage.findPlayersByGame(id, function(err, players) {
        if(err) { console.log(err); }
        expect(err).to.be.false;
        expect(players).not.to.be.null;
        players.should.be.a('array');
        expect(players.length).to.be.above(0);
        players[0].name.should.be.a('string');
        done();
      });
    })
  });
});

