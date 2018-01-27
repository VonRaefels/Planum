// var MusicInfo = require('../music');
// var FreebaseSource = require('../music/freebase');
// var LastfmSource = require('../music/lastfm');
// var expect = require('chai').expect;
// var assert = require('chai').assert;
// var util = require('../util');
// var should = require('chai').should();
// var assertProperty = util.assertProperty;

// describe('MusicInfo', function() {

//   var musicInfo = new MusicInfo();
//   it('should query for artist', function(done) {
//     musicInfo.searchArtist('Hozier', function(data) {
//       data.should.be.a('array');
//       data.length.should.be.above(0);
//       done();
//     });
//   });

//   it('should query for song', function(done) {
//     var artist = { name: 'Hozier', source: 'lastfm' };
//     musicInfo.searchSong('Take', artist, function(data) {
//       data.should.be.a('array');
//       data.length.should.be.above(0);
//       done();
//     });
//   });
// });

// describe('FreebaseSource', function() {
//   var freebaseSource = new FreebaseSource();

//   it('should query for artist in freebase', function(done) {
//     freebaseSource.searchArtist('u2', function(data) {
//       data.length.should.be.above(0);
//       data[0].should.have.a.property('freebaseId');
//       done();
//     });
//   });

//   it('should query for song in freebase', function(done) {
//     var artist = { id: '/dataworld/freeq/job_a27f2df3-7839-4e40-bbb2-acfbb3c39624_var_en_wikipedia_org_wiki_Hozier_$0028musician$0029'};
//     freebaseSource.searchSong('Take Me To Church', artist, function(data) {
//       data.should.be.a('array');
//       data.length.should.be.above(0);
//       data[0].should.have.a.property('freebaseId');
//       done();
//     });
//   });

// });

// describe('LastfmSource', function() {
//   var lastfmSource = new LastfmSource();

//   it('should query for artist in lastfm', function(done) {
//     lastfmSource.searchArtist('hozier', function(data) {
//       data.should.be.a('array');
//       data.length.should.be.above(0);
//       data[0].should.have.property('lastfmId');
//       done();
//     });
//   });

//   it('should query for song in lastfm', function(done) {
//     var artist = { name: 'Hozier' };
//     lastfmSource.searchSong('Take', artist, function(data) {
//       data.should.be.a('array');
//       data.length.should.be.above(0);
//       data[0].should.have.property('lastfmId');
//       done();
//     });
//   });

// });