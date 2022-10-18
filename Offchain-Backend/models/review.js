const Sequelize = require("sequelize");

module.exports = class Review extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                comment: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                rate: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "Review",
                tableName: "reviews",
                paranoid: false,
                charset: "utf8mb4",
                collate: "utf8mb4_general_ci",
            }
        );
    }

    static associate(db) {
        db.Review.belongsTo(db.Product, {
            foreignKey: "productId",
            targetKey: "id",
        });
        db.Review.belongsTo(db.User, {
            foreignKey: "buyerId",
            targetKey: "id",
        });
      }
}