import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import sequelize, { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Payslip from "./models/Payslip.js";
import LeaveApplication from "./models/LeaveApplication.js";

import payslipRouter from "./routes/payslipsRoutes.js";
import authRouter from "./routes/authRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(multer().none());

app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/payslips", payslipRouter);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log("Database & Tables synced successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
