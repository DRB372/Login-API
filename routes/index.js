var express = require("express");
var router = express.Router();
const { body, header } = require("express-validator");
const loginController = require("../controllers/API/login");
const checkAuth= require("../middleware/checkAuth")
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/API/users", loginController.getUsers);

router.post(
  "/API/user/new",checkAuth,
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
  [body("email").trim().isEmail().escape().withMessage("Email must be valid")],
  loginController.login
);

router.get("/API/users/:userId", loginController.getUser);

router.put(
  "/API/user/:userId",
  [
    body("name")
      .trim()
      .isLength({ min: 4 })
      .escape()
      .withMessage("Username is required"),
    body("email").trim().isEmail().escape().withMessage("Email must be valid"),
    body("dob").trim().not().isEmpty().escape().withMessage("DOB is required"),
  ],
  loginController.updateUser
);
router.delete("/API/users/:userId", loginController.deleteUser);

router.post(
  "/API/user/resetLink",
  [body("email").trim().isEmail().escape().withMessage("Email must be valid")],
  loginController.resetLink
);

router.get("/API/user/resetPassword", loginController.resetPassword);

router.post("/API/user/newPassword", loginController.newPassword);

module.exports = router;
