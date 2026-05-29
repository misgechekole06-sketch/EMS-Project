import "dotenv/config";
import sequelize, { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDB();
  // --- Admin ---
  const adminEmail = "admin@example.com";
  const adminPass = "Admin@123";

  let adminUser = await User.findOne({ where: { email: adminEmail } });
  if (adminUser) {
    console.log("Admin already exists, skipping.");
  } else {
    const hashed = await bcrypt.hash(adminPass, 10);
    adminUser = await User.create({
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
    });
    console.log("Admin created:");
    console.log("  Email   :", adminEmail);
    console.log("  Password:", adminPass);
  }

  // --- Employee ---
  const empEmail = "employee@example.com";
  const empPass = "Employee@123";

  let empUser = await User.findOne({ where: { email: empEmail } });
  if (empUser) {
    console.log("Employee user already exists, skipping.");
  } else {
    const hashed = await bcrypt.hash(empPass, 10);
    empUser = await User.create({
      email: empEmail,
      password: hashed,
      role: "EMPLOYEE",
    });

    await Employee.create({
      userId: empUser.id,
      firstName: "John",
      lastName: "Doe",
      email: empEmail,
      phone: "0911000000",
      position: "Software Engineer",
      department: "Engineering",
      basicSalary: 50000,
      allowances: 5000,
      deductions: 2000,
      joinDate: new Date(),
      employmentStatus: "ACTIVE",
    });

    console.log("Employee created:");
    console.log("  Email   :", empEmail);
    console.log("  Password:", empPass);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
