const express = require("express");
const axios = require("axios");

const { isLoggedIn } = require("./middlewares");
const router = express.Router();
const TransactionRequest = require("../models/transaction_request");
const Transaction = require("../models/transaction");
const Product = require("../models/product");
const User = require("../models/user");
const Deployer = require("../src/deployContract"); // contract 배포
const connectContract = require("../src/connectContract");
const ProductImg = require("../models/productImg");
const { response } = require("express");
const { Sequelize } = require("sequelize");
const { increment, sequelize } = require("../models/mystore");
const Mystore = require("../models/mystore");
const Op = Sequelize.Op;

const TRACKING_API_KEY = "7ej8scmCTzyMI7EtfE9g4A";

router.get("/request/sent", isLoggedIn, async (req, res, next) => {
  const buyerId = req.user.id;
  try {
    const sentRequests = await TransactionRequest.findAll({
      where: { buyerId: buyerId },
      attributes: ["productId"],
      include: { model: Product, attributes: ["productName"] },
    });
    return res.status(200).send(sentRequests);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/request/recieved", isLoggedIn, async (req, res, next) => {
  const sellerId = req.user.id;
  try {
    const productsWithRequests = await Product.findAll({
      where: { sellerId: sellerId },
      attributes: ["id"],
      include: TransactionRequest,
    });
    return res.status(200).send(productsWithRequests);
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/request/recieved/product", isLoggedIn, async (req, res, next) => {
  const productId = Number(req.query.productId);
  console.log(productId);
  try {
    const recievedRequests = await TransactionRequest.findAll({
      where: { productId: productId },
      include: { model: User, attributes: ["id", "nick"] },
    });

    return res.status(200).send(recievedRequests);
  } catch (error) {
    return next(error);
  }
});

router.post("/request", isLoggedIn, async (req, res, next) => {
  const buyerId = req.user.id;
  const { productId } = req.body;
  try {
    const existRequest = await TransactionRequest.findOne({
      where: {
        productId: productId,
        buyerId: buyerId,
      },
    });
    console.log("existRequest: ", existRequest);
    if (existRequest) {
      return res.status(400).send("이미 구매 요청을 한 상품입니다.");
    }

    await TransactionRequest.create({
      productId: productId,
      buyerId: buyerId,
    });
    Product.update({ status: "requested" }, { where: { id: productId } });
    return res.status(200).send("구매요청 완료");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/permission", isLoggedIn, async (req, res, next) => {
  const { productId, buyerId } = req.body;
  try {
    const buyer = await User.findOne({ where: { id: buyerId } });
    const product = await Product.findOne({ where: { id: productId } });
    const seller = await product.getUser();
    // 구매 요청을 수락한 계정의 id가 상품 판매자의 id와 같다면
    if (seller.id != req.user.id) {
      return res.status(401).send("해당 상품의 판매자가 아닙니다.");
    }
    const contract_address = await Deployer.deployContract(
      seller.privatekey, // seller
      buyer.walletAddress, //buyer
      productId,
      product.price
    );

    if (contract_address === false) {
      return res.status(400).send("보증금 등록을 위한 계좌 잔액이 부족합니다.");
    }

    Transaction.create({
      buyerId: buyerId,
      contractAddress: contract_address,
      productId: productId,
    });
    Product.update({ status: "permitted" }, { where: { id: productId } });
    return res.status(200).send("구매요청 수락 완료");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.delete("/request/:id", isLoggedIn, async (req, res, next) => {
  const requestId = req.params.id;
  try {
    await TransactionRequest.destroy({ where: { id: requestId } });
    res.status(200).send("제거완료");
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.get("/permission", isLoggedIn, async (req, res, next) => {
  const sellerId = req.user.id;
  const seller = await User.findOne({ where: { id: sellerId } });
  const permittedProducts = await seller.getProducts({
    where: { status: { [Op.or]: ["permitted", "complete"] } },
    include: { model: Transaction, attributes: ["buyerId", "contractAddress"] },
  });

  const buyers = await Promise.all(
    permittedProducts.map(async (product) => {
      const buyer = await User.findOne({
        where: { id: product.Transaction.buyerId },
        attributes: ["email", "nick", "kakaoId"],
      });
      const txState = await connectContract.getCurrentState(
        product.Transaction.contractAddress
      );
      return { ...product.dataValues, buyer: buyer, txState: txState };
    })
  );
  res.status(200).send(buyers);
});

router.get("/purchase/permission", isLoggedIn, async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findOne({ where: { id: userId } });
  const purchaseTxs = await Transaction.findAll({ where: { buyerId: userId } });

  const result = await Promise.all(
    purchaseTxs.map(async (tx) => {
      const product = await Product.findOne({
        where: { id: tx.productId },
      });
      const txState = await connectContract.getCurrentState(tx.contractAddress);
      const seller = await User.findOne({
        where: { id: product.sellerId },
        attributes: ["email", "nick", "id"],
      });
      return {
        ...tx.dataValues,
        seller: seller,
        txState: txState,
        product: product,
      };
    })
  );
  res.status(200).send(result);
});

router.delete("/cancel/:id", isLoggedIn, async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const user = await User.findOne({ where: { id: userId } });
  const permittedTx = await Transaction.findOne({
    where: { productId: productId },
  });
  console.log("permittedTxId:", permittedTx.id);
  try {
    const response = await connectContract.cancel(
      permittedTx.contractAddress,
      user.privatekey
    );
    await Product.update(
      { status: "before" },
      { where: { id: permittedTx.productId } }
    );
    await Transaction.destroy({ where: { id: permittedTx.id } });
    await TransactionRequest.destroy({
      where: { productId: productId, buyerId: permittedTx.buyerId },
    });
    return res.status(200).send("성공");
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.post("/makepayment", isLoggedIn, async (req, res, next) => {
  const txId = req.body.txId;
  const user = await User.findOne({ where: { id: req.user.id } });
  const tx = await Transaction.findOne({ where: { id: txId } });
  try {
    const response = await connectContract.makePayment(
      tx.contractAddress,
      user.privatekey
    );
    console.log(response);
    return res.status(200).send("입금 완료");
  } catch (error) {
    console.log(error);
    return error.resonse;
  }
});

router.post("/trackingnumber", isLoggedIn, async (req, res, next) => {
  const trackingNumber = req.body.trackingNumber;
  const trackingCode = req.body.trackingCode;
  const productId = req.body.productId;
  const user = await User.findOne({ where: { id: req.user.id } });
  const tx = await Transaction.findOne({ where: { productId: productId } });

  console.log("trackingNumber:", trackingNumber);
  console.log("trackingCode: ", trackingCode);

  try {
    const response = await connectContract.setTrackingNumber(
      tx.contractAddress,
      user.privatekey,
      parseInt(trackingNumber)
    );
    await connectContract.setTrackingCode(
      tx.contractAddress,
      user.privatekey,
      String(trackingCode)
    );
    return res.status(200).send("등록완료");
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.post("/complete", isLoggedIn, async (req, res, next) => {
  const productId = req.body.productId;
  const sellerId = req.body.sellerId;
  const user = await User.findOne({ where: { id: req.user.id } });
  const tx = await Transaction.findOne({ where: { productId: productId } });

  try {
    const response = await connectContract.completeTrade(
      tx.contractAddress,
      user.privatekey
    );
    await Product.update({ status: "complete" }, { where: { id: productId } });
    await Mystore.update(
      { sellCount: sequelize.literal("sellCount + 1") },
      { where: { id: Number(sellerId) } }
    );
    return res.status(200).send("확정완료");
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.put("/return", isLoggedIn, async (req, res, next) => {
  const productId = req.body.productId;
  const trackingNumber = req.body.trackingNumber;
  const trackingCode = req.body.trackingCode;
  const user = await User.findOne({ where: { id: req.user.id } });
  const tx = await Transaction.findOne({ where: { productId: productId } });

  try {
    const response = await connectContract.returnProduct(
      tx.contractAddress,
      user.privatekey,
      trackingNumber,
      trackingCode
    );
    return res.status(200).send("환불완료");
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.get("/trackinginfo/:id", isLoggedIn, async (req, res, next) => {
  const productId = req.params.id;
  const user = await User.findOne({ where: { id: req.user.id } });
  const tx = await Transaction.findOne({ where: { productId: productId } });

  try {
    const trackingNumber = await connectContract.getTrackingNumber(
      tx.contractAddress
    );
    const trackingCode = await connectContract.getTrackingCode(
      tx.contractAddress
    );

    console.log("trackingNumber:", trackingNumber);
    console.log("trackingCode: ", trackingCode);

    const trackingResponse = await axios.get(
      `http://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${TRACKING_API_KEY}&t_code=${trackingCode}&t_invoice=${trackingNumber}`
    );

    if (trackingResponse.data.status == false) {
      return res.status(202).send(trackingResponse.data.msg);
    }

    const trackingInfo = {
      complete: trackingResponse.data.complete,
      trackingNumber: trackingNumber,
      trackingCode: trackingCode,
      trackingDetails: trackingResponse.data.trackingDetails,
    };

    return res.status(200).send(trackingInfo);
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

module.exports = router;
