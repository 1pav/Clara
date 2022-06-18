const Issue = require("../models/Issue.js"),
  mongoose = require("mongoose"),
  User = require("../models/User.js"),
  utils = require("../utils/jsonUtil.js"),
  timezone = require("moment-timezone"),
  request = require('request-promise-native');
const claraUrl = 'https://clara-unitn.herokuapp.com/issues';
var id, id2;
test('test of route /issues add issue', () => {
  expect.assertions(1);
  return Promise.all([
    request.post(claraUrl, {
      form: {
        loginId: '123456789123456789123',
        deptName: 'povo',
        roomName: 'Aula A101',
        type: 'testing',
        description: 'jest test is like a stress test but stronger'
      }
    }),
    request.post(claraUrl, {
      form: {
        loginId: '123456789123456789123',
        deptName: 'sociologia',
        roomName: 'Aula 2',
        type: 'testing',
        description: 'This is a test issue 1 2 3 TEST ISSUE 1 2 3 FULL BRIDGE RECTIFIER'
      }
    })
  ]).then((data) => {
    expect(data).toEqual(["OK", "OK"]);
  });
});

test('test of route /issues add issue with not valid id', () => {
  expect.assertions(1);
  return request.post(claraUrl, {
    form: {
      loginId: 'a not valid id',
      deptName: 'povo',
      roomName: 'Aula A101', // dd-mm-yyyy
      type: 'testing',
      description: 'jest test is like a stress test but stronger'
    }
  }).catch((errorResponse) => {
    var errorMessage = JSON.parse(errorResponse["error"]);
    expect(errorMessage).toEqual({
      error: {
        message: "invalid user"
      }
    });
  });
});

test('test of route /issues get issue with no filter', () => {
  expect.assertions(1);
  return request.get(claraUrl)
    .then((data) => {
      data = JSON.parse(data);

      var valid1 = false;
      var valid2 = false;
      for (var i = 0; i < data.length && !valid; i++) {
        if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "jest test is like a stress test but stronger" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula A101" &&
            data[i]["deptName"] == "povo")) {
          id = data[i]["_id"];
          valid1 = true;
        } else if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "This is a test issue 1 2 3 TEST ISSUE 1 2 3 FULL BRIDGE RECTIFIER" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula 2" &&
            data[i]["deptName"] == "sociologia")) {
          id2 = data[i]["_id"];
          valid2 = true;
        }
      }
      var valid = valid1 && valid2;
      expect(valid).toBe(true);
    });
});

test('test of route /issues get issue with full filter', () => {
  expect.assertions(1);
  return request.get(claraUrl + '?deptName=povo&roomName=Aula A101')
    .then((data) => {
      data = JSON.parse(data);

      var valid1 = false;
      var valid2 = false;
      for (var i = 0; i < data.length && !valid; i++) {
        if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "jest test is like a stress test but stronger" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula A101" &&
            data[i]["deptName"] == "povo")) {
          valid1 = true;
        } else if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "This is a test issue 1 2 3 TEST ISSUE 1 2 3 FULL BRIDGE RECTIFIER" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula 2" &&
            data[i]["deptName"] == "sociologia")) {
          valid2 = true;
        }
      }
      var valid = valid1 && !valid2;
      expect(valid).toBe(true);
    });
});

test('test of route /issues get issue with just the department filter', () => {
  expect.assertions(1);
  return request.get(claraUrl + '?deptName=povo')
    .then((data) => {
      data = JSON.parse(data);

      var valid1 = false;
      var valid2 = false;
      for (var i = 0; i < data.length && !valid; i++) {
        if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "jest test is like a stress test but stronger" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula A101" &&
            data[i]["deptName"] == "povo")) {
          valid1 = true;
        } else if ((data[i]["reporterMail"] == "clara150ore@example.org" &&
            data[i]["reportingDate"] == timezone().tz("Europe/Rome").format("DD-MM-YYYY") &&
            data[i]["description"] == "This is a test issue 1 2 3 TEST ISSUE 1 2 3 FULL BRIDGE RECTIFIER" &&
            data[i]["type"] == "testing" &&
            data[i]["roomName"] == "Aula 2" &&
            data[i]["deptName"] == "sociologia")) {
          valid2 = true;
        }
      }
      var valid = valid1 && !valid2;
      expect(valid).toBe(true);
    });
});

test('test of route /issues get issue with wrong just roomName filter', () => {
  expect.assertions(1);
  return request.get(claraUrl + '?roomName=Aula A101')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse["error"]);
      expect(errorMessage).toEqual({
        error: {
          message: "issues request invalid"
        }
      });
    });

});

test('test of route /issues delete issue', () => {
  expect.assertions(1);
  return request.delete(claraUrl, {
    form: {
      loginId: 'definitely not a correct id',
      issueID: id
    }
  }).catch((errorResponse) => {
    var errorMessage = JSON.parse(errorResponse["error"]);
    expect(errorMessage).toEqual({
      error: {
        message: "error inexistent/unauthorized user"
      }
    });
  });
});

test('test of route /issues delete issue', () => {
  expect.assertions(1);
  return Promise.all([
    request.delete(claraUrl, {
      form: {
        loginId: '123456789123456789123',
        issueId: id
      }
    }),
    request.delete(claraUrl, {
      form: {
        loginId: '123456789123456789123',
        issueId: id2
      }
    })
  ]).then((data) => {
    expect(data).toEqual(["OK", "OK"]);
  });
});