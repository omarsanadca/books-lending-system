import { DataTypes } from "sequelize";

import sequelize from "../utils/db.js";

export const Author = sequelize.define("Author", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: DataTypes.STRING,
});
