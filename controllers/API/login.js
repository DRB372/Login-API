const { validationResult } = require("express-validator");

const User = require("../../models/user");
const bcrypt = require("bcrypt");
exports.getUsers = (req, res, next) => {
  User.findAll()
    .then((users) => {
      res
        .status(200)
        .json({ message: "Fetched Users successfully.", users: users });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);

  console.log(req.body);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const dob = req.body.dob;
  const password = req.body.password;

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
  const user = new User({
    name: name,
    email: email,
    dob: dob,
    password: hash,
  });
  user
    .save()
    .then((result) => {
      res.status(201).json({
        message: "User created successfully!",
        user: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.login = async (req, res, next) => {
  const errors = validationResult(req);

  console.log(req.body);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findAll({ where: { email: email } })
    .then((user) => {
      bcrypt.compare(password, user[0].password).then(function(result) {
        res.status(200).json({
          message: "Login successfully!",
          user: result,
        });
    });
     
    }).catch(err=>{
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.getUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "User fetched.", user: user });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUser = (req, res, next) => {
  const userId = req.params.userId;

  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const dob = req.body.dob;
  const password = req.body.password;

  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      user.name = name;
      user.email = email;
      user.dob = dob;
      user.pasword = password;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "User updated!", user: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findByPk(userId)
    .then((user) => {
      console.log("deleting");
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }

      return User.destroy({
        where: { id: userId },
      });
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "User Deleted ." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
