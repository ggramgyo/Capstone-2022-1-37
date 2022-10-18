const Sequelize = require('sequelize')

module.exports = class Mystore extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                sellCount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                introduce: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                button: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                }
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: "Mystore",
                tableName: "mystore",
                paranoid: false,
                charset: "utf8mb4",
                collate: "utf8mb4_general_ci",
            }
        );
    }
    static associate(db){
    }


}