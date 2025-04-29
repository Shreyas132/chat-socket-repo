const express = require("express");
const path = require("path");
const maxrateLimit = require("../utils/rateLimit");
const { validateRegister, validate } = require("../validate");
const {
  handleRegister,
  getRegister,
  getLogin,
  handleLogin,
  handleLogout,
} = require("../controllers/user");
const { max } = require("moment");
const { header } = require("express-validator");
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/userlogin");
});
router.get("/register", getRegister);
router.post("/register", validateRegister, handleRegister);
router.get("/userlogin", getLogin);
router.post("/userlogin", maxrateLimit, validate, handleLogin);
router.post("/logout", handleLogout);
router.get("/joinroom", checkAuth, (req, res) => {
  res.render("index");
});

router.get("/chatwindow", checkAuth, (req, res) => {
  res.render("chat");
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/userlogin");
  }
}

module.exports = router;
