'use strict';

/* Services */

var planumApp = angular.module('planumApp.services',['ngResource']);

planumApp.factory('Me', ['$resource', '$http', 'config',
  function($resource, $http, config){
    $http.defaults.headers.common.Authorization = 'Bearer ' + Oauth.getToken();
    return {
      getMe: function(){
          return $http.get(config.serverUrl + '/api/me');
	      }
	    };
}]);


planumApp.factory('Game', ['$resource', '$http', 'config',
  function($resource, $http, config){
    return {
      getGame: function(){
          return $http.get(config.serverUrl + '/api/game');
      }
    };
}]);

planumApp.factory('GameStart', ['$resource', '$http', 'config',
  function($resource, $http, config){
  return {
    chooseGame: function(chosenGame) {
        return $http.post(config.serverUrl + '/api/chooseGame', chosenGame);
      },
      newGame: function(newGame){
        return $http.post(config.serverUrl + '/api/game', newGame);
      }
    };
}]);

planumApp.factory('Rounds', ['$resource', '$http', 'config',
  function($resource, $http, config){
  	return {
  		findRound: function(round) {
  			return $http.get(round);
  		},
  		findActiveRound: function(activeRound) {
          activeRound = activeRound.split("/")[5];
          return $http.get(config.serverUrl + '/api/rounds/' + activeRound);
        }
  		}
}]);

planumApp.factory('Publication', ['$resource', '$http', 'config',
  function($resource, $http, config){
  	return {
  		findPublicationById: function(publicationId) {
  			return $http.get(config.serverUrl + '/api/publications/' + publicationId);
  		},
  		sendVote: function(vote){
  			return $http.post(config.serverUrl + '/api/votes', vote);
  		}
  	}
}]);

planumApp.factory('Songs', ['$resource', '$http', 'config',
  function($resource, $http, config){
  	return {
  		getSongQueue: function() {
  			return $http.get(config.serverUrl + '/api/queue?populate=true');
  		},
  		searchArtist: function(artist){
  			return $http.get(config.serverUrl + '/api/search/artists?artist=' + artist);
  		},
      searchSong: function(artistId, title){
        return $http.get(config.serverUrl + '/api/search/songs?artistId=' + artistId + '&song=' + title);
      },
      searchSongPlanum: function(artist, title){
        return $http.get(config.serverUrl + '/api/songs?artist=' + artist + '&name=' + title);
      },
  		youtubeSearch: function(artist,title){
  			return $http.get(config.serverUrl + '/api/songs/youtube?artist=' + artist + '&name=' + title);
  		},
  		addSongToQueue: function(song){
  			return $http.post(config.serverUrl + '/api/queue', song);
  		}, 
      deleteSongFromQueue: function(song){
        return $http.delete(config.serverUrl + '/api/queue/' + song._id);
      }
  	}  
}]);

planumApp.factory('Tags', ['$resource', '$http', 'config',
  function($resource, $http, config){
  $http.defaults.headers.common.Authorization = 'Bearer ' + Oauth.getToken();
 	var tags = null;
    var promise = $http.get(config.serverUrl + '/api/tags?active=true').success(function (data) {
      tags = data;
    });
    return {
      promise: promise,
      getActiveTags: function () {
          return tags;
      },
      getTagById: function (tagId) {
      	var tag;
      	for (var index = 0; index < tags.length; ++index) {
      		if(tags[index]._id == tagId){
      			tag = tags[index];
      		}
      	}
      	return tag;
      },
      getTags: function (filterTags){
      	var resultingTags = [];
      	for (var index2 = 0; index2 < filterTags.length; ++index2) {
      		for (var index = 0; index < tags.length; ++index) {
					if(tags[index]._id == filterTags[index2]){
						resultingTags.push(tags[index]);
					}
				}
			}
      	return resultingTags;
      }
    };
}]);

planumApp.factory('Comments', ['$resource', '$http', 'config',
  function($resource, $http, config){
  	return {
  		getCommentsByPublicationId: function(publicationId) {
  			return $http.get(config.serverUrl + '/api/publications/' + publicationId + '/comments');
  		},
  		sendComment: function(comment){
  			return $http.post(config.serverUrl + '/api/comments',comment);
  		}
  	}
}]);

planumApp.factory('Votes', ['$resource', '$http', 'config',
  function($resource, $http, config){
  	return {
  		getVotesByPublicationId: function(publicationId) {
  			return $http.get(config.serverUrl + '/api/publications/' + publicationId + '/votes');
  		}
  	}
}]);


planumApp.factory('Players', ['$resource', '$http', 'Game', 'config', 
  function($resource, $http, Game, config){
    $http.defaults.headers.common.Authorization = 'Bearer ' + Oauth.getToken();
  	var players = null;
    var promise = $http.get(config.serverUrl + '/api/players/').success(function (data) {
      players = data;
    });
    return {
      promise: promise,
      getPlayers: function () {
          return $http.get(config.serverUrl + '/api/players/');
      },
      getPlayerByUrl: function(playerUrl){
      	var player;
      	var playerId = playerUrl.split('/player/').pop();
      	for (var index = 0; index < players.length; ++index) {
      		if(players[index]._id == playerId){
      			player = players[index];
      		}
      	}
      	return player;
      },
      getPlayerById: function(id){
        return $http.get(config.serverUrl + '/api/players/' + id);
      }
    };
}]);

