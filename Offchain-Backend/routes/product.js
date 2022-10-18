const express = require("express");

const { isLoggedIn } = require("./middlewares");
const router = express.Router();
const multer = require("../src/multers");
const Product = require("../models/product");
const ProductImg = require("../models/productImg");
const { zeroPad } = require("ethers/lib/utils");
const { Sequelize } = require("sequelize");
const { Review, User, Comment } = require("../models");

const Op = Sequelize.Op;

router.get("/", async (req, res, next) => {
  const limit = Number(req.query.size);
  const pageNumber = req.query.page;
  const offset = 0 + limit * (pageNumber - 1);
  try {
    const products = await Product.findAll({
      offset: offset,
      limit: limit,
      include: ProductImg,
    });
    const total = await Product.count();
    const lastPage = Math.ceil(total / limit);
    console.log(lastPage);
    return res.status(200).send({
      products: products,
      isLastPage: lastPage <= pageNumber ? true : false,
      pageNumber: pageNumber,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/category/:id", async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const products = await Product.findAll({ where: { category: categoryId } });
    if (products) return res.status(200).send(products);
    return res.status(400).send("조회된 상품이 없습니다.");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/category/:id/relations", async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const productId = req.query.productId;
    const limit = Number(req.query.size);
    const pageNumber = Number(req.query.page);
    const offset = 0 + limit * (pageNumber - 1);
    const total = await Product.count();
    const lastPage = Math.ceil(total / limit);
    const products = await Product.findAll({
      where: {
        category: categoryId,
        [Op.not]: [{ id: productId }],
      },
      offset: offset,
      limit: limit,
    });
    if (products)
      return res.status(200).send({
        products: products,
        isLastPage: lastPage <= pageNumber ? true : false,
      });
    return res.status(400).send("조회된 상품이 없습니다.");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/detail", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.query.id },
      include: [{ model: ProductImg, attributes: ["imgUrl"] }],
    });
    if (product) res.send(product);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/seller", isLoggedIn, async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { sellerId: req.user.id },
      include: { model: ProductImg, limit: 1, attributes: ["imgUrl"] },
    });
    if (products) {
      res.status(200).send(products);
    }
  } catch (error) {
    console.error(error);
  }
});

router.get("/user/:userid", async (req, res, next) => {
  console.log("req.prams.userid", req.params);
  try {
    const products = await Product.findAll({
      where: { sellerId: req.params.userid },
    });
    res.status(200).send(products);
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/",
  multer.upload.single("thumbnail", 1),
  isLoggedIn,
  async (req, res, next) => {
    try {
      const data = req.body.data;
      console.log("data:", data);
      const { productName, content, category, price } = JSON.parse(data);
      const thumbnail = req.file.location;

      const product = await Product.create({
        sellerId: req.user.id,
        productName: productName,
        content: content,
        category: category,
        price: price,
        thumbnail: thumbnail,
      });
      return res.status(201).send({ productId: product.id });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.post(
  "/images/:id",
  isLoggedIn,
  multer.upload.array("productImgs", 10),
  async (req, res) => {
    const images = req.files;
    const productId = req.params.id;
    if (images) {
      const locations = await images.map((img) => img.location);
      locations.map((url) =>
        ProductImg.create({ productId: productId, imgUrl: url })
      );
      return res.status(201).send(locations);
    }
    res.status(400).send("이미지가 없습니다.");
  }
);

router.get(
  "/management",
  isLoggedIn,
  multer.upload.array("productImgs", 10, async (req, res, next) => {
    try {
      const sellerId = req.user.id;
      const limit = Number(req.query.limit);
      const pageNumber = req.query.page;
      const offset = 0 + limit * (pageNumber - 1);

      const products = await Product.findAll({
        where: { sellerId: sellerId },
        attributes: ["productName", "status", "price", "updatedAt"],
        offset: offset,
        limit: limit,
      });

      if (products) res.status(200).send(products);
    } catch (error) {
      console.error(error);
      next(error);
    }
  })
);

router.get("/search", async (req, res, next) => {
  try {
    let searchWord = req.query.searchword;
    console.log("searchWord:", searchWord);
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { productName: { [Op.like]: "%" + searchWord + "%" } },
          { content: { [Op.like]: "%" + searchWord + "%" } },
        ],
      },
    });
    return res.status(200).send(products);
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      attributes: ["id", "sellerId", "thumbnail"],
      where: { id: req.params.id },
    });

    if (product) {
      const seller = await product.getUser();
      if (seller.id) {
        const productImgs = await ProductImg.findAll({
          where: { productId: product.id },
        });
        const filenames = productImgs.map((img) =>
          img.imgUrl.split("/").at(-1)
        );
        // s3에 있는 이미지들 삭제
        filenames.map((file) => multer.delete_file(file));
        // s3에서 thumbnail 삭제

        multer.delete_file(product.thumbnail);
        await ProductImg.destroy({ where: { productId: product.id } });
        await product.destroy();
        res.status(200).send("완료");
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/review/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const completedProducts = await Product.findAll({
      where: { status: "complete", sellerId: userId },
      include: [
        { model: Review, required: false, attributes: ["comment", "rate"] },
        { model: User, required: false, attributes: ["id", "nick"] },
      ],
    });

    const reviews = completedProducts
      .map((review) => {
        if (review.dataValues.Review != null) {
          return {
            productId: review.dataValues.id,
            productName: review.dataValues.productName,
            thumbnail: review.dataValues.thumbnail,
            text: review.dataValues.Review.dataValues.comment,
            rate: review.dataValues.Review.dataValues.rate,
            buyer: {
              id: review.dataValues.User.dataValues.id,
              nick: review.dataValues.User.dataValues.nick,
            },
          };
        }
      })
      .filter((review) => review != undefined);
    res.status(200).send(reviews);
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.post("/review", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = req.body.productId;
    const rate = req.body.rate;
    const text = req.body.text;

    const review = await Review.findOne({ where: { productId: productId } });

    if (review != null) {
      res.status(202).send("이미 후기 작성이 완료되었습니다.");
    } else {
      await Review.create({
        rate: rate,
        comment: text,
        productId: productId,
        buyerId: userId,
      });
      res.status(200).send("완료되었습니다.");
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

router.post("/comment", isLoggedIn, async (req, res, next) => {
  try {
    const { comment, productId, buyerId, responseTo } = req.body;
    await Comment.create({
      comment: comment,
      productId: productId,
      buyerId: buyerId,
      responseTo: responseTo,
    }).then((result) => res.status(200).send(String(result.id)));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/comment/:productId", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: {
        [Op.or]: [{ productId: req.params.productId }],
      },
    });
    if (comments) res.send(comments);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
