'use strict';

/* Controllers */

var planumApp = angular.module('planumApp.controllers',['angularMoment']);


planumApp.controller('RoundCtrl',['$scope', '$http', 'Game', 'Rounds', 'Players', 'config', function($scope, $http, Game, Rounds, Players, config) {
		$scope.game = {};
		$scope.publications = [];
		Game.getGame().success(function(data){
			$scope.game = data;
			Rounds.findActiveRound($scope.game.activeRound).success(function(data){
				$scope.publications = data;
			});
		});	
		Players.getPlayers().success(function(data){
			$scope.players = data;
		});
		
  }]);

planumApp.controller('PubliCtrl',['$scope', '$route', '$http', '$sce', '$routeParams', '$location', 'Publication' ,'Tags', 'Comments', 'Votes', 'Players', 'config',
					 function($scope, $route, $http, $sce, $routeParams, $location, Publication, Tags, Comments, Votes, Players, config) {

		$scope.publication = {};
		$scope.publicationId = $routeParams.publicationId;
		$scope.votedTags = [];
		$scope.voteText ="";

		Publication.findPublicationById($scope.publicationId).success(function(data) {
			$scope.publication = data;
			$scope.trusted_url = "https://www.youtube.com/embed/";
			$scope.trusted_url = $scope.trusted_url + $scope.publication.song.youtubeId + "?rel=0";
			$scope.trusted_url =  $sce.trustAsResourceUrl($scope.trusted_url);
			$scope.votedTags = $scope.publication.votedTags;
			$scope.availableTags = [];
			if(!$scope.publication.voted){
				$scope.availableTags = Tags.getActiveTags();
			};
		});

		$scope.totalComments = [];
		getCommentsAndVotes();
  			
		//DRAG AND DROP
		$scope.voteValue = 0;
		$scope.tagsToVote = [];

		$scope.handleDropVote = function(item, bin) {
			if($scope.tagsToVote.indexOf(item) == -1){
				var tag = Tags.getTagById(item);
				$scope.tagsToVote.push(item);
				$scope.voteValue = $scope.voteValue + tag.value;
			}
  		};

  		$scope.handleDropUnvote = function(item) {
  			var tag = Tags.getTagById(item);
  			if($scope.tagsToVote.indexOf(item) > -1){
				$scope.voteValue = $scope.voteValue - tag.value;
				var index = $scope.tagsToVote.indexOf(item);
				$scope.tagsToVote.splice(index,1);
			};
  		};

  		$scope.clickTag = function(item) {
  			var tag = Tags.getTagById(item._id);
  			if($scope.tagsToVote.indexOf(item._id) > -1){
  				$scope.voteValue = $scope.voteValue - tag.value;
				var index = $scope.tagsToVote.indexOf(item._id);
				$scope.tagsToVote.splice(index,1);
				document.getElementById('tagsBin').appendChild(document.getElementById(item._id));
  			}else{
  				$scope.tagsToVote.push(item._id);
				$scope.voteValue = $scope.voteValue + tag.value;
				document.getElementById('voteBin').appendChild(document.getElementById(item._id));
  			};
  		};

  		//VOTAR
  		$scope.vote = function(){
  			var tagsToVote = $scope.tagsToVote;
  			if(tagsToVote.length > 0){
	  			var vote = {
	  				comment:  this.voteText, 
	  				publication: $scope.publicationId,
	  				tags: tagsToVote
	  			};
	  			Publication.sendVote({ vote: vote }).success(function(data) {
	  				$route.reload();
	  			});
  			};
  		};

		$scope.comment = function(){
  			var comment = {
  				comment:  this.commentText,
  				publication: $scope.publicationId
  			};
  			Comments.sendComment({ comment: comment }).success(function(data){
  				getCommentsAndVotes();
  			});
  			this.commentText = "";
  		};

  		function getCommentsAndVotes(){
			Comments.getCommentsByPublicationId($scope.publicationId).success(function(data) {			
				$scope.comments = data;
				$scope.votes = [];
				Votes.getVotesByPublicationId($scope.publicationId).success(function(data) {
					var votes = data.map(function(vote) {
						var voteWithTags = vote;
						var tags = Tags.getTags(vote.tags);
						voteWithTags.tags = tags;
						return voteWithTags;
				});
					$scope.votes = votes;
					$scope.totalComments = $scope.comments.concat($scope.votes);
					for (var index = 0; index < $scope.totalComments.length; ++index) {
						$scope.totalComments[index].player = Players.getPlayerByUrl($scope.totalComments[index].player);
					};

				});
		  	});
		};
  }]);

