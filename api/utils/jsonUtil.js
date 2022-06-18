const fs = require('fs');
const request = require('request-promise-native');

const easyroomUrl = 'https://easyroom.unitn.it/Orario/rooms_call.php'
const deptCodes = {
  'cla': 'CLA',
  'povo': 'E0503',
  'economia': 'E0101',
  'lettere': 'E0801',
  'psicologia': 'E0705',
  'sociologia': 'E0601',
  'mesiano': 'E0301',
  'giurisprudenza': 'E0201'
}
const deptNames = {
  'CLA': 'cla',
  'E0503': 'povo',
  'E0101': 'economia',
  'E0801': 'lettere',
  'E0705': 'psicologia',
  'E0601': 'sociologia',
  'E0301': 'mesiano',
  'E0201': 'giurisprudenza'
}
const deptFilter = {
  '': [],
  'E0503': ['aula Toblino', 'aula Lases', 'studio docente', 'LD Meccanica', 'Aula A216 (spazio polifunzionale)', 'Aula A217 (spazio polifunzionale)'],
  'E0101': [],
  'E0404': [],
  'E0705': [],
  'E0601': [],
  'E0301': [],
  'E0201': []
}

function prettifyJson(jsonObj) {
  prettyJson = {}


  Object.entries(jsonObj.table).forEach(([key, value]) => {
    var deptCode = jsonObj.deptCode;
    if (deptCode === "CLA") {
      deptCode = "";
    } else if (deptCode === "E0801") {
      deptCode = "E0404";
    }
    if (key.startsWith(deptCode)) {
      // Extract room name from `rooms` property
      room = jsonObj.rooms[key];
      // If room is *not* undefined, add it to prettyJson as key
      if (room !== undefined && !deptFilter[deptCode].includes(room.nome)) {
        prettyJson[room.nome] = [];
        // Populate room with events
        for (var i = 0; i < value.length; i++) {
          // If time slot has a non-empty value, add the event
          prettyJson[room.nome][i] = (value[i].length != 0) ? value[i].name : null;
        }
      }
    }
  });
  return prettyJson;
}

function getJsonByDepartment(deptCode, date) {
  return request.post(easyroomUrl, {
    form: {
      'form-type': 'rooms',
      sede: deptCode,
      date: date, // dd-mm-yyyy
      _lang: 'en'
    }
  }).then((data) => {
    data = JSON.parse(data);
    data.deptCode = deptCode;
    return (data);
  }).catch((error) => {
    Promise.reject('Failed to obtain/parse JSON object: ' + error);
  });
}

function getRoomNamesFromDept(dbRooms) {
  var resJson = {};
  var namesList = [];

  for (var i = 0; i < dbRooms.length; i++) {
    namesList.push(dbRooms[i]["roomName"]);
  }
  resJson["roomList"] = namesList;
  return resJson;
}

function timeSlotIndex(hours, minutes) {
  var dayminutes = (parseInt(hours)) * 60 + parseInt(minutes); //minuti trascorsi dalla mezzanotte
  var slot = parseInt(dayminutes / 30);
  if (0 <= slot && slot <= 15) {
    slot = 0;
  } else if (16 <= slot && slot <= 45) {
    slot = slot - 15;
  } else {
    slot = -1;
  }
  return slot;
}

function slotBegin(slot_index) {
  var hours;
  if (slot_index % 2 == 0) {
    hours = (slot_index / 2) + 7 + ":30";
  } else {
    hours = ((slot_index + 1) / 2) + 7 + ":00";
  }
  return hours;
}

function joinPrettyDbJson(dbJson, prettyJson) {
  for (var indexRoom = 0; indexRoom < dbJson["rooms"].length; indexRoom++) {
    for (var indexSlot = 0; indexSlot <= 30; indexSlot++) {
      if (prettyJson[dbJson["rooms"][indexRoom]["roomName"]] && prettyJson[dbJson["rooms"][indexRoom]["roomName"]][indexSlot] != "AULA STUDIO") {
        dbJson["rooms"][indexRoom]["slots"][indexSlot] = prettyJson[dbJson["rooms"][indexRoom]["roomName"]][indexSlot];
      } else {
        dbJson["rooms"][indexRoom]["slots"][indexSlot] = null;
      }
    }
  }
  return dbJson;
}

