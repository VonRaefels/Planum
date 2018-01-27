"use strict";
var request = require("request");
var Api = require("./api/v3.0.0/index");

var Client = module.exports = function (config) {};

(function () {
  var config = {};

  this.authenticate = function (options) {
    if (!options) {
      config.auth = undefined;
      return;
    }

    options.type = options.type || "oauth";

    if (!options.type || "basic|oauth|key".indexOf(options.type) === -1) {
      throw new Error("Invalid authentication type must be 'oauth' or 'key'");
    } else if (options.type == "key" && !options.key) {
      throw new Error("Key authentication requires a key to be set");
    } else if (options.type == "oauth" && !options.token) {
      throw new Error("OAuth2 authentication requires a token to be set");
    }

    config.auth = options;
  };

  this.getConfig = function () {
    return config;
  };

  this.setConfig = function (conf) {
    return config = conf;
  };

  this.request = function (options, callback) {

    var reqOptions = {};

    if (typeof options === "string") {
      reqOptions.url = options;
    }

    for (var option in options) {
      reqOptions[option] = options[option];
    }

    if (reqOptions.json == undefined) {
      reqOptions.json = true;
    }

    request(reqOptions, function (err, res, body) {

      if (!err && res.statusCode == 200) {
        return callback(null, body);
      }

      if (body && body.error) {
        err = body.error.message || body.error;
      }

      if (err) {
        return callback(err);
      }

      // unknown error
      callback("Something wrong happened in the request (index.js:this.request) function. Check the logs for more information.");
      console.error(
        "\n---- Submit an issue with the following information ----" +
        "\nIssues: https://github.com/IonicaBizau/youtube-api/issues" +
        "\nDate: " + new Date().toString() +
        "\nError: " + JSON.stringify(err) +
        "\nStatus Code:: " + JSON.stringify(res.statusCode) +
        "\nBody: " + JSON.stringify(body) +
        "\n------------------"
      );
    });
  };
}).call(Client);
Api.call(Client);