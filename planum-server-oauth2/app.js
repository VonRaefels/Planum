var express = require('express'),
  oauthserver = require('node-oauth2-server');

var logger = require('morgan');

var app = express();

var mongoose = require('mongoose');

var uristring = 'mongodb://mongodb/planum';

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var model = require('./model');
app.configure(function() {
  app.oauth = oauthserver({
    model: model,
    grants: ['password', 'refresh_token'],
    accessTokenLifetime: 30000,
    debug: false
  });
  app.use(express.bodyParser());
  app.use(logger('dev'));
});



app.all('/oauth/token', app.oauth.grant());

// TO DO, change to delete or do something...
app.post('/oauth/logout', app.oauth.authorise(), function(req, res) {
  var tokenHeader = req.headers['authorization'];
  var token = tokenHeader.split(' ')[1];
  model.logout(token, function(err) {
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    return res.json({ ok: true });
  });
});

app.get('/oauth/test', app.oauth.authorise(), function (req, res) {
  var response = { ok: true, user: req.user._id, admin: req.user.admin };
  res.json(response);
});


app.use(app.oauth.errorHandler());

module.exports = app;

app.listen(3000);