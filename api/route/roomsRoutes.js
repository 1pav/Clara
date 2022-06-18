const timezone = require("moment-timezone"),
  moment = require("moment"),
  mongoose = require("mongoose"),
  utils = require("../utils/jsonUtil.js"),
  Department = require("../models/Department.js"),
  DeptList = {
    "cla": "Centro Linguistico d'Ateneo",
    "povo": "Povo",
    "economia": "Dipartimento di Economia e Management",
    "lettere": "Dipartimento di Lettere e Filosofia",
    "psicologia": "Dipartimento di Psicologia e Scienze Cognitive",
    "sociologia": "Dipartimento di Sociologia e Ricerca Sociale",
    "mesiano": "Dipartimento Ingegneria Civile Ambientale Meccanica",
    "giurisprudenza": "Facoltà di Giurisprudenza"
  };


exports.getDepartmentsList = function (req, res) {

  res.json(DeptList);

}

exports.getRoomList = function (req, res, next) {

  Department.findOne({
      deptCode: utils.deptCodes[req.params.deptName]
    })

    .then((result) => {

      var resJson = utils.getRoomNamesFromDept(result["rooms"]);
      res.json(resJson);

    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}

function getAvailableRoomsNow(req, res, next) {

  Department.findOne({
      deptCode: utils.deptCodes[req.params.deptName]
    })

    .then((result) => {

      var hours = timezone().tz("Europe/Rome").format("HH");
      var minutes = timezone().tz("Europe/Rome").format("mm");
      res.json(utils.getAvailablityJson(result, utils.timeSlotIndex(hours, minutes)));

    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}

function getAvailableRoomsByTime(req, res, next) {

  Department.findOne({
      deptCode: utils.deptCodes[req.params.deptName]
    })

    .then((result) => {

      var time = moment(req.query.time, "HH:mm");
      var hours = time.hour();
      var minutes = time.minute();

      res.json(utils.getAvailablityJson(result, utils.timeSlotIndex(hours, minutes)));

    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}

function getAvailableRoomsByDateAndTime(req, res, next) {

  var department = utils.deptCodes[req.params.deptName];
  var time = moment(req.query.time, "HH:mm");
  var hours = time.hour();
  var minutes = time.minute();
  var date = moment(req.query.date, "DD-MM-YYYY").format("DD-MM-YYYY");
  Promise.all([Department.findOne({
      deptCode: department
    }), utils.getJsonByDepartment(department, date)])
    .then((values) => {
      var dbJson = values[0];
      var prettyJson = utils.prettifyJson(values[1]);
      var newJson = utils.joinPrettyDbJson(dbJson, prettyJson);
      res.json(utils.getAvailablityJson(newJson, utils.timeSlotIndex(hours, minutes)));
    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}


exports.getAvailableRooms = function (req, res, next) {
  var date = req.query.date;
  var time = req.query.time;

  if (!time && !date) {
    getAvailableRoomsNow(req, res, next);
  } else {
    var validDate = moment(req.query.date, "DD-MM-YYYY").isValid();
    var validTime = moment(req.query.time, "HH:mm").isValid();
    if (time && validTime) {
      if (!date) {
        getAvailableRoomsByTime(req, res, next);
      } else if (date && validDate) {
        if (moment(req.query.date, "DD-MM-YYYY").format("DD-MM-YYYY") == timezone.tz("Europe/Rome").format("DD-MM-YYYY")) {
          getAvailableRoomsByTime(req, res, next);
        } else {
          getAvailableRoomsByDateAndTime(req, res, next);
        }
      } else {
        var error = new Error("Date not valid");
        next(error);
      }
    } else {
      var error = new Error("Time not set or invalid");
      next(error);
    }
  }
}

function getRoomInfoNow(req, res, next) {
  Department.findOne({
      deptCode: utils.deptCodes[req.params.deptName]
    })
    .then((result) => {
      var room = utils.getRoomFromDept(result, req.params.roomName)
      var hours = timezone.tz("Europe/Rome").format("HH");
      var minutes = timezone.tz("Europe/Rome").format("mm");
      var prettyRoom = utils.prettifyRoom(room, utils.timeSlotIndex(hours, minutes));
      res.json(prettyRoom);
    })
    .catch((error) => {
      console.error("error finding document: " + error);
      next(error);
    });
}

function getRoomInfoByDate(req, res, next) {

  var department = utils.deptCodes[req.params.deptName];
  var date = moment(req.query.date, "DD-MM-YYYY").format("DD-MM-YYYY");

  Promise.all([Department.findOne({
        deptCode: utils.deptCodes[req.params.deptName]
      }),
      utils.getJsonByDepartment(department, date)
    ])
    .then((values) => {
      var dbDept = values[0];
      var room = utils.getRoomFromDept(dbDept, req.params.roomName);
      var prettyJson = utils.prettifyJson(values[1]);
      var roomJson = utils.joinDbRoomActivityJson(room, prettyJson[room["roomName"]]);
      res.json(utils.prettifyRoom(roomJson, 0));
    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}

exports.getRoomInfo = function (req, res, next) {
  var date = req.query.date;
  if (date) {
    if (moment(req.query.date, "DD-MM-YYYY").isValid()) {
      if (moment(req.query.date, "DD-MM-YYYY").format("DD-MM-YYYY") == timezone.tz("Europe/Rome").format("DD-MM-YYYY")) {
        getRoomInfoNow(req, res, next);
      } else {
        getRoomInfoByDate(req, res, next);
      }
    } else {
      var error = new Error("Date not valid");
      next(error);
    }
  } else {
    getRoomInfoNow(req, res, next);
  }
}