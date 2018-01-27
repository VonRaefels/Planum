//!mongo [name].js

DB_NAME = "planum";
DB_LOCATION = "mongodb:27017";


var connection = new Mongo(DB_LOCATION);
db = connection.getDB(DB_NAME);
db.dropDatabase();

// Oauth
db.createCollection("oauthaccesstokens");
db.createCollection("oauthrefreshtokens");
db.createCollection("oauthclients");
db.createCollection("oauthusers");

db.createCollection("games");
db.createCollection("players");
db.createCollection("rounds");
db.createCollection("publications");
db.createCollection("tags");
db.createCollection("votes");
db.createCollection("comments");
db.createCollection("songs");
db.createCollection("songqueues");