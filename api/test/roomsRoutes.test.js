const request = require('request-promise-native');
const moment = require('moment');
const timezone = require('moment-timezone');

const claraUrl = 'https://clara-unitn.herokuapp.com';

test('test of route /departments response', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments')
    .then((depts) => {
      depts = JSON.parse(depts);
      expect(depts).toEqual({
        "cla": "Centro Linguistico d'Ateneo",
        "povo": "Povo",
        "economia": "Dipartimento di Economia e Management",
        "lettere": "Dipartimento di Lettere e Filosofia",
        "psicologia": "Dipartimento di Psicologia e Scienze Cognitive",
        "sociologia": "Dipartimento di Sociologia e Ricerca Sociale",
        "mesiano": "Dipartimento Ingegneria Civile Ambientale Meccanica",
        "giurisprudenza": "Facoltà di Giurisprudenza"
      });
    });
});


test('test of response format for route /departments/:deptName/roomlist (called with right path parameter "lettere")', () => {
  expect.assertions(2);
  return request.get(claraUrl + '/departments/lettere/roomlist')
    .then((roomsStringJson) => {
      var roomsJson = JSON.parse(roomsStringJson);
      expect(roomsJson).toEqual({
        roomList: expect.any(Array)
      });
      var roomList = roomsJson["roomList"];
      var wellFormed = true;
      for (var i = 0; i < roomList.length && wellFormed; i++) {
        if (typeof roomList[i] != 'string') {
          wellFormed = false;
        }
      }
      expect(wellFormed).toBe(true);
    });
});

test('test of response format for route /departments/:deptName/roomlist (called with wrong path parameter "informatica")', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/informatica/roomlist')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse['error']);
      expect(errorMessage).toEqual({
        error: {
          message: "Cannot read property 'rooms' of null"
        }
      })
    });
});


test('test of response format for route /departments/:deptName, with deptName path parameter "povo"', () => {
  expect.assertions(2);
  return request.get(claraUrl + '/departments/povo')
    .then((availableRooms) => {
      availableRooms = JSON.parse(availableRooms);
      var hours = timezone().tz('Europe/Rome').format('HH');
      expect(availableRooms).toEqual(expect.objectContaining({
        items: expect.any(Array)
      }));
      var rooms = availableRooms['items'];
      if (hours == '23') {
        expect(rooms.length).toBe(0);
      } else {
        var wellFormed = true;
        for (var i = 0; i < rooms.length && wellFormed; i++) {
          if (!(rooms[i].hasOwnProperty('roomName') &&
              (typeof rooms[i]['roomName'] == 'string') &&
              rooms[i].hasOwnProperty('score') &&
              (typeof rooms[i]['score'] == 'number') &&
              (rooms[i]['score'] < 5.1) &&
              rooms[i].hasOwnProperty('seats') &&
              (typeof rooms[i]['seats'] == 'number') &&
              rooms[i].hasOwnProperty('electricalSockets') &&
              (typeof rooms[i]['electricalSockets'] == 'boolean') &&
              rooms[i].hasOwnProperty('availability') &&
              rooms[i]['availability'].hasOwnProperty('begin') &&
              moment(rooms[i]['availability']['begin'], "HH:mm").isValid() &&
              rooms[i]['availability'].hasOwnProperty('end')) &&
            moment(rooms[i]['availability']['end'], "HH:mm").isValid() &&
            (moment(rooms[i]['availability']['begin'], "HH:mm").diff(moment(rooms[i]['availability']['end'], "HH:mm")) < 0)
          ) {
            wellFormed = false;
          }
        }
        expect(wellFormed).toBe(true);
      }
    });
});

