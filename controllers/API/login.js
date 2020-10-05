const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../../models/user");
const ResetPasword = require("../../models/resetPassword");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const Op = Sequelize.Op;
const hbs = require("nodemailer-express-handlebars");
const log = console.log;

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
  const emailCheck = await User.findAll({ where: { email: email } });
  console.log(emailCheck.length);
  if (emailCheck.length === 1) {
    return res.status(200).json({
      message: "User Already Exists!",
    });
  } else {
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
  }
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

  const emailCheck = await User.findAll({ where: { email: email } });
  console.log(emailCheck.length);
  if (emailCheck.length === 0) {
    return res.status(200).json({
      message: "User Doesn't Exists!",
    });
  } else {
    const comparepassword = await bcrypt.compare(
      password,
      emailCheck[0].password
    );
    if (comparepassword) {
     const token= jwt.sign(
        { email: emailCheck[0].email, userId: emailCheck[0].id },
        process.env.JWT_KEY,{
      expiresIn:"1h"
        },
      );
      return res.status(200).json({
        message: "Login successfully!",
        token:token
      });
    } else {
      res.status(200).json({
        message: "Invalid Email or Password",
      });
    }
  }
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
exports.resetLink = async (req, res, next) => {
  const email = req.body.email;

  const emailCheck = await User.findAll({ where: { email: email } });
  console.log(emailCheck.length);
  if (emailCheck.length === 0) {
    return res.status(200).json({
      message: "User Doesn't Exists!",
    });
  } else if (emailCheck.length === 1) {
    await ResetPasword.update(
      {
        used: 1,
      },
      {
        where: {
          email: req.body.email,
        },
      }
    );

    var token = crypto.randomBytes(64).toString("base64");
     var expireDate = new Date();
            expireDate.setHours( expireDate.getHours() + 1 );
    const resetPassword = new ResetPasword({
      email: email,
      expiration: expireDate,
      token: token,
      used: 0,
    });
    console.log(resetPassword);

    await resetPassword.save();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "intern2@shayansolutions.com",
        pass: "j=T3hm5a",
      },
    });
    const handlebarOptions = {
      viewEngine: {
        extName: ".ejs",
        partialsDir: "some/path",
        layoutsDir: "./views/",
        defaultLayout: "template.ejs",
      },
      viewPath: "./views/",
      extName: ".ejs",
    };

    transporter.use("compile", hbs(handlebarOptions));

    let mailOptions = {
      from: "intern2@shayansolutions.com",
      to: emailCheck[0].email,
      subject: "Reset Email",
      template: "template",
      context: {
        link:
          "http://localhost:3000/API/user/resetPassword?token=" +
          encodeURIComponent(token) +
          "&email=" +
          req.body.email,
        name: emailCheck[0].name,
        email: emailCheck[0].email,
      },
    };
    transporter.sendMail(mailOptions, (err, res, data) => {
      if (err) {
        return log(err);
      } else {
        return log("Email sent!!!");
      }
    });
    return res.status(200).json({
      message: "Email Sent Successfully",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  await ResetPasword.destroy({
    where: {
      expiration: { [Op.lt]: Sequelize.fn("CURDATE") },
    },
  });
  var record = await ResetPasword.findOne({
    where: {
      email: req.query.email,
      expiration: { [Op.gt]: Sequelize.fn("CURDATE") },
      token: req.query.token,
      used: 0,
    },
  });
  if (record) {
    return res.json({
      status: "success",

      message: "Token Found.",
      showForm: true,
      record: record,
    });
  } else {
    return res.json({
      status: "error",
      message: "Token not found. Please try the reset password process again.",
      showForm: false,
    });
  }
};
exports.newPassword = async (req, res, next) => {
  console.log(req.body);
  var record = await ResetPasword.findOne({
    where: {
      email: req.body.email,
      expiration: { [Op.gt]: Sequelize.fn("CURDATE") },
      token: req.body.token,
      used: 0,
    },
  });
  console.log(record);
  if (record == null) {
    return res.json({
      status: "error",
      message: "Token not found. Please try the reset password process again.",
    });
  }
  await ResetPasword.update(
    {
      used: 1,
    },
    {
      where: {
        email: req.body.email,
      },
    }
  );
  const password = req.body.password;
  const hash = await bcrypt.hash(password, 10);
  await User.update(
    {
      password: hash,
    },
    {
      where: {
        email: req.body.email,
      },
    }
  );
  return res.json({
    status: "ok",
    message: "Password reset. Please login with your new password.",
  });
};
