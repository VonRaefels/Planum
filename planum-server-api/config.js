var config = {};

config.port = '80';
config.url = 'http://planum.music:' + config.port + '/api';

config.oauthUrl = 'http://oauth.planum.com';

config.youtubeClient = 'AIzaSyAjot0rFQAskxREHoMee_MQ-n1bb1HljpI';

//?maxwidth=225&maxheight=225&mode=fillcropmid
config.freebaseImgURL = 'https://usercontent.googleapis.com/freebase/v1/image';


config.applyUrl = function(url, object, property) {
  if(object instanceof Array) {
    var counter = 0;
    object.forEach(function(item) {
      object[counter][property] = config.url + url.replace(':id', item[property]);
      counter++;
    });
  }else {
    object[property] = config.url + url.replace(':id', object[property]);
  }
}

// Expect array of Ids...
config.applyUrlToIdArray = function(url, array) {
  var counter = 0;
  array.forEach(function(item){
    array[counter] = config.url + url.replace(':id', item);
    counter++;
  });
}



module.exports = config;