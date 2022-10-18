const express = require("express");
const { isLoggedIn } = require("./middlewares");
const Chat = require("../models/chat");
const { Op } = require("sequelize");
const router = express.Router();
router.get("/chat", async (req, res, next) => {
  try {
    console.log(req.query.id);
    const rooms = await Chat.findAll({
      where: {
        [Op.or]: [{ sellerId: req.query.id }, { buyerId: req.query.id }],
      },
      order: [["updatedAt", "DESC"]],
    });
    if (rooms) res.send(rooms);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/findchat", async (req, res, next) => {
  try {
    const rooms = await Chat.findOne({
      where: {
        [Op.and]: [
          { productId: Number(req.query.productId) },
          { buyerId: req.query.id },
        ],
      },
    });
    if (rooms) res.send(rooms);
    else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/getlastchat", async (req, res, next) => {
  try {
    const lastChat = await Chat.findOne({
      where: {
        id: Number(req.query.roomId),
      },
    });
    // console.log("please : " , lastChat)
    if (lastChat) res.send(lastChat);
    else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/getproductid", async (req, res, next) => {
  try {
    const productId = await Chat.findOne({
      where: {
        id: Number(req.query.roomId),
      },
    });
    res.send(productId);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getlastcnt", async (req, res, next) => {
  try {
    const lastCnt = await Chat.findAll({
      where: {
        [Op.or]: [
          { sellerId: String(req.query.userId) },
          { buyerId: String(req.query.userId) },
        ],
      },
    });
    if (lastCnt) {
      let cnt = 0;
      console.log("lastcnt", lastCnt.length);
      for (let i = 0; i < lastCnt.length; i++) {
        if (lastCnt[i]["lastSender"] != String(req.query.userId)) {
          cnt += lastCnt[i]["isReadCnt"];
        }
      }
      if (cnt != 0) res.send(true);
      else res.send(false);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/createchat", async (req, res) => {
  Chat.create({
    sellerId: req.query.sellerId,
    buyerId: req.query.buyerId,
    sellerStatus: "before",
    buyerStatus: "before",
    productId: req.query.productId,
  });
  res.status(200).send("방생성완료");
});

router.get("/chat/:productId", async (req, res, next) => {
  try {
    console.log("testtest : ", req.params.productId);
    const chatCount = await Chat.count({
      where: {
        productId: Number(req.params.productId),
      },
    });
    console.log("testtest : ", chatCount);
    res.status(200).send(String(chatCount));
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
