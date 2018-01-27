var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  model = module.exports,
  ObjectId = mongoose.Schema.Types.ObjectId;


var OAuthAccessTokensSchema = new Schema({
  accessToken: { type: String },
  clientId: { type: String },
  user: { type: ObjectId, ref: 'OAuthUsers' },
  expires: { type: Date }
});

var OAuthRefreshTokensSchema = new Schema({
  refreshToken: { type: String },
  clientId: { type: String },
  user: { type: String },
  expires: { type: Date }
});

var OAuthClientsSchema = new Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUri: { type: String }
});

var OAuthUsersSchema = new Schema({
  username: { type: String },
  password: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String, default: '' },
  admin: { type: Boolean }
});

mongoose.model('OAuthUsers', OAuthUsersSchema);
mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);
mongoose.model('OAuthClients', OAuthClientsSchema);



var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens'),
  OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens'),
  OAuthClientsModel = mongoose.model('OAuthClients'),
  OAuthUsersModel = mongoose.model('OAuthUsers');


// var client = new OAuthClientsModel({clientId: "asdf1234", clientSecret: "12345", redirectUri: ""});
// client.save(function (err, client) {
//   console.log(err, client);
// });

//
// node-oauth2-server callbacks
//
model.getAccessToken = function (bearerToken, callback) {
  OAuthAccessTokensModel.findOne({ accessToken: bearerToken }).populate('user').exec(callback);
};

model.getClient = function (clientId, clientSecret, callback) {
  OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, callback);
};


// var authorizedClientIds = ['s6BhdRkqt3', 'toto'];
model.grantTypeAllowed = function (clientId, grantType, callback) {
  if (grantType === 'password') {
    return callback(false, true);
    //TO DO implementar documento con clientes autorizados...
  }

  callback(false, true);
};

model.saveAccessToken = function (token, clientId, expires, user, callback) {
  var accessToken = new OAuthAccessTokensModel({
    accessToken: token,
    clientId: clientId,
    user: user._id,
    expires: expires
  });

  accessToken.save(callback);
};


model.getUser = function (username, password, callback) {
  OAuthUsersModel.findOne({ username: username, password: password }, callback);
};


model.saveRefreshToken = function (token, clientId, expires, user, callback) {
  var refreshToken = new OAuthRefreshTokensModel({
    refreshToken: token,
    clientId: clientId,
    user: user._id,
    expires: expires
  });

  refreshToken.save(callback);
};

model.getRefreshToken = function (refreshToken, callback) {
  OAuthRefreshTokensModel.findOne({ refreshToken: refreshToken }, callback);
};

model.logout = function(token, callback) {
  OAuthAccessTokensModel.findOne({ accessToken: token }, function(err, tokenModel) {
    if(err) { return callback(err) }
    if(tokenModel == null) { return callback("No token was found to logout"); }
    var user = tokenModel.user;
    OAuthAccessTokensModel.find({ user: user }).remove().exec(function(err) {
      OAuthRefreshTokensModel.find({ user: user }).remove().exec(function(err) {
        callback(err);
      });
    });
  });
}