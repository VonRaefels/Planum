App.ApplicationRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('user', 'me');
  },
  actions: {
    showModal: function(name, content) {
      this.controllerFor(name).set('content', content);
      this.render(name, {
        into: 'application',
        outlet: 'modal'
      });
    },
    showAddPlayerModal: function(name, game) {
      var toFilter = game.get('players') || [];
      var self = this;
      this.store.find('player');
      this.store.filter('player', function(player) {
        return !player.get('isNew') && (toFilter.indexOf(player) == -1)
          && player.get('activeGame') == null;
      }).then(function(players) {
        self.controllerFor(name).set('content', game);
        self.controllerFor(name).set('players', players)

        self.render(name, {
          into: 'application',
          outlet: 'modal'
        });
      });
    },
    showRemovePlayerModal: function(name, game, player) {
      this.controllerFor(name).set('content', game);
      this.controllerFor(name).set('player', player)

      this.render(name, {
        into: 'application',
        outlet: 'modal'
      });
    },
    removeModal: function() {
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    },
    logout: function() {
      Oauth.logout(function(err) {
        if(err) {
          alert('Error');
        }
        window.location = 'index.html';
      });
    }
  }
});

App.PlayersRoute = Ember.Route.extend({
  model: function() {
    this.store.find('player');
    return this.store.filter('player', function(player) {
      return !player.get('isNew');
    });
  },
  renderTemplate: function() {
    this.render('players', { into: 'application' });
  }
});

App.PlayersIndexRoute = App.PlayersRoute.extend();

App.PlayerRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('player', params.player_id);
  },
  renderTemplate: function() {
    this.render('player', { into: 'application' });
  }
});

App.PlayerNewRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.createRecord('player');
  },
  controllerName: 'player',
  renderTemplate: function() {
    this.render('player/new', { into: 'application' });
  }
});

App.TagsRoute = Ember.Route.extend({
  model: function() {
    this.store.find('tag');
    return this.store.filter('tag', function(tag) {
      return !tag.get('isNew');
    });
  },
  renderTemplate: function() {
    this.render('tags', { into: 'application' });
  }
});

App.TagRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('tag', params.tag_id);
  },
  renderTemplate: function() {
    this.render('tag', { into: 'application' });
  }
});

App.TagNewRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.createRecord('tag');
  },
  controllerName: 'tag',
  renderTemplate: function() {
    this.render('tag/new', { into: 'application' });
  }
});

App.TagsIndexRoute = App.TagsRoute.extend();

App.GameNewRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.createRecord('game');
  },
  controllerName: 'game',
  renderTemplate: function() {
    this.render('game/new', { into: 'application' });
  }
});

App.GamesRoute = Ember.Route.extend({
  model: function() {
    this.store.find('game');
    return this.store.filter('game', function(game) {
      return !game.get('isNew');
    });
  },
  setupController: function(controller, model) {
    console.log(model);
    controller.set('model', model);
  },
  renderTemplate: function() {
    this.render('games', { into: 'application' });
  }
});

App.GameRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('game', params.game_id);
  },
  renderTemplate: function() {
    this.render('game', { into: 'application' });
  }
});

App.GamesIndexRoute = App.GamesRoute.extend();

App.SongsRoute = Ember.Route.extend({
  model: function() {
    this.store.find('song');
    return this.store.filter('song', function(song) {
      return !song.get('isNew');
    });
  },
  renderTemplate: function() {
    this.render('songs', { into: 'application' });
  }
});

App.SongRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('song', params.song_id);
  },
  renderTemplate: function() {
    this.render('song', { into: 'application' });
  }
});

App.SongNewRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.createRecord('song');
  },
  controllerName: 'song',
  renderTemplate: function() {
    this.render('song/new', { into: 'application' });
  }
});

App.SongsIndexRoute = App.SongsRoute.extend();