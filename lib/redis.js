/*
 * a redis wrapper
 */

var client = require('redis').createClient();

exports = module.exports = client;

// TODO: configに移す
var KEY_PREFIX = 'hmn:';

function prefix(key) {
  return KEY_PREFIX + key;
}

// set a json object to a key
exports.jset = function (key, value, callback) {
  var data = JSON.stringify(value);

  client.set(prefix(key), data, callback);
};

// get a json object of a key
exports.jget = function (key, callback) {
  client.get(prefix(key), function (err, value) {
    var data;
    try {
      data = JSON.parse(value);
    } catch (e) { throw e; }

    callback(err, data);
  });
};
