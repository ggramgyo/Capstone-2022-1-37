const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
          defaultValue: "default",
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "local",
        },
        kakaoId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        walletAddress: {
          type: Sequelize.STRING,
        },
        privatekey: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
        hooks: {
          afterCreate: (user, options) => {
            console.log("afterCreate 호출!");
            console.log("user.id:", user.id);
            return user.update({nick: `상점${user.id}호`});
          }
        }
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Product, {
      foreignKey: "sellerId",
      sourceKey: "id",
    });

    db.User.hasMany(db.Review, {
      foreignKey: "buyerId",
      sourceKey: "id",
    });
  }
};
