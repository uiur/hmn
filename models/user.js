/*
 * User
 *
 * @param
 * id
 * name
 * token
 * token_secret
 *
 * @key
 * hmn:user:id:1
 * hmn:user:name:uiureo
 */

var redisClient = require('../lib/redis');

var User = {
  find : function (id, callback) {
    redisClient.jget('user:id:' + id, function (err, user) {
      callback(err, user);
    });
  },

  findByName : function (name, callback) {
    redisClient.jget('user:name:' + name, function (err, user) {
      callback(err, user);
    });
  },

  create : function (user, callback) {
    redisClient.incr('global:user_id', function (err, id) {
      user.id = id;

      redisClient.jset('user:id:' + user.id, user);

      redisClient.jset('user:name:' + user.name, user);

      callback(null, user);
    });
  },

  findOrCreate : function (params, callback) {
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
  }
};

module.exports = User;
