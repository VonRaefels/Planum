var async = require('async');
var request = require('supertest');
var app = require("../app");
var expect = require('chai').expect;
var assert = require('chai').assert;
var storage = require('../domain/storage');
var model = require('../domain/model');
var util = require('../util');
var should = require('chai').should();
var assertProperty = util.assertProperty;


var playerId;
var publicationId;
var tags;
describe('Storage', function() {
  before(function(done){
    function doDump(cb) {
      util.dumpDummyData(function(err) {
        cb(err, '');
      });
    }
    function doFindPlayer(cb) {
      util.findModelId(model.Player, function(err, _playerId) {
        playerId = _playerId;
        cb(err, '');
      });
    }
    function doFindPublication(cb) {
      util.findModelId(model.Publication, function(err, _publicationId) {
        publicationId = _publicationId;
        cb(err, '');
      });
    }
    function doFindTags(cb) {
      util.findABunchOfTagsIds(function(err, _tags) {
        tags = _tags;
        cb(err, '');
      });
    }
    async.series(
      [doDump, doFindPlayer, doFindPublication, doFindTags],
      function(err, results) { if(err) { console.log(err); } done(); }
    );
  });

  it('should save a new comment', function(done) {
    var commentJSON = { comment: 'This is a comment hue', publication: publicationId, player: playerId };
    storage.saveComment(commentJSON, function(err, comment) {
      if(err) { console.log(err); }
      err.should.be.equal(false);
      expect(comment).not.to.be.null;
      comment.should.be.a('object');
      model.Comment.findById(comment._id, function(err, foundComment) {
        expect(err).to.be.null;
        expect(foundComment).not.to.be.null;
        assert(foundComment.comment == comment.comment, 'Assert properties are equal');
        assert(foundComment.player.toString() == comment.player.toString(), 'Assert properties are equal');
        assert(foundComment.publication.toString() == comment.publication.toString(), 'Assert properties are equal');
        done();
      });
    });
  });

  it('should save a new vote', function(done) {
    var voteJSON = { comment: 'This is a comment hue', publication: publicationId, player: playerId, tags: tags };
    storage.saveVote(voteJSON,function(err, vote) {
      if(err) { console.log(err); }
      err.should.be.equal(false);
      expect(vote).not.to.be.null;
      vote.should.be.a('object');
      model.Vote.findById(vote._id, function(err, foundVote) {
        expect(err).to.be.null;
        expect(foundVote).not.to.be.null;
        foundVote.should.be.a('object');
        assert(foundVote.comment == vote.comment, 'Assert properties are equal');
        assert(foundVote.player.toString() == vote.player.toString(), 'Assert properties are equal');
        assert(foundVote.publication.toString() == vote.publication.toString(), 'Assert properties are equal');
        //tags...
        done();
      });
    });
  });

  it('should save an existing vote', function(done) {
    util.findModelId(model.Vote, function(err, id) {
      var voteJSON = { _id: id, comment: 'Modified', publication: publicationId, player: playerId, tags: tags };
      storage.saveVote(voteJSON,function(err, vote) {
        if(err) { console.log(err); }
        err.should.be.equal(false);
        expect(vote).not.to.be.null;
        vote.should.be.a('object');
        model.Vote.findById(vote._id, function(err, foundVote) {
          expect(err).to.be.null;
          expect(foundVote).not.to.be.null;
          foundVote.should.be.a('object');
          assert(foundVote.comment == vote.comment, 'Assert properties are equal');
          assert(foundVote.player.toString() == vote.player.toString(), 'Assert properties are equal');
          assert(foundVote.publication.toString() == vote.publication.toString(), 'Assert properties are equal');
          foundVote.tags.length.should.be.equal(tags.length);
          done();
        });
      });
    });
  });

  it('should update song queue with an existing song', function(done) {
    model.Song.findOne({ name: 'Ridin\' Dirty' }, function(err, song) {
      if(err) { console.log(err); }
      storage.addSongToQueue(playerId, song, function(err, savedSong) {
        err.should.be.equal(false);
        storage.findSongQueueByUser(playerId, false, function(err, queue) {
          assert(queue.songs.indexOf(song._id) != 1, 'song should be in the queue');
          done();
        });
      });
    });
  });

  it('should update song queue with a new song', function(done) {
    var song = { name: 'Bullet in the head', artist: 'Rage Against the machine', youtubeURL: '', freebaseId: '1', lastfmId: '2' };
    storage.addSongToQueue(playerId, song, function(err, savedSong) {
      err.should.be.equal(false);
      storage.findSongQueueByUser(playerId, false, function(err, queue) {
        assert(queue.songs.indexOf(savedSong._id) != 1, 'song should be in the queue');
        done();
      });
    });
  });

  it('should delete a song from  the user queue', function(done) {
    model.SongQueue.findOne({}, function(err, queue) {
      var userId = queue.player;
      var songId = queue.songs[0];
      storage.deleteQueueSong(userId, songId, function(err, updatedQueue) {
        expect(err).to.be.null;
        expect(updatedQueue).not.to.be.null;
        queue.songs.length.should.equal(updatedQueue.length + 1);
        expect(updatedQueue.indexOf(songId)).to.equal(-1);
        done();
      });
    });
  });

  //TO DO check if the game is addded to the user.
  it('should create a new game for a player', function(done) {
    var game = { name: 'Djent metal', players: [playerId] };
    storage.createGameForPlayer(playerId, game, function(err, games) {
      if(err) { console.log(err); }
      expect(err).to.be.false;
      expect(games).not.to.be.null;
      games.should.be.a('array');
      done();
    });
  });

});
