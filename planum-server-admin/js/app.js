App = Ember.Application.create();

App.Router.map(function() {
  this.resource('home', { path: '/' });
  this.resource('players', function() {
    this.resource('player', { path: '/:player_id' });
    this.resource('player.new', { path: '/new' });
  });
  this.resource('games', function() {
    this.resource('game', { path: '/:game_id' });
    this.resource('game.new', { path: '/new' });
  });
  this.resource('tags', function() {
    this.resource('tag', { path: '/:tag_id' });
    this.resource('tag.new', { path: '/new' });
  });

  this.resource('songs', function() {
    this.resource('song', { path: '/:song_id' });
    this.resource('song.new', { path: '/new' });
  });

});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'admin/api',
  headers: {
    Authorization: 'Bearer ' + Oauth.getToken()
  }
});

App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id',
  serializeHasMany : function(record, json, relationship) {
      var key = relationship.key;

      var relationshipType = DS.RelationshipChange.determineRelationshipType(
              record.constructor, relationship);

      if (relationshipType === 'manyToNone'
              || relationshipType === 'manyToMany'
              || relationshipType === 'manyToOne') {
          json[key] = Ember.get(record, key).mapProperty('id');
          // TODO support for polymorphic manyToNone and manyToMany
          // relationships
      }
  }
});

// App.GameSerializer = DS.ActiveModelSerializer
//                        .extend(DS.EmbeddedRecordsMixin)
//                        .extend({
//                          attrs: {
//                            players: {serialize: 'ids', deserialize: 'ids'},
//                          }
//                        });



App.MyModalComponent = Ember.Component.extend({
  actions: {
    ok: function() {
      this.$('.modal').modal('hide');
      this.sendAction('ok');
    }
  },
  show: function() {
    this.$('.modal').modal().on('hidden.bs.modal', function() {
      this.sendAction('close');
    }.bind(this));
  }.on('didInsertElement')
});
