var model = require('./domain/model');
var request = require('supertest');
var expect = require('chai').expect;
var assert = require('chai').assert;
var should = require('chai').should();
var sys = require('sys');
var exec = require('child_process').exec;
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Schema.Types.ObjectId;

var util = module.exports;


if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

util.mongoArrayToJsonArray = function(array) {
  return array.map(function(el) { return el.toObject(); });
}

util.removeDuplicates = function(data, look) {
  var filtered = {};
  return data.filter(function(item) {
    var key = item[look];
    if(!filtered[key]) {
      filtered[key] = true;
      return true;
    }
    return false;
  });
}

// TO DO, refactor script to run on nodejs and get real callback...
util.dumpDummyData = function(cb) {
  exec("mongo --host mongodb:27017 scripts/mockdata.js", function (err, stdout, stderr) {
    if(err) { sys.puts(stderr); }
    setTimeout(function() {
      cb(err);
    }, 40);
  })
}


util.findModelId = function(_model, cb) {
  _model.find().exec(function(err, document) {
    if(err) { return cb(err, null); }
    return cb(false, document[0]._id);
  });
}

util.findPublicationBySongName = function(name, cb) {
  model.Song.find({ name: name }).limit(1).exec(function(err, song) {
    if(err) { return cb(err, null); }
    model.Publication.find({ song: song[0]._id }).limit(1).exec(function(err, publication) {
      if(err) { return cb(err, null); }
      return cb(false, publication[0]);
    });
  });
}

util.findABunchOfTags = function(cb) {
  model.Tag.find({}, function(err, tags) {
    if(err) { return cb(err, null); }
    shuffledTags = shuffle(tags);
    var l = Math.floor((Math.random() * (tags.length - 1)) + 1);
    cb(false, shuffledTags.slice(l));
  });
}

util.assertUserExists = function(id, cb) {
  model.Player.findById(ObjectId(id), function(err, player) {
    if(err) { return cb(false); }
    model.OAuthUsersModel.findById(ObjectId(id), function(err, user) {
      if(err) { return cb(false); }
      return cb(true);
    });
  });
}

util.findABunchOfTagsIds = function(cb) {
  util.findABunchOfTags(function(err, tags) {
    if(err) return cb(err, null);
    return cb(false, tags.map(function(el) { return el._id }) );
  });
}

util.assertProperty = function(property, type, key) {
  property.should.not.be.null;
  property[key].should.not.be.null;
  property.should.have.property(key);
  property[key].should.be.a(type);
}