test('test of response format for route /departments/:deptName, with deptName=psicologia and valid query parameter time=13:01', () => {
  expect.assertions(2);
  return request.get(claraUrl + '/departments/psicologia?time=13:01')
    .then((availableRooms) => {
      availableRooms = JSON.parse(availableRooms);
      expect(availableRooms).toEqual(expect.objectContaining({
        items: expect.any(Array)
      }));

      var rooms = availableRooms['items'];
      var wellFormed = true;
      for (var i = 0; i < rooms.length && wellFormed; i++) {
        if (!(rooms[i].hasOwnProperty('roomName') &&
            (typeof rooms[i]['roomName'] == 'string') &&
            rooms[i].hasOwnProperty('score') &&
            (typeof rooms[i]['score'] == 'number') &&
            (rooms[i]['score'] < 5.1) &&
            rooms[i].hasOwnProperty('seats') &&
            (typeof rooms[i]['seats'] == 'number') &&
            rooms[i].hasOwnProperty('electricalSockets') &&
            (typeof rooms[i]['electricalSockets'] == 'boolean') &&
            rooms[i].hasOwnProperty('availability') &&
            rooms[i]['availability'].hasOwnProperty('begin') &&
            moment(rooms[i]['availability']['begin'], "HH:mm").isValid() &&
            (moment(rooms[i]['availability']['begin'], "HH:mm").hour() >= 13) &&
            rooms[i]['availability'].hasOwnProperty('end')) &&
          moment(rooms[i]['availability']['end'], "HH:mm").isValid() &&
          (moment(rooms[i]['availability']['begin'], "HH:mm").diff(moment(rooms[i]['availability']['end'], "HH:mm")) < 0)
        ) {
          wellFormed = false;
        }
      }
      expect(wellFormed).toBe(true);
    });
});

test('test of response format for route /departments/:deptName with deptName=economia and invalid query parameter time=25:01', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/economia?time=25:01')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse['error']);
      expect(errorMessage).toEqual({
        error: {
          message: "Time not set or invalid"
        }
      })
    });
});

test('test of response format for route /departments/:deptName with deptName=mesiano and valid query parameters time=15:49 & date=(CET tomorrow date)', () => {
  expect.assertions(2);
  var tomorrow_date = timezone().tz('Europe/Rome').add(1, 'days').format('DD-MM-YYYY');
  return request.get(claraUrl + '/departments/mesiano?time=15:49&date=' + tomorrow_date)
    .then((availableRooms) => {
      availableRooms = JSON.parse(availableRooms);
      expect(availableRooms).toEqual(expect.objectContaining({
        items: expect.any(Array)
      }));

      var rooms = availableRooms['items'];
      var wellFormed = true;
      for (var i = 0; i < rooms.length && wellFormed; i++) {
        if (!(rooms[i].hasOwnProperty('roomName') &&
            (typeof rooms[i]['roomName'] == 'string') &&
            rooms[i].hasOwnProperty('score') &&
            (typeof rooms[i]['score'] == 'number') &&
            (rooms[i]['score'] < 5.1) &&
            rooms[i].hasOwnProperty('seats') &&
            (typeof rooms[i]['seats'] == 'number') &&
            rooms[i].hasOwnProperty('electricalSockets') &&
            (typeof rooms[i]['electricalSockets'] == 'boolean') &&
            rooms[i].hasOwnProperty('availability') &&
            rooms[i]['availability'].hasOwnProperty('begin') &&
            moment(rooms[i]['availability']['begin'], "HH:mm").isValid() &&
            ((rooms[i]['availability']['begin'] == '15:30') || (moment(rooms[i]['availability']['begin'], "HH:mm").hour() >= 16)) &&
            rooms[i]['availability'].hasOwnProperty('end')) &&
          moment(rooms[i]['availability']['end'], "HH:mm").isValid() &&
          (moment(rooms[i]['availability']['begin'], "HH:mm").diff(moment(rooms[i]['availability']['end'], "HH:mm")) < 0)
        ) {
          wellFormed = false;
        }
      }
      expect(wellFormed).toBe(true);
    });
});

test('test of response format for route /departments/:deptName with deptName=giurisprudenza, time=12:53 and invalid query parameter date=31-11-2017', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/giurisprudenza?time=12:53&date=31-11-2017')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse['error']);
      expect(errorMessage).toEqual({
        error: {
          message: "Date not valid"
        }
      })
    });
});

