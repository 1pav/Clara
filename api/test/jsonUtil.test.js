const jsonUtil = require('../utils/jsonUtil.js');
const timezone = require('moment-timezone');
const fs = require('fs');

test('timeSlotIndex(0,0) returns 0', () => {
  expect(jsonUtil.timeSlotIndex(0, 0)).toBe(0);
});

test('timeSlotIndex(16,39) returns 13', () => {
  expect(jsonUtil.timeSlotIndex(16, 39)).toBe(18);
});

test('timeSlotIndex(23,59) returns -1', () => {
  expect(jsonUtil.timeSlotIndex(23, 59)).toBe(-1);
});

test('asynchronous test of easyroom response format (getJsonByDepartment function)', () => {
  expect.assertions(1);
  return jsonUtil.getJsonByDepartment('E0503', timezone.tz("Europe/Rome").format("DD-MM-YYYY")).then((data) => {
    expect(data).toEqual(expect.objectContaining({
      area_rooms: expect.objectContaining({
        E0503: expect.any(Object),
        E0101: expect.any(Object),
        E0801: expect.any(Object),
        E0705: expect.any(Object),
        E0601: expect.any(Object),
        E0301: expect.any(Object),
        E0201: expect.any(Object)
      }),
      table: expect.any(Object)
    }));
  });
});

test('test function prettyJson that retrieve only useful data', () => {
  var jsonEasyRoom = JSON.parse(fs.readFileSync('./test/testData/jsonEasyRoom.json', 'utf8'));
  var jsonPretty = JSON.parse(fs.readFileSync('./test/testData/prettyPrinted.json', 'utf8'));
  expect(jsonUtil.prettifyJson(jsonEasyRoom)).toEqual(jsonPretty);
});

test('test function getRoomNamesFromDept that retrieve room list of department', () => {
  var jsonDbRoom = JSON.parse(fs.readFileSync('./test/testData/dbRoomtest.json', 'utf8'));
  var resDbRoom = JSON.parse(fs.readFileSync('./test/testData/resDbRoomJson.json', 'utf8'));
  expect(jsonUtil.getRoomNamesFromDept(jsonDbRoom["rooms"])).toEqual(resDbRoom);
});

test('test function getAvailablityJson with free room', () => {
  var jsonAvailability = JSON.parse(fs.readFileSync('./test/testData/availabilityRoomsNull.json', 'utf8'));
  var jsonResNull = JSON.parse(fs.readFileSync('./test/testData/availabilityResNull.json', 'utf8'));
  expect(jsonUtil.getAvailablityJson(jsonAvailability, 2)).toEqual(jsonResNull);
})


test('test function getAvailablityJson with occupied room', () => {
  var jsonAvailability = JSON.parse(fs.readFileSync('./test/testData/availabilityRooms.json', 'utf8'));
  var jsonResNull = JSON.parse(fs.readFileSync('./test/testData/availabilityRes.json', 'utf8'));
  expect(jsonUtil.getAvailablityJson(jsonAvailability, 2)).toEqual(jsonResNull);
})

test('test function getAvailablityJson with occupied room all day', () => {
  var jsonAvailability = JSON.parse(fs.readFileSync('./test/testData/availabilityRoomsFull.json', 'utf8'));
  var jsonResNull = JSON.parse(fs.readFileSync('./test/testData/availabilityResFull.json', 'utf8'));
  expect(jsonUtil.getAvailablityJson(jsonAvailability, 2)).toEqual(jsonResNull);
})

test('test function prettifyRoom with free room', () => {
  var prettifyJsonData = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomFreeJsonData.json', 'utf8'));
  var prettyJson = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomFreeJsonDataRes.json', 'utf8'));
  expect(jsonUtil.prettifyRoom(prettifyJsonData, 2)).toEqual(prettyJson);
})


test('test function prettifyRoom with occupied room', () => {
  var prettifyJsonData = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomJsonData.json', 'utf8'));
  var prettyJson = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomJsonDataRes.json', 'utf8'));
  expect(jsonUtil.prettifyRoom(prettifyJsonData, 2)).toEqual(prettyJson);
})

test('test function prettifyRoom with occupied room all day', () => {
  var prettifyJsonData = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomFullJsonData.json', 'utf8'));
  var prettyJson = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomFullJsonDataRes.json', 'utf8'));
  expect(jsonUtil.prettifyRoom(prettifyJsonData, 2)).toEqual(prettyJson);
})

test('test function prettifyRoom with malformed input', () => {
  var prettifyJsonData = JSON.parse(fs.readFileSync('./test/testData/prettifyRoomErrorJsonData.json', 'utf8'));
  expect(() => {
    jsonUtil.prettifyRoom(prettifyJsonData, 2)
  }).toThrow();
})