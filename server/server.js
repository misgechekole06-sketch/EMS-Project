import express from "express";
import cors from "cors";
import "dotenv/config";
import sequelize, { connectDB } from "./config/db.js";
import { serve } from "inngest/express";

import { inngest, functions } from "./inngest/index.js";
import payslipRouter from "./routes/payslipsRoutes.js";
import authRouter from "./routes/authRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://ems-project-client.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get(["/favicon.ico", "/favicon.png"], (req, res) => res.status(204).end());
app.get("/", (req, res) =>
  res.send("EMS Server is operational and connected to Railway."),
);

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslips", payslipRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));

const startServer = async () => {
  try {
    await connectDB();
    // await sequelize.sync();
    console.log("Database models synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Critical Failure: Server could not start:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