test('test of response format for route /departments/:deptName with deptName=sociologia, valid query parameter date=(CET tomorrow date) and lack of time', () => {
  expect.assertions(1);
  var tomorrow_date = timezone().tz('Europe/Rome').add(1, 'days').format('DD-MM-YYYY');
  return request.get(claraUrl + '/departments/sociologia?date=' + tomorrow_date)
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse['error']);
      expect(errorMessage).toEqual({
        error: {
          message: "Time not set or invalid"
        }
      })
    });
});

test('test of route /departments/:deptName (called with wrong path parameter "informatica") response format', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/informatica')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse["error"]);
      expect(errorMessage).toEqual({
        error: {
          message: "Cannot read property 'rooms' of null"
        }
      })
    });
});

test('test of response format for route /departments/:deptName/:roomName with valid deptName = "povo" and valid roomName = "Aula A101"', () => {
  expect.assertions(2);
  return request.get(claraUrl + '/departments/povo/Aula A101')
    .then((roomInfo) => {
      roomInfo = JSON.parse(roomInfo);
      expect(roomInfo).toEqual({
        roomName: "Aula A101",
        seats: 190,
        electricalSockets: true,
        slots: expect.any(Object)
      });

      var slots = roomInfo['slots'];
      var wellFormed = true;

      var times = Object.keys(slots)
      for (let i = 0; i < times.length && wellFormed; i++) {
        var hour = times[i].split("-");
        var lesson = slots[times[i]];
        if (!((typeof lesson == 'string') &&
            moment(hour[0], "HH:mm").isValid() &&
            moment(hour[1], "HH:mm").isValid() &&
            (moment(hour[0], "HH:mm").diff(moment(hour[1], "HH:mm")) < 0))) {
          wellFormed = false;
        }
      }
      expect(wellFormed).toBe(true);
    });
});

test('test of response format for route /departments/:deptName/:roomName with valid deptName = "povo" and valid roomName = "Aula A101", valid query parameter date=(CET tomorrow date)', () => {
  expect.assertions(2);
  var tomorrow_date = timezone().tz('Europe/Rome').add(1, 'days').format('DD-MM-YYYY');
  return request.get(claraUrl + '/departments/povo/Aula A101?date=' + tomorrow_date)
    .then((roomInfo) => {
      roomInfo = JSON.parse(roomInfo);
      expect(roomInfo).toEqual({
        roomName: "Aula A101",
        seats: 190,
        electricalSockets: true,
        slots: expect.any(Object)
      });

      var slots = roomInfo['slots'];
      var wellFormed = true;

      var times = Object.keys(slots)
      for (let i = 0; i < times.length && wellFormed; i++) {
        var hour = times[i].split("-");
        var lesson = slots[times[i]];
        if (!((typeof lesson == 'string') &&
            moment(hour[0], "HH:mm").isValid() &&
            moment(hour[1], "HH:mm").isValid() &&
            (moment(hour[0], "HH:mm").diff(moment(hour[1], "HH:mm")) < 0))) {
          wellFormed = false;
        }
      }
      expect(wellFormed).toBe(true);
    });
});

test('test of response format for route /departments/:deptName/:roomName with valid deptName = "povo" and valid roomName = "Aula A101", invalid query parameter date=31-11-2017', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/povo/Aula A101?date=31-11-2017')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse["error"]);
      expect(errorMessage).toEqual({
        error: {
          message: "Date not valid"
        }
      })
    });
});

test('test of response format for route /departments/:deptName/:roomName with invalid deptName = "informatica" and roomName = "Aula A101"', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/informatica/Aula A101')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse["error"]);
      expect(errorMessage).toEqual({
        error: {
          message: "Cannot read property 'rooms' of null"
        }
      })
    });
});

test('test of response format for route /departments/:deptName/:roomName with valid deptName = "povo" and invalid roomName = "Aula c101"', () => {
  expect.assertions(1);
  return request.get(claraUrl + '/departments/povo/Aula c101')
    .catch((errorResponse) => {
      var errorMessage = JSON.parse(errorResponse["error"]);
      expect(errorMessage).toEqual({
        error: {
          message: "Cannot read property 'slots' of undefined"
        }
      })
    });
});