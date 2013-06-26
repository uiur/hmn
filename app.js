// TODO: SessionStoreをRedisに

/**
 * Module dependencies.
 */

var express = require('express')
  , connect = require('connect')
  , routes = require('./routes')
  , passport = require('passport')
  , http = require('http')
  , path = require('path')
  , Config = require('./config')
  , TwitterStrategy = require('passport-twitter').Strategy
  , redisClient = exports.redisClient = require('redis').createClient()
  , MemoryStore = express.session.MemoryStore
  , sessionStore = new MemoryStore()
  , parseCookie = require('cookie').parse;

// Models
var User = require('./models/user');

var app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: Config.session_secret, store: sessionStore }));
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.find(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new TwitterStrategy(
  {
    consumerKey: Config.twitter.consumer_key,
    consumerSecret: Config.twitter.consumer_secret,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function (token, tokenSecret, profile, done) {
    var params = { name: profile.username, token: token, tokenSecret: tokenSecret };

    User.findOrCreate(params, function (err, user) {
      done(null, user);
    });
  }
));


app.get('/', routes.index);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' }));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

io.configure(function () {
  // socket.handshake.userからユーザーのオブジェクトにアクセスできるように
  io.set('authorization', function (handshakeData, callback) {
    if (!handshakeData.headers.cookie) {
      callback('cookie not found', false);
      return;
    }

    var cookie = handshakeData.headers.cookie
      , signedCookie = parseCookie(cookie)['connect.sid'];

    var sessionID = connect.utils.parseSignedCookie(signedCookie, Config.session_secret);

    sessionStore.get(sessionID, function (err, session) {
      if (err) {
        callback(err.message, false);
      } else {
        User.find(session.passport.user, function (err, user) {
          handshakeData.user = user;
          callback(null, true);
        });
      }
    });
  });
});

io.sockets.on('connection', function (socket) {
  socket.on('post_entry', function (entry) {
    var user = socket.handshake.user;
    entry.name = user.name;

    socket.broadcast.emit('entry', entry);
  });
});

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
