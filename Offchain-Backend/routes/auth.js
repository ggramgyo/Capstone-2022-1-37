const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");
const Mystore = require("../models/mystore");

const router = express.Router();

router.post("/duplicateNick", isNotLoggedIn, async (req, res, next) => {
  const { nick } = req.body;
  try {
    const exUser = await User.findOne({ where: { nick: nick } });
    if (exUser) {
      return res.status(409).send("이미 존재하는 닉네임입니다.");
    }
    return res.status(200).send("사용할 수 있는 닉네임입니다.");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/duplicateEmail", isNotLoggedIn, async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  try {
    const exUser = await User.findOne({ where: { email: email } });
    if (exUser) {
      return res.status(409).send("이미 존재하는 메일입니다.");
    }
    return res.status(200).send("사용할 수 있는 메일입니다.");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, password, walletAddress, privatekey } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.send("이미 가입한 회원입니다.");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      //nick,
      password: hash,
      walletAddress,
      privatekey,
    });

    await Mystore.create({
      sellcount : 0,
      introduce: "소개글이 없습니다.",
      button: 0,
    })

    return res.status(201).send("회원 가입 성공");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(400).send("가입 되지 않은 이메일 입니다.");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).send(user);
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.send("로그아웃 완료");
  });
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "http://localhost:3000",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

module.exports = router;