function getAvailablityJson(rooms_json, first_slot) {
  rooms = {
    "items": []
  };
  if (first_slot != -1) {
    var room_list = rooms_json["rooms"];
    for (var i = 0; i < room_list.length; i++) {
      room = room_list[i];
      var item = {};
      var score = 0;
      var weight = 1;
      var first_free_interval = {};
      var contiguity = false;

      for (var slot = first_slot; slot <= 30; slot++) {
        if (room["slots"][slot] == null) {
          if (score == 0) {
            first_free_interval["begin"] = slotBegin(slot);
            contiguity = true;
          }
          score = score + weight;
        } else if (contiguity == true) {
          first_free_interval["end"] = slotBegin(slot);
          contiguity = false;
        }
        weight = 0.8 * weight;
      }
      if (score != 0) {
        item["roomName"] = room["roomName"];
        item["score"] = score;
        if (first_free_interval["end"] == null) {
          first_free_interval["end"] = "23:00";
        }
        item["availability"] = first_free_interval;
        item["seats"] = room["seats"];
        item["electricalSockets"] = room["electricalSockets"];
        rooms["items"].push(item);
      }
    };
    if (rooms["items"].length > 0) {
      rooms["items"].sort(function (a, b) {
        return (b["score"] - a["score"]);
      });
    }
  }
  return rooms;
}

function getRoomFromDept(deptJson, roomName) {
  for (var i = 0; i < deptJson["rooms"].length; i++)
    if (deptJson["rooms"][i]["roomName"] == roomName)
      return deptJson["rooms"][i];
}

function prettifyRoom(jsonRoom, timeSlot) {
  var prettyRoom = {};
  var slotItems = {};
  var activity = jsonRoom["slots"][timeSlot];
  var begin = slotBegin(timeSlot);
  var end = null;
  for (var i = timeSlot + 1; i <= 30; i++) {
    if (jsonRoom["slots"][i] != activity) {
      end = slotBegin(i);
      var key = begin + "-" + end;
      if (activity == null) {
        activity = "Libera";
      }
      slotItems[key] = activity;

      activity = jsonRoom["slots"][i];
      begin = end;
      end = null;
    }
  }
  var key = begin + "-23:00";
  if (activity == null) {
    activity = "Libera";
  }
  slotItems[key] = activity;

  prettyRoom["roomName"] = jsonRoom["roomName"];
  prettyRoom["seats"] = jsonRoom["seats"];
  prettyRoom["electricalSockets"] = jsonRoom["electricalSockets"];
  prettyRoom["slots"] = slotItems;
  return prettyRoom;
}

function joinDbRoomActivityJson(jsonRoom, roomActivities) {
  for (var i = 0; i <= 30; i++) {
    if (roomActivities && roomActivities[i] != "AULA STUDIO") {
      jsonRoom["slots"][i] = roomActivities[i];
    } else {
      jsonRoom["slots"][i] = null;
    }
  }
  return jsonRoom;
}

function getRoomIssuesFromDept(deptJson, roomName) {
  var issues = [];
  for (var i = 0; i < deptJson.length; i++) {
    if (deptJson[i]["roomName"] == roomName)
      issues.push(deptJson[i]);
  }
  return issues;
}

function prettifyIssues(deptIssues) {
  var results = [];
  for (var i = 0; i < deptIssues.length; i++) {
    var item = {};
    item["reporterMail"] = deptIssues[i]["reporterMail"];
    item["reportingDate"] = deptIssues[i]["reportingDate"];
    item["description"] = deptIssues[i]["description"];
    item["type"] = deptIssues[i]["type"];
    item["roomName"] = deptIssues[i]["roomName"];
    item["deptName"] = deptNames[deptIssues[i]["deptCode"]];
    item["_id"] = deptIssues[i]["_id"];
    results.push(item);
  }
  return results;
}

function writeJsonToFile(jsonObj, fileName) {
  var wstream = fs.createWriteStream(fileName);
  wstream.write(JSON.stringify(jsonObj));
  wstream.end();
}

function test() {
  // Set department/date as desired
  var department = deptCodes['povo'];
  var date = '11-12-2017';
  getJsonByDepartment(department, date)
    .then((jsonObj) => {

      writeJsonToFile(jsonObj, 'rooms_' + department + '.json');

    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  'deptCodes': deptCodes,
  'deptFilter': deptFilter,
  'prettifyJson': prettifyJson,
  'getJsonByDepartment': getJsonByDepartment,
  'getRoomNamesFromDept': getRoomNamesFromDept,
  'timeSlotIndex': timeSlotIndex,
  'joinPrettyDbJson': joinPrettyDbJson,
  'getAvailablityJson': getAvailablityJson,
  'getRoomFromDept': getRoomFromDept,
  'prettifyRoom': prettifyRoom,
  'joinDbRoomActivityJson': joinDbRoomActivityJson,
  'getRoomIssuesFromDept': getRoomIssuesFromDept,
  'prettifyIssues': prettifyIssues,
  'test': test,
  'writeJsonToFile': writeJsonToFile,
};