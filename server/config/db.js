import { Sequelize } from "sequelize";
import "dotenv/config";
import mysql2 from "mysql2";

const sequelize = new Sequelize(
  process.env.DB_NAME || "ems_database",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.error("TIP: Ensure XAMPP/MySQL is running on port 3306.");
    }
  }
};

export default sequelize;
