import { Sequelize } from "sequelize";

const sequelize = new Sequelize("node_js", "sanad", "password", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;
