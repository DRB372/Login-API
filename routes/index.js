var express = require("express");
var router = express.Router();
const { body, header } = require("express-validator");
const loginController = require("../controllers/API/login");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/API/users", loginController.getUsers);

router.post(
  "/API/user/new",
  [
    body("name")
      .trim()
      .isLength({ min: 4 })
      .escape()
      .withMessage("Username is required"),
    body("email").trim().isEmail().escape().withMessage("Email must be valid"),
    body("dob")
      .trim()
      .not()
      .isEmpty()
      .escape()
      .withMessage("Date of Birth is required"),
    
  ],
  loginController.createUser
);

router.post(
  "/API/login",
  [
    body("email").trim().isEmail().escape().withMessage("Email must be valid"),
    
  ],
  loginController.login
);

router.get("/API/user/:userId", loginController.getUser);

router.put(
  "/API/user/:userId",
  [
    body("name")
      .trim()
      .isLength({ min: 4 })
      .escape()
      .withMessage("Username is required"),
    body("email").trim().isEmail().escape().withMessage("Email must be valid"),
    body("dob")
      .trim()
      .not()
      .isEmpty()
      .escape()
      .withMessage("Date of Birth is required"),
  
  ],
  loginController.updateUser
);
router.delete("/API/user/:userId", loginController.deleteUser);
module.exports = router;
