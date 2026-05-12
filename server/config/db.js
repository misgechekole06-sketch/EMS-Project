import { Sequelize } from "sequelize";
import "dotenv/config";
import mysql2 from "mysql2";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 16890,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
      },
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
    console.log("Cloud Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("SSL")) {
      console.error(
        "TIP: Ensure DB_SSL_CA is correctly set in your environment variables.",
      );
    }
  }
};

export default sequelize;
