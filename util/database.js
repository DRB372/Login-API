const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  dialect: "mysql",
  host: process.env.DB_HOST,
  dialectOptions:{
useUTC:false,
  },timezone:'+5:00'
});

module.exports = sequelize;
// database name: nodeapi
// localhost: root
// password: null
