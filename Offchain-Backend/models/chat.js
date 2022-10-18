const Sequelize = require("sequelize");

module.exports = class Chat extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        sellerId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        buyerId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sellerStatus: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        buyerStatus: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        lastMsg: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        lastSender: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        lastTime: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        isReadCnt: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Chat",
        tableName: "chats",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {

    // db.Chat.hasMany(db.Chatcontent, {
    //   foreignkey: "roomId",
    //   sourceKey: "id",
    // });
    // db.Chat.hasMany(db.Product, {
    //   foreignkey: "id",
    //   sourceKey: "productId",
    // });
  }
};
