function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}
var deleteCookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

var Storage = {
  isHTML5: window.localStorage !== undefined,
  store: function(tokenInfo) {
    if(Storage.isHTML5) {
      Storage.storeInLocal(tokenInfo);
    }else {
      Storage.storeInCookies(tokenInfo);
    }
  },
  getValue: function(key) {
    if(Storage.isHTML5) {
      return window.localStorage.getItem(key);
    }else {
      return getCookie(key);
    }
  },
  storeInLocal: function(tokenInfo) {
    var localStorage = window.localStorage;
    localStorage.setItem('token_type', tokenInfo['token_type']);
    localStorage.setItem('access_token', tokenInfo['access_token']);
    localStorage.setItem('expires_in', tokenInfo['expires_in']);
    localStorage.setItem('refresh_token', tokenInfo['refresh_token']);
  },
  storeInCookies: function(tokenInfo) {
    document.cookie="token_type=" + tokenInfo['token_type'];
    document.cookie="access_token=" + tokenInfo['access_token'];
    document.cookie="expires_in=" + tokenInfo['expires_in'];
    document.cookie="refresh_token=" + tokenInfo['refresh_token'];
  },
  logout: function() {
    if(Storage.isHTML5) {
      localStorage.removeItem('token_type');
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('refresh_token');
    }else {
      deleteCookie('token_type');
      deleteCookie('access_token');
      deleteCookie('expires_in');
      deleteCookie('refresh_token');
    }
  }
}

var Oauth = {
  authenticate: function(user, password, cb) {
    var data = { grant_type: 'password', username: user, password: password };
    var request = $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      },
      url: 'http://54.76.208.124/oauth/token',
      data: data
    });

    var testRequest = function(token) {
      return $.ajax({
        type: 'GET',
        beforeSend: function(request) {
          request.setRequestHeader('Authorization', 'Bearer ' + token)
        },
        url: 'http://54.76.208.124/oauth/test'
      });
    }

    request.done(function(tokenInfo) {
      var tokenInfoJson = JSON.parse(tokenInfo);
      Storage.store(tokenInfoJson);
      var _testRequest = testRequest(tokenInfoJson.access_token);
      _testRequest.done(function(tokenTest) {
        if(tokenTest.ok) {
          setTimeout(function() {
            Oauth.refresh();
          }, 100000);
          cb(false);
        }else {
          cb(true);
        }
      });
      _testRequest.fail(function(jqXHR, textStatus) {
        cb(true);
      });
    });

    request.fail(function(jqXHR, textStatus) {
      cb(true);
    });
  },
  refresh: function(cb) {
    var data = { grant_type: 'refresh_token', refresh_token: Storage.getValue('refresh_token') };
    var request = $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      },
      url: 'http://54.76.208.124/oauth/token',
      data: data
    });
    request.done(function(tokenInfo) {
      var tokenInfoJson = JSON.parse(tokenInfo);
      Storage.store(tokenInfoJson);
      cb(false);
    });
    request.fail(function(jqXHR, textStatus) {
      cb(true);
    });
  },
  getToken: function() {
    return Storage.getValue('access_token');
  },
  isAuthenticated: function() {
    // Check time...
    var token = Oauth.getToken();
    return (token != '' || token != null);
  },
  logout: function(cb) {
    var token = Oauth.getToken();
    var request = $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      url: 'http://54.76.208.124/oauth/logout'
    });
    request.done(function(status) {
      console.log(status);
      if(status.ok) {
        Storage.logout();
        cb(false);
      } else {
        cb(true);
      }
    });
    request.fail(function(jqXHR, textStatus) {
      console.log(jqXHR);
      console.log(textStatus);
      cb(true);
    });
  }
}