planumApp.controller('PostCtrl', ['$scope', 'Songs', function($scope, Songs) {
	$scope.songQueue = [];
	$scope.results = true;
	$scope.artistSearched = false;
	$scope.artistSelected = false;
	$scope.songSearched = false;
	$scope.songSelected = false;
	$scope.youtubeSearched = false;
	$scope.artistName = '';
	$scope.title = '';

	$scope.queuePromise = Songs.getSongQueue().success(function(data){
		$scope.songQueue = data;
	});

	$scope.searchArtist = function(){
		$scope.artistResponse = [];
		$scope.artistSearched = false;
		$scope.songPromise = Songs.searchArtist($scope.artistName).success(function(data){
			$scope.artistResponse = data;
			if($scope.artistResponse.length == 0){
				$scope.results = false;
			} else {
				$scope.results = true;
				$scope.artistSearched = true;
			}
		});
	};

	$scope.searchSong = function(){
		$scope.songResponse = [];
		$scope.songSearched = true;
		$scope.songPromise = Songs.searchSong($scope.artist.id,$scope.title).success(function(data){
			$scope.songResponse = data;
			if($scope.songResponse.length == 0){
				$scope.results = false;
			} else {
				$scope.results = true;
			}
		});
	}

	$scope.searchSongPlanum = function(artist, title){
		$scope.songSelected = true;
		$scope.title = title;
		$scope.songPlanumPromise = Songs.searchSongPlanum(artist,title).success(function(data){
			$scope.planumResponse = data;
			if($scope.planumResponse.length == 0){
				$scope.results = false;
			} else {
				$scope.results = true;
				$scope.songSearched = true;
			}
		});
	}

	$scope.youtubeSearch = function(){
		$scope.songResponse = [];
		$scope.youtubeResponse = [];
		$scope.youtubeSearched = true;
		$scope.youtubePromise = Songs.youtubeSearch($scope.artistName,$scope.title).success(function(data){
			$scope.youtubeResponse = data;
			if($scope.youtubeResponse.length == 0){
				$scope.results = false;
			} else {
				$scope.results = true;
			}
		});
	};

	$scope.selectArtist = function(artist){
		$scope.artistSelected = true;
		$scope.artist = artist;
		$scope.artistName = artist.name;
	};

	$scope.resetSearch = function(){
		$scope.artistName = '';
		$scope.title = '';
		$scope.artistSelected = false;
		$scope.artistSearched = false;
		$scope.songSearched = false;
		$scope.artistResponse = [];
		$scope.songResponse = [];
		$scope.songPlanumResponse = [];
		$scope.songSelected = false;
		$scope.results = true;
		$scope.youtubeSearched = false;
	}

	$scope.addSongToQueue = function(song){
		console.log(song);
		Songs.addSongToQueue({song: song}).success(function(data){
			$scope.queueSongPromise = Songs.getSongQueue().success(function(data){
				$scope.songQueue = data;
			});
		});
		$scope.resetSearch();
	};

	$scope.addSongToQueueYoutube = function(id){
		console.log($scope.title);
		var song ={
			artist: $scope.artistName,
			name: $scope.title,
			youtubeId: id
		};
		console.log(song);
		Songs.addSongToQueue({song: song}).success(function(data){
			$scope.youtubePromise = Songs.getSongQueue().success(function(data){
				$scope.songQueue = data;
			});
		});
		$scope.resetSearch();
	};

	$scope.deleteSongFromQueue = function(song){
		Songs.deleteSongFromQueue(song).success(function(data){
				$scope.songQueue = data;
		});
	};

 }]);


planumApp.controller('ProfileCtrl', ['$scope', '$routeParams', 'Players', 'config', function($scope, $routeParams, Players, config) {
	$scope.profileId = $routeParams.profileId;
	$scope.player = [];
	Players.getPlayerById($scope.profileId).success(function(data){
		$scope.player = data;
	});
 }]);

planumApp.controller('HeaderCtrl',['$scope', '$rootScope', '$location', 'Me', 'Game', 'config',  function($scope, $rootScope, $location, Me, Game, config) {
	$scope.isCollapsed = true;
	Me.getMe().success(function(data){
		$scope.me = data;
	});

	$scope.logout = function(){
		Oauth.logout(function(err){
			window.location = "./index.html";
		});
	};

	$scope.exitGame = function(){
		$scope.isCollapsed = true;
		Me.getMe().success(function(data){
		$scope.me = data;
		});
		$location.path("/inicio");
	};
}]);

planumApp.controller('GamesCtrl', ['$scope', '$routeParams', '$location', 'Me', 'GameStart', 'config', function($scope, $routeParams, $location, Me, GameStart, config) {
	$scope.games = [];
	Me.getMe().success(function(data){
		$scope.me = data;
		$scope.games = $scope.me.games;
		$scope.newGameName = "";
	});
	

	$scope.newGame = function(){
		if($scope.newGameName != ""){
			var name = { name: $scope.newGameName };
			GameStart.newGame(name).then(function(){
				Me.getMe().success(function(data){
					$scope.me = data;
					$scope.games = $scope.me.games;
					$scope.newGameName = "";
				});
			});
		}
	};

	$scope.chooseGame = function(game){
		var chosenGame =  { game: game._id, player: $scope.me._id };
		GameStart.chooseGame(chosenGame);
		Me.getMe().success(function(data){
			$scope.me = data;
			if($scope.me.activeGame != ""){
				$location.path("/rounds/" + $scope.me.activeGame);
			};
		});
	};

 }]);