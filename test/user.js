var redis = require('redis')
  , redisClient = require('../lib/redis')
  , should = require('should')
  , User = require('./../models/user');

var Helper = {
  reset: function (done) {
    var self = this;

    redisClient.flushdb(done);
  }
};

describe('User', function () {
  before(function (done) {
    redisClient.on('ready', function () {
      redisClient.select(11, done);
    });
  });

  describe('create', function () {
    beforeEach(function (done) {
      Helper.reset(done);
    });

    it('should return an user object', function (done) {
      User.create({ name: '1', token: 'a', tokenSecret: 'b' }, function (err, user) {
        user.should.be.a('object').and
                   .have.property('id', 1);
        done();
      });
    });
  });

  describe('find', function () {
    before(function (done) {
      Helper.reset(function () {
        User.create({ name: '1', token: 'a', tokenSecret: 'b' }, done);
      });
    });

    it('should return a correct user', function (done) {
      User.find(1, function (err, user) {
        user.should.have.property('name', '1');
        done();
      });
    });
  });

  describe('findByName', function () {
    before(function (done) {
      Helper.reset(function () {
        User.create({ name: '1', token: 'a', tokenSecret: 'b' }, done);
      });
    });

    it('should return a correct user', function (done) {
      User.findByName('1', function (err, user) {
        user.should.have.property('id', 1);
        done();
      });
    });
  });

  describe('findOrCreate', function () {
    before(function (done) {
      Helper.reset(function () {
        User.create({ name: '1', token: 'a', tokenSecret: 'b' }, done);
      });
    });

    it('should throw error when args is not valid', function () {
      (function () {
        User.findOrCreate({ token: 'a', tokenSecret: 'b' }, function () {});
      }).should.throw();
    });

    it('should return a correct user', function (done) {
      User.findOrCreate({ name: '1', token: 'a', tokenSecret: 'b' }, function (err, user) {
        user.should.have.property('id', 1);
        done();
      });
    });

    it('should create an user when not exist', function (done) {
      User.findOrCreate({ name: '2', token: 'a', tokenSecret: 'b'}, function (err, user) {
        user.should.have.property('id', 2);
        done();
      });
    });
  });
});
