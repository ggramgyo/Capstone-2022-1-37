const Sequelize = require("sequelize");

module.exports = class Chatcontent extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      { 
        uu: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
        id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
        sender: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        message: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        time: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        isRead: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Chatcontent",
        tableName: "chatcontents",
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
