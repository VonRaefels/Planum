//!mongo [name].js

DB_NAME = "planum";
DB_LOCATION = "mongodb:27017";

var connection = new Mongo(DB_LOCATION);
db = connection.getDB(DB_NAME);

db.votes.remove({});
db.publications.remove({});
db.tags.remove({});
db.rounds.remove({});
db.games.remove({});
db.players.remove({});
db.songs.remove({});
db.songqueues.remove({});
db.comments.remove({});

db.oauthclients.remove({});
db.oauthusers.remove({});
db.oauthaccesstokens.remove({});
db.oauthrefreshtokens.remove({});


var gameIds = buildObjectIdArray(2);
var playerIds = buildObjectIdArray(5);
var publicationIds = buildObjectIdArray(7);
var publicationIds2 = buildObjectIdArray(3);
var roundIds = buildObjectIdArray(1);
var roundIds2 = buildObjectIdArray(1);
var tagIds = buildObjectIdArray(6);
var voteIds = buildObjectIdArray(6);
var commentIds = buildObjectIdArray(4);
var songIds = buildObjectIdArray(20);

db.tags.save({ _id: tagIds[0], name: "Rock!", imgLink: "", active: true, css: "rock", value: 5 });
db.tags.save({ _id: tagIds[1], name: "Sad song", imgLink: "", active: true, css: "sad", value: 3 });
db.tags.save({ _id: tagIds[2], name: "Gol de señor", imgLink: "", active: true, css: "gol", value: 4 });
db.tags.save({ _id: tagIds[3], name: "DAT BASS", imgLink: "", active: true, css: "bass", value: 2 });
db.tags.save({ _id: tagIds[4], name: "Epic guitar solo", imgLink: "", active: true, css: "guitar", value: 1 });
db.tags.save({ _id: tagIds[5], name: "Pianito", imgLink: "", active: true, css: "pianito", value: 4 });

db.games.save({ _id: gameIds[0], name: "Indie/Rock", players: playerIds, active: true , rounds: roundIds, activeRound: roundIds[0] });
db.games.save({ _id: gameIds[1], name: "Electronica", players: playerIds, active: true , rounds: roundIds2, activeRound: roundIds2[0] });

db.players.save({ _id: playerIds[0], name: "jorge", thumbLink: "/img/players/jorge.jpg", activeGame: gameIds[0], games: gameIds, oauthuser: playerIds[0] });
db.players.save({ _id: playerIds[1], name: "cralos", thumbLink: "/img/players/carlos.jpg", activeGame: gameIds[0], games: gameIds, oauthuser: playerIds[1] });
db.players.save({ _id: playerIds[2], name: "nachoman", thumbLink: "/img/players/nacho.jpg", activeGame: gameIds[0], games: gameIds, oauthuser: playerIds[2] });
db.players.save({ _id: playerIds[3], name: "flensel", thumbLink: "/img/players/alfonso.jpg", activeGame: gameIds[0], games: gameIds, oauthuser: playerIds[3] });
db.players.save({ _id: playerIds[4], name: "berny", thumbLink: "/img/players/berny.jpg", activeGame: gameIds[0], games: gameIds, oauthuser: playerIds[4] });

db.votes.save({ _id: voteIds[0], comment: "Mola mucho la canción, muy hipster.", player: playerIds[0], publication: publicationIds[0], tags: [tagIds[0], tagIds[1]], date: new Date('Jul 18, 2014') });
db.votes.save({ _id: voteIds[1], comment: "Esto es un comentario", player: playerIds[1], publication: publicationIds[0], tags: [tagIds[2], tagIds[1]], date: new Date('Jul 17, 2014') });
db.votes.save({ _id: voteIds[2], comment: "Esto es otro comentario", player: playerIds[2], publication: publicationIds[0], tags: [tagIds[0], tagIds[1], tagIds[2]], date: new Date('Jul 14, 2014') });
db.votes.save({ _id: voteIds[3], comment: "GOGAGE JEJE", player: playerIds[3], publication: publicationIds[0], tags: [tagIds[2], tagIds[1]], date: new Date('Jul 15, 2014') });
db.votes.save({ _id: voteIds[4], comment: "Jeje BAAWWERRRNYYYYY", player: playerIds[4], publication: publicationIds[0], tags: [tagIds[3]], date: new Date('Jul 19, 2014') });

db.comments.save({ _id: voteIds[0], comment: "This song is amazing", player: playerIds[0], publication: publicationIds[0], date: new Date('Jul 14, 2014') });
db.comments.save({ _id: voteIds[1], comment: "This is a freaking large comment blah blah blah blah blah....!!!??123456789 1337", player: playerIds[1], publication: publicationIds[0], date: new Date('Jul 13, 2014') });
db.comments.save({ _id: voteIds[2], comment: "Hue commentsfsdfs d", player: playerIds[0], publication: publicationIds[0], date: new Date('Jul 15, 2014') });
db.comments.save({ _id: voteIds[3], comment: "This is a freaking dsaf aslarge comment blah blah blah blah blah....!!!??123456789 1337", player: playerIds[2], publication: publicationIds[0], date: new Date('Jul 15, 2014') });


