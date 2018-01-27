var mongoose = require('mongoose');
var storage = module.exports;
var model = require('./model');
var Schema = mongoose.Schema;
var ObjectId = require('mongoose').Types.ObjectId;

storage.findPlayer = function(id, populate, cb) {
  var query = model.Player.findById(id);
  if(populate) {
    query = query.populate('oauthuser').populate('games');
  }
  query.exec(function(err, player) {
    if(err) return cb(err, null);
    return cb(false, player);
  });
}

storage.findPlayerGame = function(id, cb) {
  model.Player.findById(id, function(err, player) {
    if(err) return cb(err, null);
    model.Game.findById(player.activeGame, function(err, game) {
      if(err) return cb(err, null);
      return cb(false, game);
    });
  });
}

// storage.createGameForPlayer = function(user, gameJson, cb) {
//   var round = new model.Round();
//   round.save(function(err) {
//     gameJson.rounds = [round._id];
//     gameJson.activeRound = round._id;
//     gameJson.active = true;
//     gameJson.rounds = [round._id];
//     var query = model.Player.find({});
//     query.select('_id');
//     query.exec(function(err, players) {
//       console.log(players);
//       if(err) return cb(err, null);
//       gameJson.players = players;
//       var game = new model.Game(gameJson);
//       game.save(function(err) {
//         if(err) return cb(err, null);
//         model.Player.update({}, { $push: { 'games': game._id } }, function(err) {
//           storage.findPlayer(user, true, function(err, player) {
//             if(err) return cb(err, null);
//             return cb(false, player.games);
//           });
//         });
//       });
//     });
//   });
// }

//Check if user already has game...
storage.createGameForPlayer = function(user, gameJson, cb) {
  model.Game.findOne({ 'name': gameJson.name }, function(err, _game) {
    if(_game == null) {
      var round = new model.Round();
      round.save(function(err) {
        gameJson.rounds = [round._id];
        gameJson.activeRound = round._id;
        gameJson.active = true;
        gameJson.rounds = [round._id];
        gameJson.players = [user];
        var game = new model.Game(gameJson);
        game.save(function(err) {
          if(err) return cb(err, null);
          model.Player.update({ _id: user }, { $push: { 'games': game._id } }, function(err) {
            storage.findPlayer(user, true, function(err, player) {
              if(err) return cb(err, null);
              return cb(false, player.games);
            });
          });
        });
      });
    }else {
      model.Player.update({ _id: user }, { $push: { 'games': _game._id } }, function(err) {
        storage.findPlayer(user, true, function(err, player) {
          if(err) return cb(err, null);
          return cb(false, player.games);
        });
      });
    }
  });
}

storage.findPlayersByGame = function(gameId, cb) {
  model.Game.findById(gameId).populate('players').exec(function(err, game) {
    model.Player.populate(game.players, { path: 'oauthuser' }, function(err, players) {
      if(err) return cb(err, null);
      return cb(false, players);
    })
  });
}

storage.savePlayer = function(data, cb) {
  var player = {};
  var id = ObjectId();

  var gameName = data.game;
  model.Game.findOne({ 'name': gameName }, function(err, game) {
    if(data._id !== undefined) {
      id = ObjectId(data._id);
    }else {
      data._id = id;
    }
    player.name = data.name;
    player.thumbLink = data.thumbLink;
    player.oauthuser = id;
    player.activeGame = game._id;
    player.games = [game._id];
    addPlayerToGame(game._id, id, function(err) {
      if(err) { return cb(err, null); }
      var user = {};
      user.username = data.name;
      user.firstname = data.firstName;
      user.lastname = data.lastName;
      user.email = data.email;
      user.password = data.password;

      var queue = new model.SongQueue({ songs: [], player: id });
      queue.save(function(err) {
        if(err) { return cb(err, null); }
        model.Player.findOneAndUpdate({ _id: id }, player, { multi: false, upsert: true }, function(err) {
          if(err) { return cb(err, null); }
          model.OAuthUsersModel.findOneAndUpdate({ _id: id }, user, { multi: false, upsert: true }, function(err) {
            if(err) { return cb(err, null); }
            delete data.password;
            data.activeGame = player.activeGame;
            data.games = player.games;
            delete data.game;
            cb(false, data);
          });
        });
      });
    });
  });
}

