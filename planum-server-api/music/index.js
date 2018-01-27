var FreebaseSource = require('./freebase');
var LastfmSource = require('./lastfm')
var async = require('async');

var MusicInfo = function() {
  this.sources = {};
  this.sources.freebase = new FreebaseSource();
  this.sources.lastfm = new LastfmSource();
}

var sourcesOrder = ['lastfm', 'freebase'];

MusicInfo.prototype.searchArtist = function(artistQuery, cb) {
  var self = this;
  var artists = [];

  async.eachSeries(sourcesOrder, function(source, callback) {
    self.sources[source].searchArtist(artistQuery, function(data) {
      if(data.length > 0) {
        artists = data;
        callback(true);
      }else {
        callback();
      }
    });
  }, function(err) {
    cb(artists);
  });
}

MusicInfo.prototype.searchSong = function(songQuery, artist, cb) {
  var songs = [];
  var source = artist.source || sourcesOrder[0];

  return this.sources[source].searchSong(songQuery, artist, cb);
}

module.exports = MusicInfo;