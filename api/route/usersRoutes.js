const User = require("../models/User.js");

exports.getUser = function (req, res, next) {
  User.findOne({
      email: req.params.email
    })
    .then((result) => {
      if (result) {
        var foundUser = {};
        foundUser.email = result["email"];
        foundUser.su = result["su"];
        foundUser.lastDept = result["lastDept"];
        res.json(foundUser);
      } else {
        var error = new Error("User not found");
        next(error);
      }
    })
    .catch((error) => {
      console.error("error retriving document: " + error);
      next(error);
    });
}

exports.insertUser = function (req, res, next) {
  User.findOne({
      email: req.body.email
    })
    .then((result) => {
      if (!result) {
        var user = new User();
        user.email = req.body.email;
        user.loginId = req.body.loginId;
        user.su = false;
        user.lastDept = req.body.lastDept;
        return user.save()
          .then(() => {
            res.sendStatus(200);
          });
      } else {
        var error = new Error("Already inserted user");
        next(error);
      }
    })
    .catch((error) => {
      console.error("error retriving/saving document: " + error);
      next(error);
    });
}

exports.updateUser = function (req, res, next) {
  User.findOne({
      email: req.params.email
    })
    .then((result) => {
      if (result) {
        result.lastDept = req.body.lastDept;
        return result.save()
          .then(() => {
            res.sendStatus(200);
          });
      } else {
        var error = new Error("User not found");
        next(error);
      }
    })
    .catch((error) => {
      console.error("error retriving/updating document: " + error);
      next(error);
    });
}