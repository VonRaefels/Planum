'use strict';

var app = angular.module('planumApp', [
  'planumApp.services',
  'planumApp.directives',
  'planumApp.controllers',
  'ui.bootstrap',
  'cgBusy',
  'ngRoute',
  'ngSanitize'
]).
config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
		$routeProvider.when('/inicio', {
			templateUrl: 'partials/games.html', 
			controller: 'GamesCtrl'
		});
		$routeProvider.when('/rounds/:gameId', {
			templateUrl: 'partials/round.html', 
			controller: 'RoundCtrl',
			resolve: {
      			tagData: function(Tags){
      				return Tags.promise;
      			},
      			playerData: function(Players){
      				return Players.promise;
      			}
			}
		});
		$routeProvider.when('/profile/:profileId', {templateUrl: 'partials/profile.html', controller: 'ProfileCtrl'});
		$routeProvider.when('/publication/:publicationId', {
			templateUrl: 'partials/publication.html',
			 controller: 'PubliCtrl',
			 resolve: {
      			playerData: function(Players){
      				return Players.promise;
      			}
      			}});
		$routeProvider.when('/postSong', {templateUrl: 'partials/post.html', controller: 'PostCtrl'});
		$routeProvider.otherwise({redirectTo: '/inicio'});
		
	    var interceptor = ['$rootScope', '$q', function (scope, $q) {
	        function success(response) {
	            return response;
	        }
	        function error(response) {
	            var status = response.status;
	            if (status == 401) {
	                window.location = "./error.html";
	                return;
	            }
	            if (status == 500) {
	                window.location = "./error.html";
	                return;
	            }
	            if (status == 502) {
	                window.location = "./error.html";
	                return;
	            }
	            return $q.reject(response);
	        }
	        return function (promise) {
	            return promise.then(success, error);
	        }
	    }];
	    $httpProvider.interceptors.push(interceptor);

	}] ).value('cgBusyDefaults',{
	    message:'Cargando',
	    backdrop: true,
	    templateUrl: './bower_components/angular-busy/angular-busy.html',
	    minDuration: 100
	}).constant('config', {
		serverUrl: 'http://54.76.208.124'
	});

 // app.run(['$rootScope', 'Me', 'Game', '$http', function ($rootScope, Me, Game, $http) {

 // }]);	
