// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-filters
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var assert = require('assert');
var should = require('should');
var filter = require('../');
var users;

describe('filter', function() {
  before(seed);

  it('should allow to find using like', function(done) {
    applyFilter({where: {name: {like: '%St%'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 2);
      done();
    });
  });

  it('should allow to find using like with options', function(done) {
    applyFilter({where: {name: {like: '%St%', options: 'i'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 3);
      done();
    });
  });

  it('should support like for no match', function(done) {
    applyFilter({where: {name: {like: 'M%XY'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 0);
      done();
    });
  });

  it('should allow to find using nlike', function(done) {
    applyFilter({where: {name: {nlike: '%St%'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 4);
      done();
    });
  });

  it('should allow to find using nlike with options', function(done) {
    applyFilter({where: {name: {nlike: '%St%', options: 'i'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 3);
      done();
    });
  });

  it('should support nlike for no match', function(done) {
    applyFilter({where: {name: {nlike: 'M%XY'}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 6);
      done();
    });
  });

  it('should allow to find using an \'and\' filter ', function(done) {
    var andFilter = [
      {vip: true},
      {role: 'lead'},
    ];
    applyFilter({where: {and: andFilter}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 2);
      done();
    });
  });
  it('should allow to find using regexp', function(done) {
    applyFilter({where: {name: {regexp: /John/}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 1);
      done();
    });
  });

  it('should allow to find using an \'or\' filter ', function(done) {
    var orFilter = [
      {name: 'John Lennon'},
      {name: 'Paul McCartney'},
    ];
    applyFilter({where: {or: orFilter}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 2);
      done();
    });
  });

  it('should allow to find using nin', function(done) {
    applyFilter({where: {name: {nin: ['George Harrison']}}}, function(err, users) {
      should.not.exist(err);
      users.should.have.property('length', 5);
      done();
    });
  });
  // input validation
  describe.skip('invalid input', function() {
    it(
      'should throw if the regexp value is not string or regexp',
      function(done) {
        applyFilter({where: {name: {regexp: 123}}}, function(err, users) {
          should.exist(err);
          should.equal(err.message, 'Invalid regular expression passed to regexp query.');
          done();
        });
      }
    );

    it(
      'should throw if the like value is not string or regexp',
      function(done) {
        applyFilter({where: {name: {like: 123}}}, function(err, users) {
          should.exist(err);
          done();
        });
      }
    );

    it(
      'should throw if the nlike value is not string or regexp',
      function(done) {
        applyFilter({where: {name: {nlike: 123}}}, function(err, users) {
          should.exist(err);
          done();
        });
      }
    );

    it('should throw if the inq value is not an array', function(done) {
      applyFilter({where: {name: {inq: '12'}}}, function(err, users) {
        should.exist(err);
        done();
      });
    });

    it('should throw if the nin value is not an array', function(done) {
      applyFilter({where: {name: {nin: '12'}}}, function(err, users) {
        should.exist(err);
        done();
      });
    });

    it('should throw if the between value is not an array', function(done) {
      applyFilter({where: {name: {between: '12'}}}, function(err, users) {
        should.exist(err);
        done();
      });
    });

    it(
      'should throw if the between value is not an array of length 2',
      function(done) {
        applyFilter({where: {name: {between: ['12']}}}, function(err, users) {
          should.exist(err);
          done();
        });
      }
    );
  });

  it('should successfully extract 5 users from the db', function(done) {
    applyFilter({where: {seq: {between: [1, 5]}}}, function(err, users) {
      should(users.length).be.equal(5);
      done();
    });
  });

  it('should successfully extract 1 user (Lennon) from the db', function(done) {
    applyFilter({
      where: {birthday: {between: [new Date(1970, 0), new Date(1990, 0)]}},
    },
    function(err, users) {
      should(users.length).be.equal(1);
      should(users[0].name).be.equal('John Lennon');
      done();
    });
  });

  it('should successfully extract 2 users from the db', function(done) {
    applyFilter({
      where: {birthday: {between: [new Date(1940, 0), new Date(1990, 0)]}},
    },
    function(err, users) {
      should(users.length).be.equal(2);
      done();
    });
  });

  it('should successfully extract 0 user from the db', function(done) {
    applyFilter({where: {birthday: {between: [new Date(1990, 0), Date.now()]}}},
      function(err, users) {
        should(users.length).be.equal(0);
        done();
      });
  });

  it('should support order with multiple fields', function(done) {
    applyFilter({order: 'vip ASC, seq DESC'}, function(err, users) {
      should.not.exist(err);
      users[0].seq.should.be.eql(4);
      users[1].seq.should.be.eql(3);
      done();
    });
  });

  it('should sort undefined values to the end when ordered DESC',
    function(done) {
      applyFilter({order: 'vip ASC, order DESC'}, function(err, users) {
        should.not.exist(err);

        users[4].seq.should.be.eql(1);
        users[5].seq.should.be.eql(0);
        done();
      });
    });

  it('should throw if order has wrong direction', function(done) {
    applyFilter({order: 'seq ABC'}, function(err, users) {
      should.exist(err);
      done();
    });
  });

  it('should support neq operator for number', function(done) {
    applyFilter({where: {seq: {neq: 4}}}, function(err, users) {
      should.not.exist(err);
      users.length.should.be.equal(5);
      for (var i = 0; i < users.length; i++) {
        users[i].seq.should.not.be.equal(4);
      }
      done();
    });
  });

  it('should support neq operator for string', function(done) {
    applyFilter({where: {role: {neq: 'lead'}}}, function(err, users) {
      should.not.exist(err);
      users.length.should.be.equal(4);
      for (var i = 0; i < users.length; i++) {
        if (users[i].role) {
          users[i].role.not.be.equal('lead');
        }
      }
      done();
    });
  });

  it('should support neq operator for null', function(done) {
    applyFilter({where: {role: {neq: null}}}, function(err, users) {
      should.not.exist(err);
      users.length.should.be.equal(2);
      for (var i = 0; i < users.length; i++) {
        should.exist(users[i].role);
      }
      done();
    });
  });

  it('should support nested property in query', function(done) {
    applyFilter({where: {'address.city': 'San Jose'}}, function(err, users) {
      should.not.exist(err);
      users.length.should.be.equal(1);
      for (var i = 0; i < users.length; i++) {
        users[i].address.city.should.be.eql('San Jose');
      }
      done();
    });
  });

  it('should support nested property with gt in query', function(done) {
    applyFilter({where: {'address.city': {gt: 'San'}}}, function(err, users) {
      should.not.exist(err);
      users.length.should.be.equal(2);
      for (var i = 0; i < users.length; i++) {
        users[i].address.state.should.be.eql('CA');
      }
      done();
    });
  });

  it('should support nested property for order in query', function(done) {
    applyFilter({where: {'address.state': 'CA'}, order: 'address.city DESC'},
      function(err, users) {
        should.not.exist(err);
        users.length.should.be.equal(2);
        users[0].address.city.should.be.eql('San Mateo');
        users[1].address.city.should.be.eql('San Jose');
        done();
      });
  });
});

// this weird function allows us to
// re-use the tests from juggler
function applyFilter(filterObj, cb) {
  var result;

  try {
    result = filter(users, filterObj);
  } catch (e) {
    return cb(e);
  }

  cb(null, result);
}

function seed() {
  users = [
    {
      seq: 0,
      name: 'John Lennon',
      email: 'john@b3atl3s.co.uk',
      role: 'lead',
      birthday: new Date('1980-12-08'),
      vip: true,
      address: {
        street: '123 A St',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95131',
      },
    },
    {
      seq: 1,
      name: 'Paul McCartney',
      email: 'paul@b3atl3s.co.uk',
      role: 'lead',
      birthday: new Date('1942-06-18'),
      order: 1,
      vip: true,
      address: {
        street: '456 B St',
        city: 'San Mateo',
        state: 'CA',
        zipCode: '94065',
      },
    },
    {seq: 2, name: 'George Harrison', order: 5, vip: false},
    {seq: 3, name: 'Ringo Starr', order: 6, vip: false},
    {seq: 4, name: 'Pete Best', order: 4},
    {seq: 5, name: 'Stuart Sutcliffe', order: 3, vip: true},
  ];
}
