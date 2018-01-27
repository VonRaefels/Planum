var storage = require('../domain/storage');
var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config');
var util = require('../util');
var async = require('async');
var Youtube = require("../youtube");
var freebase = require('freebase');
var MusicInfo = require('../music');
var musicInfo = new MusicInfo();

Youtube.authenticate({
  type: 'key',
  key: config.youtubeClient
});

router.get('/me', function(req, res) {
  storage.findPlayer(ObjectId(req.user), true, function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var playerJson = player.toObject();
    // config.applyUrl(player.thumbLink, playerJson, 'thumbLink');
    return res.json(cleanPlayer(playerJson));
  });
});

router.get('/players/:id', function(req, res) {
 storage.findPlayer(ObjectId(req.params.id), true, function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var playerJson = player.toObject();
    // config.applyUrl(player.thumbLink, playerJson, 'thumbLink');
    return res.json(cleanPlayer(playerJson));
  });
});

router.get('/players', function(req, res) {
  storage.findPlayerGame(ObjectId(req.user), function(err, gameModel) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    storage.findPlayersByGame(gameModel._id, function(err, playersMongo) {
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      var players = util.mongoArrayToJsonArray(playersMongo);
      var cleanPlayers = players.map(function(player) {
        return cleanPlayer(player);
      });
      return res.json(players);
    });
  });
});

router.put('/players', function(req, res) {
  var data = req.body;
  if(data._id === undefined) { return res.send(400, { error: 'No id was found'}); }
  if(data._id == req.user) {
    storage.updatePlayer(data, function(err, player) {
      delete player.password;
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      res.json(player);
    });
  }else {
    return res.send(400, { erro: 'No id was found'});
  }
});

router.post('/chooseGame', function(req, res) {
  var data = req.body;
  if(data.player === undefined) { return res.send(400, { error: 'No id was found'}); }
  if(data.player == req.user) {
    storage.chooseGame(data, function(err, response) {
      if(response.activeGame === undefined) {
        response.activeGame = '';
      }
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      res.json(response);
    });
  }else {
    return res.send(400, { erro: 'No id was found'});
  }
});

// router.post('/search/players', function(req, res) {})

function cleanPlayer(player) {
  player.firstName = player.oauthuser.firstname;
  player.email = player.oauthuser.email;
  player.lastName = player.oauthuser.lastname;
  delete player.oauthuser;
  return player;
}

router.get('/game', function(req, res) {
  storage.findPlayerGame(ObjectId(req.user), function(err, gameModel) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var game = gameModel.toObject();
    config.applyUrl('/rounds/' + game.activeRound, game, 'activeRound');
    config.applyUrlToIdArray('/rounds/:id', game.rounds);
    config.applyUrlToIdArray('/player/:id', game.players);
    return res.json(game);
  });
});

router.post('/game', function(req, res) {
  var user = ObjectId(req.user);
  var game = req.body;
  storage.createGameForPlayer(user, game, function(err, games) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json(games);
  });
});

router.get(/^\/rounds\/(\w+)(\/publications)*$/, function(req, res) {
  var user = ObjectId(req.user);
  storage.findPublicationsByRound(req.params[0], true, function(err, publicationsMongo) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var publicationsJson = [];
    async.each(publicationsMongo, function(publication, callback) {
      publication.getTags(user, function(err, tags) {
        if(err) {
          callback(err)
        }else {
          var publicationJson = publication.toObject();
          publicationJson.voted = tags.length > 0;
          delete publicationJson.player;
          publicationsJson.push(publicationJson);
          callback();
        }
      });
    }, function(err) {
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      config.applyUrl('/round/:id', publicationsJson, 'round');
      return res.json(publicationsJson);
    });
  });
});


router.get('/publications/:id', function(req, res) {
  var user = ObjectId(req.user);
  var publicationId = ObjectId(req.params.id);
  storage.findPublication(publicationId, user, function(err, publication) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    publication.getTags(user, function(err, tags){
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      var publicationJson = publication.toObject();
      publicationJson.voted = tags.length > 0;
      publicationJson.votedTags = tags;
      delete publicationJson.player;
      return res.json(publicationJson);
    });
  });
});

router.get('/publications/:id/votes', function(req, res) {
  storage.findVotesByPublicationId(req.params.id, function(err, votesMongo) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var votes = util.mongoArrayToJsonArray(votesMongo);
    config.applyUrl('/player/:id', votes, 'player');
    config.applyUrl('/publication/:id', votes, 'publication');
    return res.json(votes);
  });
});

