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

var REDIS_PREFIX = 'hmn:';

var redisClient = module.parent.exports.redisClient;

var User = {
  find : function (id, callback) {
    redisClient.get(REDIS_PREFIX + 'user:id:' + id, function (err, user_str) {
      callback(err, JSON.parse(user_str));
    });
  },

  findByName : function (name, callback) {
    redisClient.get(REDIS_PREFIX + 'user:name:' + name, function (err, user_str) {
      callback(err, JSON.parse(user_str));
    });
  },

  create : function (user, callback) {
    redisClient.incr(REDIS_PREFIX + 'global:user_id', function (err, id) {
      user.id = id;
      var data = JSON.stringify(user);

      redisClient.set(REDIS_PREFIX + 'user:id:' + user.id, data, function () {
        redisClient.set(REDIS_PREFIX + 'user:name:' + user.name, data, function () {
          callback(null, user);
        });
      });
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
