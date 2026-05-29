import "dotenv/config";
import sequelize, { connectDB } from "./config/db.js";

// Import all models so Sequelize registers them before sync
import "./models/User.js";
import "./models/Employee.js";
import "./models/Attendance.js";
import "./models/LeaveApplication.js";
import "./models/Payslip.js";

async function migrate() {
    await connectDB();
    console.log("Running sync({ force: false, alter: true }) ...");
    await sequelize.sync({ alter: true });
    console.log("All tables migrated successfully.");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
});