//TO DO Update OAuthuser too
// storage.updatePlayer = function(data, cb) {

//   model.Player.findOneAndUpdate({ _id: ObjectId(data._id) }, data, { multi: false, upsert: false }, function(err) {
//     if(err) { return cb(err, null); }
//     cb(false, data);
//   })
// }

storage.chooseGame = function(data , cb) {
  model.Player.findOne({ _id: data.player }, function(err, player) {
    if(err) { return cb(err, null); }
    if(data.game == '') {
      var index = player.games.indexOf(player.activeGame);
      removePlayerFromGame(player.activeGame, player._id, function(err) {
        if(err) { return cb(err, null); }
        player.activeGame = undefined;
        player.games.splice(index, 1);
        player.save(function(err) {
          if(err) { return cb(err, null); }
          return cb(false, player);
        });
      });
    }else {
      player.activeGame = data.game;
      addPlayerToGame(player.activeGame, player._id, function(err) {
        if(err) { return cb(err, null); }
        player.save(function(err) {
          if(err) { return cb(err, null); }
          cb(false, player);
        });
      });
    }
  });
}

function addPlayerToGame(gameId, playerId, cb) {
  model.Game.findById(gameId, function(err, game) {
    if(game == null || err) { return cb(err); }
    var index = game.players.indexOf(playerId);
    if(index == -1) {
      game.players.push(playerId);
      game.save(function(err) {
        if(err) { return cb(err); }
        cb(false);
      });
    }else {
      cb(false);
    }
  });
}

function removePlayerFromGame(gameId, playerId, cb) {
  model.Game.findById(gameId, function(err, game) {
    if(game == null || err) { return cb(err); }
    var index = game.players.indexOf(playerId);
    game.players.splice(index, 1);
    game.save(function(err) {
      if(err) { return cb(err); }
      cb(false);
    });
  });
}

storage.findActivePublicationsByGame = function(game, populate, cb) {
  var activeRound = game.activeRound;
  if (activeRound === undefined || activeRound == null) { return cb(false, []); }
  storage.findPublicationsByRound(activeRound, populate, cb);
}

storage.findPublicationsByRound = function(roundId, populate, cb) {
  model.Round.findById(roundId, function(err, round) {
    if(err) { return cb(err, null); }
    if(!populate) {  return cb(false, round.publications); }
    model.Publication.find({ '_id': { $in: round.publications } }).populate('song').exec(function(err, publications){
      if(err) { return cb(err, null); }
      return cb(false, publications)
    });
  });
}

storage.findPublication = function(publicationId, playerId, cb) {
  model.Publication.findById(publicationId).populate('song').exec(function(err, publication) {
    if(err) { return cb(err, null); }
    cb(false, publication);
  });
}

storage.findSongQueueByUser = function(userId, populate, cb) {
  var query = model.SongQueue.findOne({ player: userId });
  if(populate) {
    query = query.populate('songs');
  }
  query.exec(function(err, songList) {
    if(err) { return cb(err, null); }
    return cb(false, songList);
  });
}

storage.deleteQueueSong = function(userId, songId, cb) {
  model.SongQueue.findOneAndUpdate({ player: userId },
        { $pull: { "songs": { $in: [songId] } } },
      { multi: false, upsert: false, safe: true }, function(err, queue) {
        if(err) { return cb(err, null); }
        model.SongQueue.populate(queue, { path: 'songs' }, function(err, populatedQueue) {
          cb(err, populatedQueue.songs);
        });
      });
}