router.get('/publications/:id/comments', function(req, res) {
  storage.findCommentsByPublicationId(req.params.id, function(err, commentsMongo) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var commments = util.mongoArrayToJsonArray(commentsMongo);
    config.applyUrl('/player/:id', commments, 'player');
    config.applyUrl('/publication/:id', commments, 'publication');
    return res.json(commments);
  });
});

router.get('/tags', function(req, res) {
  var active = req.query.active;
  if(active === undefined || active == 'true') {
    storage.findActiveTags(function(err, tags) {
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      // TO DO parse img urls...
      return res.json(tags);
    });
  }else {
    return res.send(501, { error: 'Not implemented yet'} );
  }
});

router.get('/queue', function(req, res) {
  var user = ObjectId(req.user);
  var populate = req.query.populate === 'true';
  storage.findSongQueueByUser(user, populate, function(err, queue) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    return res.json(queue.songs);
  });
});

router.post('/queue', function(req, res) {
  var user = ObjectId(req.user);
  var song = req.body.song;
  if(song === undefined) { return res.send(400, { error: 'No json was sent' }); }
  if(song._id === undefined) {
    //TO DO assert correct properties of song.
    storage.saveSong(song, function(err, songMongo) {
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      doUpdateQueue(user, songMongo, res);
    });
  }else {
    doUpdateQueue(user, song, res);
  }
});

router.delete('/queue', function(req, res) {

});

router.delete('/queue/:id', function(req, res) {
  var songId = ObjectId(req.params.id);
  var userId = ObjectId(req.user);
  storage.deleteQueueSong(userId, songId, function(err, queue) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json(queue);
  });
});

router.get('/songs', function(req, res) {
  var artist = req.query.artist || '';
  var name = req.query.name || '';
  if(artist === '' && name === '') {
    return res.json([]);
  }
  var song = { name: name, artist: artist };
  storage.searchSongs(song, function(err, songs) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    return res.json(songs);
  });
});

router.get('/songs/youtube', function(req, res) {
  var artist = req.query.artist || '';
  var name = req.query.name || '';
  if(artist === '' && name === '') {
    return res.json([]);
  }
  var song = { name: name, artist: artist };
  Youtube.search.list({
    'part': 'id, snippet',
    'q': artist + ' ' + name
  }, function(err, data) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json(parseYoutubeData(data));
  });
});

router.get('/search/artists', function(req, res) {
  var artist = req.query.artist || '';
  if(artist === '') {
    return res.json([]);
  }
  musicInfo.searchArtist(artist, function(data) {
    res.json(data);
  });
});

router.get('/search/songs', function(req, res) {
  var song = req.query.song || '';
  var artistId = req.query.artistId || '';
  if(artistId === '') {
    return res.json([]);
  }
  musicInfo.searchSong(song, { id: artistId }, function(data) {
    res.json(data);
  });
});

function removeDuplicates(data, look) {
  var filtered = {};
  return data.filter(function(item) {
    var key = item[look];
    if(!filtered[key]) {
      filtered[key] = true;
      return true;
    }
    return false;
  });
}

function parseYoutubeData(data) {
  var songs = [];
  var items = data.items;
  items.forEach(function(item) {
    var song = {};
    song.youtubeId = item.id.videoId;
    song.title = item.snippet.title;
    songs.push(song);
  });
  return songs;
}

function doUpdateQueue(user, song, res) {
  storage.addSongToQueue(user, song, function(err) {
   if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    return res.json(song);
  });
}

router.put('/votes', function(req, res) {
  doSaveVote(req, res);
});

router.post('/votes', function(req, res) {
  doSaveVote(req, res);
});

router.put('/comments', function(req, res) {
  doSaveComment(req, res);
});

router.post('/comments', function(req, res) {
  doSaveComment(req, res);
});

function doSaveComment(req, res) {
  var comment = req.body.comment;
  comment.player = req.user;
  if(comment === undefined) { return res.send(400, { error: 'No json was sent' }); }
  storage.saveComment(comment, function(err, savedComment) {
    var commentJson = savedComment.toObject();
    config.applyUrl('/player/:id', commentJson, 'player');
    config.applyUrl('/publication/:id', commentJson, 'publication');
    return res.json(commentJson);
  });
}

function doSaveVote(req, res) {
  var vote = req.body.vote;
  vote.player = req.user;
  if(vote === undefined) { return res.send(400, { error: 'No json was sent' }); }
  storage.saveVote(vote, function(err, savedVote) {
    var voteJson = savedVote.toObject();
    config.applyUrl('/player/:id', voteJson, 'player');
    config.applyUrl('/publication/:id', voteJson, 'publication');
    return res.json(voteJson);
  });
}

module.exports = router;
