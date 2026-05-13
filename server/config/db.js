import { Sequelize } from "sequelize";
import "dotenv/config";
import mysql2 from "mysql2";

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 22470;
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false,
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
    console.log(`Successfully connected to Railway on port ${dbPort}`);
  } catch (error) {
    console.error("Critical Database Connection Error:", {
      message: error.message,
      host: process.env.DB_HOST,
      port: dbPort,
      user: process.env.DB_USER,
    });
    process.exit(1);
  }
};

export default sequelize;
