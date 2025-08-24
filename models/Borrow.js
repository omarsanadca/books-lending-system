import { DataTypes } from "sequelize";

import sequelize from "../utils/db.js";

export const Borrow = sequelize.define("Borrow", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  useName: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});
