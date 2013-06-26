/*
 * User
 *
 * @param
 * id
 * name
 * token
 * tokenSecret
 *
 * @key
 * hmn:user:id:1
 * hmn:user:name:uiureo
 */

var redisClient = require('../lib/redis');

exports = module.exports = User;

function User (data) {
  var self = this;

  ['id', 'name', 'token', 'tokenSecret'].forEach(function (property) {
    self[property] = data[property];
  });
}

exports.find = function (id, callback) {
  redisClient.jget('user:id:' + id, function (err, data) {
    callback(err, data && new User(data));
  });
};

exports.findByName = function (name, callback) {
  redisClient.jget('user:name:' + name, function (err, data) {
    callback(err, data && new User(data));
  });
};

exports.create = function (user, callback) {
  redisClient.incr('global:user_id', function (err, id) {
    user.id = id;

    redisClient.jset('user:id:' + user.id, user);

    redisClient.jset('user:name:' + user.name, user);

    callback(null, new User(user));
  });
};

exports.findOrCreate = function (params, callback) {
  var self = this;
  if (!params.name) {
    throw new TypeError("first arg must include 'name' property.");
  }

  self.findByName(params.name, function (err, user) {
    if (user) {
      callback(null, user);
    } else {
      self.create(params, function (err, created_user) {
        callback(null, created_user);
      });
    }
  });
};

