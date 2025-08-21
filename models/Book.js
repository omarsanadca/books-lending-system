import { DataTypes } from "sequelize";

import sequelize from "../utils/db.js";

export const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isBorrowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
