const express = require("express");
const { User } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

router.get("/profile", isLoggedIn, (req, res) => {
  User.findOne({
    where: { id: req.id },
  }).then((result) => {
    res.json(result);
  });
  // res.render("profile", { title: "내 정보", user: req.user });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "회원가입",
    user: req.user,
    joinError: req.flash("joinError"),
  });
});

router.get("/", (req, res) => {
  res.render("main", {
    title: "MainPage",
    user: req.user,
    loginError: req.flash("loginError"),
  });
});

module.exports = router;
