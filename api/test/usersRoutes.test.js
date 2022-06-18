const User = require("../models/User.js"),
  mongoose = require("mongoose"),
  request = require('request-promise-native');
const claraUrl = 'https://clara-unitn.herokuapp.com/users';
mongoose.Promise = global.Promise;
var options = {
  useMongoClient: true,
  user: '',
  pass: ''
};

/*
  WARNING: this test suite will fail if executed on university network.
  The first lines of the first test case have been added due to university networks issues
  in removing test user from database (see last test case).
*/
test('test of route /users add user', () => {
  expect.assertions(1);
  var userMail = 'newuser@studenti.unitn.it';
  return mongoose.connect('', options)
    .then(() => {
      return User.findOneAndRemove({
          email: userMail
        })
        .then(() => {
          return User.findOneAndRemove({
            email: 'otheruser@studenti.unitn.it'
          });
        });
    }).then(() => {
      return request.post(claraUrl, {
        form: {
          email: userMail,
          loginId: '11',
          lastDept: 'povo'
        }
      });
    }).then((data) => {
      expect(data).toBe("OK");
    });
});

test('test of route /users/:email get user with email', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/newuser@studenti.unitn.it')
    .then((data) => {
      data = JSON.parse(data);

      expect(data).toEqual({
        email: "newuser@studenti.unitn.it",
        su: false,
        lastDept: "povo"
      });
    });
});

test('test of route /users add user with already email added', () => {
  expect.assertions(1);
  return request.post(claraUrl, {
    form: {
      email: 'newuser@studenti.unitn.it',
      loginId: '22',
      lastDept: 'povo'
    }
  }).catch((errorResponse) => {
    var errorMessage = JSON.parse(errorResponse["error"]);
    expect(errorMessage).toEqual({
      error: {
        message: "Already inserted user"
      }
    });
  });
});

test('test of route /users add user with already loginId added', () => {
  expect.assertions(1);
  var id = '11';
  return request.post(claraUrl, {
    form: {
      email: 'otheruser@studenti.unitn.it',
      loginId: id,
      lastDept: 'povo'
    }
  }).catch((errorResponse) => {
    var errorMessage = JSON.parse(errorResponse["error"]);
    expect(errorMessage).toEqual({
      error: {
        message: "E11000 duplicate key error index: heroku_110zmqh8.users.$loginId_1 dup key: { : \"" + id + "\" }"
      }
    });
  });
});

test('test of route /users/:email update user', () => {
  expect.assertions(1);
  var email = "newuser@studenti.unitn.it";
  var user;

  return request.put(claraUrl + '/' + email, {
    form: {
      lastDept: 'economia'
    }
  }).then(() => {
    return User.findOneAndRemove({
      email: email
    });
  }).then((utente) => {
    user = utente;
    return mongoose.disconnect();
  }).then(() => {
    expect(user.lastDept).toBe('economia');
  });
});