db.songs.save({ _id: songIds[0], artist: 'Tesseract', name: 'Nocturne', youtubeId: 'get0cXOsSXg' });
db.songs.save({ _id: songIds[1], artist: 'Keane', name: 'Somewhere Only We Know', youtubeId: 'Oextk-If8HQ' });
db.songs.save({ _id: songIds[2], artist: 'Joselito', name: 'Doce Cascabeles', youtubeId: 'zZU2GaL_vcs' });
db.songs.save({ _id: songIds[3], artist: 'Monuments', name: 'Atlas', youtubeId: 'yVuJ2HpAMkM' });
db.songs.save({ _id: songIds[4], artist: 'Twenty One Pilots', name: 'Car Radio', youtubeId: '92XVwY54h5k' });
db.songs.save({ _id: songIds[5], artist: 'The Beatles', name: 'Yesterday', youtubeId: 'S09F5MejfBE' });
db.songs.save({ _id: songIds[6], artist: 'Crystal Fighters', name: 'Love Is All I Got', youtubeId: 'hicCHaC_z5I' });
db.songs.save({ _id: songIds[7], artist: 'Opeth', name: 'In my time of need', youtubeId: '9x6YclsLHN0' });
db.songs.save({ _id: songIds[8], artist: 'Dream Theater', name: 'Pull Me Under', youtubeId: 'mipc-JxrhRk' });
db.songs.save({ _id: songIds[9], artist: 'Pacific Air', name: 'Move', youtubeId: 'AYgtVhSY1hI' });
db.songs.save({ _id: songIds[10], artist: 'Coldplay', name: 'Atlas', youtubeId: 'Lh3TokLzzmw' });
db.songs.save({ _id: songIds[11], artist: 'The Courteeners', name: 'Not Nineteen Forever', youtubeId: 'YC8FET-EGVM' });

db.songqueues.save({ player: playerIds[0], songs: [songIds[7], songIds[0]] });
db.songqueues.save({ player: playerIds[1], songs: [songIds[6], songIds[9]] });
db.songqueues.save({ player: playerIds[2], songs: [] });
db.songqueues.save({ player: playerIds[3], songs: [] });
db.songqueues.save({ player: playerIds[4], songs: [songIds[4], songIds[1]] });


db.publications.save({ _id: publicationIds[0], round: roundIds[0], song: songIds[0], player: playerIds[0], date: new Date('Jul 16, 2014') });
db.publications.save({ _id: publicationIds[1], round: roundIds[0], song: songIds[1], player: playerIds[1], date: new Date('Jul 14, 2014') });
db.publications.save({ _id: publicationIds[2], round: roundIds[0], song: songIds[2], player: playerIds[2], date: new Date('Jul 15, 2014') });
db.publications.save({ _id: publicationIds[3], round: roundIds[0], song: songIds[3], player: playerIds[3], date: new Date('Jul 13, 2014') });
db.publications.save({ _id: publicationIds[4], round: roundIds[0], song: songIds[4], player: playerIds[4], date: new Date('Jul 17, 2014') });
// db.publications.save({ _id: publicationIds[5], round: roundIds[0], song: songIds[5], player: playerIds[5], date: new Date('Jul 18, 2014') });
// db.publications.save({ _id: publicationIds[6], round: roundIds[0], song: songIds[6], player: playerIds[6], date: new Date('Jul 19, 2014') });

db.publications.save({ _id: publicationIds2[0], round: roundIds2[0], song: songIds[9], player: playerIds[0], date: new Date('Jul 13, 2014') });
db.publications.save({ _id: publicationIds2[1], round: roundIds2[0], song: songIds[10], player: playerIds[1], date: new Date('Jul 17, 2014') });
db.publications.save({ _id: publicationIds2[2], round: roundIds2[0], song: songIds[11], player: playerIds[2], date: new Date('Jul 17, 2014') });

db.rounds.save({ _id: roundIds[0], publications: publicationIds });
db.rounds.save({ _id: roundIds2[0], publications: publicationIds2 });

// Oauth2
db.oauthclients.save({ clientId: "s6BhdRkqt3", clientSecret: "12345", redirectUri: ""});
db.oauthusers.save({ _id: playerIds[0], username: "jorge", password: "password", firstname: "Jorge", lastname: "Madrid", email: "jorgemadridportillo@gmail.com", admin: true });
db.oauthusers.save({ _id: playerIds[1], username: "carlos", password: "password", firstname: "Carlos", lastname: "Gomez", email: "gagege@gmail.com", admin: true });
db.oauthusers.save({ _id: playerIds[2], username: "nacho", password: "password", firstname: "Nacho", lastname: "Ruiz", email: "gogeoe@gmail.com", admin: true });
db.oauthusers.save({ _id: playerIds[3], username: "alfonso", password: "password", firstname: "Alfonso", lastname: "Oliver", email: "gugeoage@gmail.com", admin: false });
db.oauthusers.save({ _id: playerIds[4], username: "berny", password: "password", firstname: "Berny", lastname: "Dance", email: "gugeoage@gmail.com", admin: false });
db.oauthusers.save({ _id: playerIds[5], username: "pablo", password: "password", firstname: "Pablo", lastname: "HUE", email: "gugeoage@gmail.com", admin: true });


function buildObjectIdArray(n) {
    var array = [];
    for (var i = 0; i < n; i++) {
        array.push(ObjectId());
    };
    return array;
}