import { Sequelize } from "sequelize";
import "dotenv/config";
import mysql2 from "mysql2";

const sequelize = new Sequelize(
  process.env.DB_NAME || "ems_database",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
    },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export default sequelize;
