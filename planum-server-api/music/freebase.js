var freebase = require('freebase');
var util = require('../util')
var config = require('../config')

var FreebaseSource = function() {
}

FreebaseSource.prototype.searchArtist = function(artistQuery, cb) {
  var query = [{
    "type": "/music/artist",
    "name~=": artistQuery,
    "ns0:name": null,
    "id": null,
    "genre": [],
    "label": [],
    "/common/topic/image": [{}],
    "sort": "ns0:name",
    "limit": 5
  }];

  freebase.mqlread(query, {}, function(data) {
    var result = data.result;
    var artists = result.map(function(artist) {
      var parsedArtist = {};
      parsedArtist.name = artist['ns0:name'];
      parsedArtist.freebaseId = artist.id;
      parsedArtist.labels = artist.label;
      parsedArtist.genres = artist.genre;
      parsedArtist.image = artist["/common/topic/image"].map(function(image) {
        image.id = config.freebaseImgURL + image.id; return image;
      });
      parsedArtist.source = 'freebase';
      return parsedArtist;
    });
    return cb(artists);
  });
}

FreebaseSource.prototype.searchSong = function(songQuery, artist, cb) {
  var query = [{
    "type": "/music/track",
    "id": null,
    "artist": [{
      "id": artist.freebaseId
    }],
    "name": null,
    "name~=": songQuery,
    "length": null
  }];
  freebase.mqlread(query, {}, function(data) {
    var result = data.result;
    var songs = result.map(function(song) {
      delete song.type;
      delete song.artist;
      song.freebaseId = song.id;
      delete song.id;
      return song;
    });
    var filteredSongs = util.removeDuplicates(songs, 'name');
    cb(filteredSongs);
  });
}

module.exports = FreebaseSource;