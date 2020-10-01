const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const ResetPassword = sequelize.define("resetPassword", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
 
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  expiration: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  used: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
});

module.exports = ResetPassword;
