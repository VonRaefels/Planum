var LastFmNode = require('lastfm').LastFmNode;
var lastfm = new LastFmNode({
  api_key: 'a48b08c0ddca10dc86632740a932d4a6',
  secret: '2178591cd1f6ba903791b64cea93629a',
  useragent: 'Planum'
});


var LastfmSource = function() {
}

LastfmSource.prototype.searchArtist = function(artistQuery, cb) {
  lastfm.request('artist.search', {
    artist: artistQuery,
    limit: 5,
    page: 1,
    handlers: {
      success: function(data) {
        var artists = cleanArtists(data);
        return cb(artists);
      },
      error: function(error) {
        console.log(error);
        return cb([]);
      }
    }
  });
}

function cleanArtists(data) {
  var result = data.results.artistmatches.artist;
  var artists = result.map(function(artist) {
    var parsedArtist = {};
    parsedArtist.name = artist.name;
    parsedArtist.lastfmId = artist.mbid;
    parsedArtist.image = artist.image;
    parsedArtist.url = artist.url;
    parsedArtist.source = 'lastfm';
    return parsedArtist;
  });
  return artists;
}

LastfmSource.prototype.searchSong = function(songQuery, artist, cb) {
  lastfm.request('track.search', {
    artist: artist.name,
    limit: 5,
    page: 1,
    track: songQuery,
    handlers: {
      success: function(data) {
        var songs = cleanSongs(data);
        return cb(songs);
      },
      error: function(error) {
        // TO DO log errors.
        return cb([]);
      }
    }
  });
}

function cleanSongs(data) {
  var result = data.results.trackmatches.track;
  var songs = result.map(function(song) {
    delete song.listeners;
    delete song.streamable;
    song.lastfmId = song.mbid;
    delete song.mbid;
    return song;
  });
  return songs;
}

module.exports = LastfmSource;