const Issue = require("../models/Issue.js"),
  mongoose = require("mongoose"),
  User = require("../models/User.js"),
  utils = require("../utils/jsonUtil.js"),
  timezone = require("moment-timezone");

function getAllIssues(req, res, next) {
  Issue.find({})
    .then((result) => {
      var resJson = utils.prettifyIssues(result);
      res.json(resJson);
    })
    .catch((error) => {
      console.log("error retrieving all Issues " + error);
      next(error);
    });
}

function getDeptIssues(req, res, next) {
  Issue.find({
      deptCode: utils.deptCodes[req.query.deptName]
    })
    .then((result) => {
      var resJson = utils.prettifyIssues(result);
      res.json(resJson);
    })
    .catch((error) => {
      console.log("error retrieving dept Issues " + error);
      next(error);
    });
}

function getRoomIssues(req, res, next) {
  Issue.find({
      deptCode: utils.deptCodes[req.query.deptName]
    })
    .then((result) => {
      var roomIssues = utils.getRoomIssuesFromDept(result, req.query.roomName);
      var resJson = utils.prettifyIssues(roomIssues);
      res.json(resJson);
    })
    .catch((error) => {
      console.log("error retrieving room Issues " + error);
      next(error);
    });
}

exports.getIssues = function (req, res, next) {
  var dept = req.query.deptName;
  var room = req.query.roomName;

  if (!dept && !room) {
    getAllIssues(req, res, next);
  } else {
    if (dept) {
      if (room) {
        getRoomIssues(req, res, next);
      } else {
        getDeptIssues(req, res, next);
      }
    } else {
      var error = new Error("issues request invalid");
      next(error);
    }
  }
}

exports.deleteIssue = function (req, res, next) {
  User.findOne({
      loginId: req.body.loginId
    })
    .then((user) => {
      if (user && user["su"] && user["su"] == true) {
        Issue.findOneAndRemove({
            _id: req.body.issueId
          })
          .then((result) => {
            res.sendStatus(200);
          })
          .catch((error) => {
            console.log("error removing Issue " + error);
            next(error);
          });
      } else {
        var error = new Error("error inexistent/unauthorized user");
        console.log("error inexistent/unauthorized user");
        next(error);
      }
    })
    .catch((error) => {
      console.error("error retrieving user: " + error);
      next(error);
    });
}

exports.insertIssue = function (req, res, next) {
  User.findOne({
      loginId: req.body.loginId
    })
    .then((result) => {
      if (result) {
        var issue = new Issue();
        issue.deptCode = utils.deptCodes[req.body.deptName];
        issue.roomName = req.body.roomName;
        issue.type = req.body.type;
        issue.description = req.body.description;
        issue.reportingDate = timezone().tz("Europe/Rome").format("DD-MM-YYYY");
        issue.reporter = result["_id"];
        issue.reporterMail = result["email"];
        return issue.save()
          .then(() => {
            res.sendStatus(200);
          });
      } else {
        var error = new Error("invalid user");
        next(error);
      }
    })
    .catch((error) => {
      console.error("error retrieving/saving document: " + error);
      next(error);
    });

}