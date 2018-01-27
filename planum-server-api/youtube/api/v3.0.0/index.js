module.exports = function () {
  var apis = [
    "search",
    "thumbnails"
  ];

  for (var i in apis) {
    var api = require("./" + apis[i]);
    this[apis[i]] = api;
    this[apis[i]].Client = this;
  }
};