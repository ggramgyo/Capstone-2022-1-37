const Sequelize = require("sequelize");

module.exports = class ProductImg extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        imgUrl: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "ProductImg",
        tableName: "prodcutImgs",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.ProductImg.belongsTo(db.Product, {
      foreignKey: "productId",
      targetKey: "id",
    });
  }
};
