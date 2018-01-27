var API_URL = "https://www.googleapis.com/youtube/v3/";

function createUrl(api, options) {
  var url = API_URL + api;

  switch ((this.Client.getConfig().auth || {}).type) {
  case 'key':
    options.key = (this.Client.getConfig().auth || {}).key;
    break;
  case 'oauth':
    options.access_token = (this.Client.getConfig().auth || {}).token;
    break;
  }

  var i = -1;
  for (var opt in options) {
    if (options[opt] === undefined) {
      continue;
    }
    var value = options[opt];
    url += (++i === 0 ? "?" : "&") + opt + "=" + value;
  }
  return url;
}
exports.createUrl = createUrl;