/***
  Uses text indexes to search across artist and song name,
  by splitting the words of the sentence. TO DO improve the search
  using regular expressions. Sort list of coincidences...
***/
// storage.searchSongs = function(song, cb) {
//   model.Song.find({ $text: { $search: song.artist + ' ' + song.name } }, function(err, songs) {
//     if(err) { return cb(err, null); }
//     return cb(false, songs);
//   });
// }

/*
 * Strict search mode...
 */
storage.searchSongs = function(song, cb) {
  model.Song.find({ artist: song.artist, name: song.name }, function(err, songs) {
    if(err) { return cb(err, null); }
    return cb(false, songs);
  });
}

storage.addSongToQueue = function(player, songJSON, cb) {
  var song = new model.Song(songJSON);
  if(song._id === undefined) {
    song.save(function(err, savedSong) {
      if(err) { return cb(err, null); }
      return storage._addSongToQueue(player, savedSong, cb);
    });
  }
  return storage._addSongToQueue(player, song, cb);
}

storage._addSongToQueue = function(player, song, cb) {
  model.SongQueue.update({ player: player }, { $push: { 'songs': song._id } }, function(err) {
    if(err) { return cb(err, null); }
    return cb(false, song);
  });
}

storage.findActiveTags = function(cb) {
  model.Tag.find({ active: true }, function(err, tags) {
    if(err) { return cb(err, null); }
    return cb(false, tags);
  });
}

storage.findVotesByPublicationId = function(id, cb) {
  model.Vote.find({ publication: id }, function(err, votes) {
    if(err) { return cb(err, null); }
    return cb(false, votes);
  });
}

storage.findCommentsByPublicationId = function(id, cb) {
  model.Comment.find({ publication: id }, function(err, comments) {
    if(err) { return cb(err, null); }
    return cb(false, comments);
  });
}

// TO DO validation
storage.saveComment = function(commentJSON, cb) {
  var comment = new model.Comment(commentJSON);
  if(commentJSON._id !== undefined) {
    storage.updateComment(commentJSON, cb);
  }else {
    comment.save(function(err) {
      if(err) { return cb(err, null); }
      return cb(false, comment);
    });
  }
}

storage.saveSong = function(songJson, cb) {
  var song = new model.Song(songJson);
  song.save(function(err) {
    if(err) { return cb(err, null); }
    return cb(false, song);
  });
}

storage.updateComment = function(commentJSON, cb) {
  if(commentJSON._id === undefined) { return cb('No id was found on document', null); }
  model.Comment.findByIdAndUpdate(comment._id, commentJSON, { upsert: false }, function(err, savedComment) {
    if(err) { return cb(err, null); }
    return cb(false, savedComment);
  });
}

storage.saveVote = function(voteJson, cb) {
  validateVote(voteJson, function(valid){
    if(valid) {
      if(voteJson._id !== undefined) {
        storage.updateVote(voteJson, cb);
      }else {
        model.Vote.findOne({ player: voteJson.player, publication: voteJson.publication }, function(err, vote) {
          if(err) { return cb(err, null); }
          if(vote == null) {
            vote = new model.Vote(voteJson);
            vote.save(function(err) {
              if(err) { return cb(err, null); }
              return cb(false, vote);
            });
          } else {
            storage.updateVote(vote.toObject(), cb);
          }
        });
      }
    }else {
      return cb('Vote was not valid!', null);
    }
  });
}

function validateVote(voteJson, cb) {
  if(voteJson.tags !== undefined && voteJson.tags instanceof Array && voteJson.tags.length > 0) {
    model.Tag.find({ _id: { $in: voteJson.tags } }, function(err, result) {
      if(err || result.length != voteJson.tags.length) {
        return cb(false);
      }
      return cb(true);
    });
  }else {
    return cb(false);
  }
}

storage.updateVote = function(voteJson, cb) {
  var vote = new model.Vote(voteJson);
  model.Vote.findByIdAndUpdate(vote._id, voteJson, { upsert: false }, function(err, savedVote) {
    if(err) { return cb(err, null); }
    return cb(false, savedVote);
  });
}


