# Planum game processing script #
#       Jorge Madrid            #
# TODO implement round change   #

require 'mongo'
include Mongo

mongo_client = MongoClient.new("mongodb", 27017)

planum = mongo_client.db('planum')

games_coll = planum.collection('games')
rounds_coll = planum.collection('rounds')
publications_coll = planum.collection('publications')
songqueue_coll = planum.collection('songqueues')
songs_coll = planum.collection('songs')

active_games = games_coll.find(:active => true)

active_games.each { |game|
  players_with_publications = []
  active_round = rounds_coll.find_one(game['activeRound'])
  players_ids = game['players']

  # Find the players that already have publications
  publications = publications_coll.find(:round => active_round['_id'])
  publications.each { |publication| players_with_publications.push(publication['player']) }

  available_players = players_ids.select { |player| !players_with_publications.include?(player) }
  # Random player
  player_id = available_players.sample
  player_queue = songqueue_coll.find_one(:player => player_id)

  song_id = nil
  available_songs = player_queue['songs']
  if available_songs.empty?
    # Inefficient random search
    number_of_songs = songs_coll.count({})
    r = rand(number_of_songs - 1)
    song_id_cursor = songs_coll.find().limit(1).skip(r)
    song_id = song_id_cursor.to_a.first['_id']
  else
    song_id = player_queue['songs'].to_a.first
    # Pop the first song on the queue
    songqueue_coll.update({ :_id => player_queue['_id'] }, { '$pop' => { 'songs' => -1 } })
  end

  # Create the new publication
  new_publication = { 'song' => song_id, 'round' => active_round['_id'], 'player' => player_id, 'date' => Time.now.getutc }
  new_publication_id = publications_coll.insert(new_publication)

  # Push the publication into the active round
  rounds_coll.update({ :_id => active_round['_id'] }, { '$push' => { 'publications' => new_publication_id } })
}

