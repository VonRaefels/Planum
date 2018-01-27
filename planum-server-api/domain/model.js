var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Schema.Types.ObjectId;

var uristring = 'mongodb://mongodb/planum';
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var Player = new Schema({
  name: { type: String },
  thumbLink: { type: String },
  activeGame: { type: ObjectId, ref: 'game' },
  games: [{ type: ObjectId, ref: 'game' }],
  oauthuser: { type: ObjectId, ref: 'oauthuser' }
});
Player.index({ name: 'text' });

var Game = new Schema({
  name: { type: String },
  active: { type: Boolean },
  players: [{ type: ObjectId, ref: 'player' }],
  rounds: [{ type: ObjectId, ref: 'round' }],
  activeRound: { type: ObjectId, ref: 'round' }
});

var Round = new Schema({
  publications: [{ type: ObjectId, ref: 'publication' }]
});

var Publication  = new Schema({
  song: { type: ObjectId, ref: 'song' },
  round: { type: ObjectId, ref: 'round' },
  player: { type: ObjectId, ref: 'player' },
  date: {
    type: Date,
    default: Date.now
  }
});

var Song = new Schema({
  artist: { type: String },
  name: { type: String },
  youtubeId: { type: String },
  freebaseId: { type: String },
  lastfmId: { type: String }
});
Song.index({ name: 'text', artist: 'text' });

var SongQueue = new Schema({
  songs: [{ type: ObjectId, ref: 'song' }],
  player: { type: ObjectId, ref: 'player' }
});

var Tag = new Schema({
  name: { type: String },
  imgLink: { type: String },
  active: { type: Boolean },
  value: { type: Number },
  css: { type: String }
});

var Vote = new Schema({
  tags: [{ type: ObjectId, ref: 'tag' }],
  player: { type: ObjectId, ref: 'player' },
  publication: { type: ObjectId, ref: 'publication' },
  comment: { type: String },
  date: {
    type: Date,
    default: Date.now
  }
});

var Comment = new Schema({
  player: { type: ObjectId, ref: 'player' },
  publication: { type: ObjectId, ref: 'publication' },
  comment: { type: String },
  date: {
    type: Date,
    default: Date.now
  }
});


var OAuthUsersSchema = new Schema({
  username: { type: String },
  password: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String, default: '' },
  admin: { type: Boolean }
});

module.exports.Game = mongoose.model('game', Game);
module.exports.Player = mongoose.model('player', Player);
module.exports.Round = mongoose.model('round', Round);
module.exports.Tag = mongoose.model('tag', Tag);
module.exports.Vote = mongoose.model('vote', Vote);
module.exports.OAuthUsersModel = mongoose.model('oauthuser', OAuthUsersSchema);

Publication.methods.getTags = function getTags(playerId, cb) {
  module.exports.Vote.findOne({ player: playerId, publication: this._id }).populate('tags').exec(function(err, vote) {
    if(err) { return cb(err, null); }
    var tags = [];
    if(vote != null) {
      tags = vote.tags || [];
    }
    cb(false, tags);
  });
}
module.exports.Publication = mongoose.model('publication', Publication);
module.exports.Comment = mongoose.model('comment', Comment);
module.exports.Song = mongoose.model('song', Song);
module.exports.SongQueue = mongoose.model('songqueue', SongQueue);


