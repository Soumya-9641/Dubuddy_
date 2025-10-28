import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "dubuddy",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "root",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql", // change to 'mysql' or 'sqlite' if needed
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ DB Connection failed:", error);
  }
};
