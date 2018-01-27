var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');
var storage = require('./domain/storage');
var config = require('./config');
var oauthUrl = config.oauthUrl;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
 * Auth proxy
 */
var client_id = "s6BhdRkqt3";
var client_password = "12345";
var authorizationHeader = "Basic " + new Buffer(client_id + ":" + client_password).toString('base64');
var allowedHosts = ['planum.music'];

app.post('/oauth/token', function(req, res) {
  // if(allowedHosts.indexOf(req.host) < 0) {
  //   return res.send(401, { error: "Not authorized" });
  // }
  var headers = {
    'Authorization': authorizationHeader
  }
  var form = req.body;
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      return res.json(response.body);
    }
    return res.send(401, { error: "Not authorized" });
  }
  request.post({ url: oauthUrl + '/oauth/token', form: form, headers: headers }, callback);
});

//csfr protection...
app.post('/api/players', function(req, res) {
  var data = req.body;
  storage.savePlayer(data, function(err, player) {
    delete player.password;
    if(err) { return res.send(500, { error: 'Unexpected server error' }); }
    res.json(player);
  });
});

// app.delete('/oauth/token', function(req, res) {
//   function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       return res.json(response.body);
//     }
//     return res.send(401, { error: "Not authorized" });
//   }
//   var options = {
//     url: oauthUrl + '/oauth/logout',
//     method: 'GET',
//     headers: {
//       'Authorization': req.headers['authorization'],
//       'Host': req.headers['host'],
//       'Origin': req.headers['origin'],
//       'Accept': req.headers['accept']
//     }
//   }
//   request(options, callback);
// });

app.use(function(req, res, next) {
  var tokenHeader = req.headers['authorization'];
  var tokenRegex = /Bearer (\d\w)*/;
  if(tokenHeader === undefined) {
    return res.send(401, { error: "Not authorized" });
  }
  if(tokenHeader.match(tokenRegex)) {
    request({ uri: oauthUrl + '/oauth/test', headers: { authorization: tokenHeader }}, function(err, msg, body) {
      if(err || body === undefined) { return res.send(500, { error: "Internal server error" }); }
      var bodyJson = JSON.parse(body);
      var responseCode = bodyJson.ok;
      var user = bodyJson.user;
      var admin = bodyJson.admin || false;
      if(responseCode == undefined || responseCode == false || user == undefined) { return res.send(401, { error: "Not authorized" }); }
      if(responseCode == true) {
        req.user = user;
        req.admin = admin;
        storage.findPlayerGame(req.user, function(err, game) {
          if(err) { return res.send(500, { error: "Internal server error" }); }
          req.game = game;
          return next();
        });
      } else {
        return res.send(401, { error: "Not authorized" });
      }
    });
  }else {
    return res.send(401, { error: "Invalid authorization header" });
  }
});

app.use('/api', api);

// TO DO return json...
app.use(function(req, res, next) {
  if(req.admin === undefined || req.admin == false) {
    var err = new Error('Not authorized');
    err.status = 401;
    next(err);
  }else {
    next();
  }
});

app.use('/admin/api', admin);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
