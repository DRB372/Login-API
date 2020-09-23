var express = require("express");
var router = express.Router();
const { body } = require("express-validator");
const indexController = require("../controllers/index");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/posts", indexController.getPosts);

// POST /index/post
router.post(
  "/post",
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
    body("password")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .withMessage("Minimum length is 6 digits"),
  ],
  indexController.createPost
);

router.get("/post/:postId", indexController.getPost);

router.put(
  "/post/:postId",
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
    body("password")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .withMessage("Minimum length is 6 digits"),
  ],
  indexController.updatePost
);
router.delete("/post/:postId", indexController.deletePost);
module.exports = router;
