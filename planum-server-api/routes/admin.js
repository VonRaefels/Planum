var express = require('express');
var router = express.Router();
var model = require('../domain/model');
var util = require('../util');
var config = require('../config');
var ObjectId = require('mongoose').Types.ObjectId;
var savePlayer = require('../domain/storage').savePlayer;

router.get('/users/me', function(req, res) {
  model.Player.findById(ObjectId(req.user)).populate('oauthuser').exec(function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var user = player.toObject();
    user.email = player.oauthuser.email;
    user.firstName = player.oauthuser.firstname;
    user.lastName = player.oauthuser.lastname;
    user.admin = player.oauthuser.admin;
    delete user.oauthuser;
    res.json({ user: user});
  });
});

router.get('/players', function(req, res) {
  model.Player.find({}).populate('oauthuser').exec(function(err, players) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var playersJson = util.mongoArrayToJsonArray(players);
    function convertPlayer(player) {
      var _player = player;
      _player.email = player.oauthuser.email;
      _player.firstName = player.oauthuser.firstname;
      _player.lastName = player.oauthuser.lastname;
      _player.admin = player.oauthuser.admin;
      delete _player.oauthuser;
      return _player;
    }

    res.json({ players: playersJson.map(convertPlayer) });
  });
});

// TO DO check user not found.
router.get('/players/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  model.Player.findById(id, function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    findUserAndJoin(player, function(err, playerJson) {
      if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      res.json({ player: playerJson });
    });
  });
});

router.put('/players/:id', function(req, res) {
  var data = req.body.player;
  data._id = req.params.id;
  savePlayer(data, function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ player: player });
  });
});

router.post('/players', function(req, res) {
  var data = req.body.player;
  savePlayer(data, function(err, player) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ player: player });
  });
});

router.delete('/players/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  model.Player.findById(ObjectId(id), function(err, player) {
    model.Game.findOneAndUpdate({ _id: ObjectId(player.activeGame) },
      { $pull: { "players": { $in: [player._id] } } },
      { multi: false, upsert: false, safe: true }, function(err) {
        if(err) { return res.send(500, { error: 'Unexpected server error' }); }
        player.remove(function(err, _player) {
          model.OAuthUsersModel.find({ _id: id }).remove(function(err) {
            if(err) { return res.send(500, { error: 'Unexpected server error' }); }
            res.json({});
          });
        });
      });
  });
});

router.get('/games', function(req, res) {
  model.Game.find({}, function(err, games) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var gamesJson = util.mongoArrayToJsonArray(games);
    gamesJson.map(function(game) { game.id = game._id; delete game._id; return game; });
    res.json({ games: games });
  });
});

router.get('/games/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  model.Game.findById(id, function(err, game) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ game: game });
  });
});

Array.prototype.diff = function(a) {
    return this.filter(function(i) { return a.indexOf(i) < 0; });
};

router.put('/games/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  var newGame = req.body.game;
  model.Game.findById(id, function(err, game) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    var players = game.toObject().players.map(function(item) { return item.toString(); });
    var newPlayers = newGame.players;
    if(newPlayers.length == players.length) {
      findAndUpdateGame(id, newGame, req, res);
    }else if(newPlayers.length < players.length) {
      var deletedPlayers = players.diff(newPlayers).map(function(item) { return ObjectId(item); });
      updatePlayersGame(deletedPlayers, null, function(err) {
        if(err) { return res.send(500, { error: 'Unexpected server error' }); }
        findAndUpdateGame(id, newGame, req, res);
      })
    }else {
      var _newPlayers = newPlayers.map(function(item) { return ObjectId(item); });
      updatePlayersGame(_newPlayers, id, function(err) {
        if(err) { return res.send(500, { error: 'Unexpected server error' }); }
        findAndUpdateGame(id, newGame, req, res);
      });
    }
  });
});

function findAndUpdateGame(id, game, req, res) {
  model.Game.findOneAndUpdate({ _id: id }, game, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      game._id = req.params.id
      res.json({ game: game });
  });
}

function updatePlayersGame(players, game, cb) {
  model.Player.update({ _id: { $in: players } }, { activeGame: game }, { multi: true }, function(err) {
    cb(err);
  });
}

router.post('/games', function(req, res) {
  var id = ObjectId();
  var game = req.body.game;
  model.Game.findOneAndUpdate({ _id: id }, game, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      game._id = id;
      res.json({ game: game });
  });
});

router.get('/tags', function(req, res) {
  model.Tag.find({}, function(err, tags) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ tags: tags });
  });
});

router.put('/tags/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  var tag = req.body.tag;
  model.Tag.findOneAndUpdate({ _id: id }, tag, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      tag._id = req.params.id;
      res.json({ tag: tag });
  });
});

router.post('/tags', function(req, res) {
  var id = ObjectId();
  var tag = req.body.tag;
  model.Tag.findOneAndUpdate({ _id: id }, tag, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      tag._id = id;
      res.json({ tag: tag });
  });
});

router.delete('/tags/:id', function(req, res) {
  var id = req.params.id;
  model.Tag.findById(ObjectId(id)).remove(function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({});
  });
});

router.delete('/songs/:id', function(req, res) {
  var id = req.params.id;
  model.Song.findById(ObjectId(id)).remove(function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({});
  });
});

router.get('/songs', function(req, res) {
  model.Song.find({}, function(err, songs) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ songs: songs });
  });
});

router.get('/songs/:id', function(req, res) {
  model.Song.findById(ObjectId(req.params.id), function(err, song) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json({ song: song });
  });
});

router.put('/songs/:id', function(req, res) {
  var id = ObjectId(req.params.id);
  var song = req.body.song;
  model.Song.findOneAndUpdate({ _id: id }, song, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      song._id = req.params.id;
      res.json({ song: song });
  });
});

router.post('/songs', function(req, res) {
  var id = ObjectId();
  var song = req.body.song;
  model.Song.findOneAndUpdate({ _id: id }, song, { multi: false, upsert: true }, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
      song._id = id;
      res.json({ song: song });
  });
});



function findUserAndJoin(player, cb) {
  model.OAuthUsersModel.findById(player._id, function(err, user) {
    if(err) { return cb(err, null); }
    var playerJson = player.toObject();
    playerJson.firstName = user.firstname;
    playerJson.lastName = user.lastname;
    playerJson.email = user.email;
    playerJson.admin = user.admin;
    // config.applyUrl(playerJson.thumbLink, playerJson, 'thumbLink');
    cb(false, playerJson);
  });
}

module.exports = router;
