const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/s3.json");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const s3 = new aws.S3();
module.exports.upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.bucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, callback) {
      const productId = req.params.id;
      callback(
        null,
        `productImgs/${productId}_${file.originalname}_${Date.now()}`
      );
    },
  }),
});

module.exports.delete_file = (file) => {
  try {
    s3.deleteObject(
      {
        Bucket: config.bucket,
        Key: `productImgs/${file}`,
      },
      function (error, data) {
        if (error) {
          console.log("err: ", error, error.stack);
        } else {
          console.log(data, " 정상 삭제 되었습니다.");
        }
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};
