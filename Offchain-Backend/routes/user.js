const express = require("express");

const { isLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  console.log("getUser 호출됨");
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      res.status(200).send(user);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const { sellerId } = req.body;
    const seller = User.findOne({ where: { id: sellerId } });
    const products = seller.getProducts();
    console.log(products);
    if (product) res.send(products);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 지갑 정보 등록
router.post("/account", isLoggedIn, async (req, res, next) => {
  try {
    const { walletAddress, privatekey } = req.body;
    await User.update(
      { walletAddress: walletAddress, privatekey: privatekey },
      { where: { id: req.user.id } }
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (user) {
      res.send(user.nick);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:id", async(req, res, next) => {
  try {
    const {nick}= req.body;
    await User.update(
      { nick: nick },
      { where: { id: req.params.id } }
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
})



module.exports = router;
