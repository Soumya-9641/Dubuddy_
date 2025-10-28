import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "manager", "viewer"),
    defaultValue: "viewer",
  },
});

// ✅ This ensures table stays updated with model fields
//  User.sync({ alter: true });
