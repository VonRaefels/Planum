App.Player = DS.Model.extend({
  name: DS.attr('string'),
  thumbLink: DS.attr('string'),
  activeGame: DS.belongsTo('game', { async: true }),
  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  admin: DS.attr('boolean')
});

App.Game = DS.Model.extend({
  name: DS.attr('string'),
  active: DS.attr('boolean'),
  players: DS.hasMany('player', { async: true })
});

App.Tag = DS.Model.extend({
  name: DS.attr('string'),
  imgLink: DS.attr('string'),
  active: DS.attr('boolean'),
  value: DS.attr(),
  css: DS.attr('string')
});

App.Song = DS.Model.extend({
  artist: DS.attr('string'),
  name: DS.attr('string'),
  youtubeId: DS.attr('string')
});

App.User = DS.Model.extend({
  name: DS.attr('string'),
  thumbLink: DS.attr('string'),
  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  admin: DS.attr('boolean')
});

App.ApplicationController = Ember.ObjectController.extend({
});

App.DeleteModalController = Ember.ObjectController.extend({
  actions: {
    delete: function() {
      this.get('model').destroyRecord();
    }
  }
});

App.RemovePlayerModalController = Ember.ObjectController.extend({
  player: null,
  actions: {
    remove: function() {
      var game = this.get('model');
      var players = game.get('players');
      players.removeObject(this.player).then(function() {
        return game.save();
      });
    }
  }
});

App.AddPlayerModalController = Ember.ObjectController.extend({
  players: [],
  actions: {
    addPlayer: function() {
      var selectedIds = [];
      selectedIds = self.$("input[name='players-to-add']:checked").map(function() {
        return this.value;
      }).get();

      var _this = this;
      var game = this.get('model');
      var currentPlayers = game.get('players');
      var promises = [];

      selectedIds.forEach(function(id) {
        var promise =_this.store.find('player', id);
        promise.then(function(player) {
          currentPlayers.addObject(player);
        });
        promises.push(promise);
      });
      Q.all(promises).then(function() {
        game.save();
      });
    }
  }
});

App.BasicController = Ember.ObjectController.extend({
  saved: false,
  modelName: '',
  actions: {
    save: function() {
      var self = this;
      var model = this.get('model');
      model.save().then(function() {
        self.set('saved', true);
        setTimeout(function(){
          self.set('saved', false);
          unloadNewRecords(self.modelName, self.store, function() {
            history.back();
          });
        }, 1200);
      }, function(resp) {
        // TO DO show error alert.
      });
    },
    back: function() {
      this.set('saved', false);
      unloadNewRecords(this.modelName, this.store, function() {
        history.back();
      });
    }
  }
});

App.BasicControllerWithActive = App.BasicController.extend({
  activate: function() {
    var model = this.get('model');
    if(model.get('isDirty') && !model.get('isNew')
      && !model.get('isEmpty') && !model.get('isLoading')
      && !model.get('isSaving') && !model.get('isReloading')) {
      model.save();
    }
  }.observes('active')
});


App.PlayerController = App.BasicController.extend({
  modelName: 'player'
});


App.TagController = App.BasicControllerWithActive.extend({
  modelName: 'tag'
});

App.GameController = App.BasicControllerWithActive.extend({
  modelName: 'game'
});

App.SongController = App.BasicController.extend({
  modelName: 'song'
});

App.PlayersController = Ember.ArrayController.extend({
  itemController: 'player'
});

App.GamesController = Ember.ArrayController.extend({
  itemController: 'game'
});

App.TagsController = Ember.ArrayController.extend({
  itemController: 'tag'
});

App.SongsController = Ember.ArrayController.extend({
  itemController: 'song',
  actions: {
    openYoutube: function(song) {
      var youtubeId = song.get('youtubeId');
      var win = window.open('https://www.youtube.com/watch?v=' + youtubeId, '_blank');
      win.focus();
    }
  }
});


function unloadNewRecords(type, store, cb) {
  store.filter(type, function(item) {
    return item.get('isNew');
  }).then(function(objs) {
    console.log(objs);
    objs.forEach(function(obj) {
      console.log('hola');
      obj.deleteRecord();
    });
    cb();
  });
}