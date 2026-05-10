import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;
    const whereClause = {};

    if (department) {
      whereClause.department = department;
    }
    const employees = await Employee.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowance,
      deductions,
      joinDate,
      password,
      role,
      bio,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (Name, Email, or Password)",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
    });

    const employee = await Employee.create({
      userId: user.id,
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowance) || 0,
      deductions: Number(deductions) || 0,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
      bio: bio || "",
    });

    return res.status(201).json({ success: true, employee });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Email already exists in the system",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create employee",
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      basicSalary,
      allowance,
      deductions,
      password,
      role,
      bio,
      employmentStatus,
    } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    await employee.update({
      firstName,
      lastName,
      email,
      phone,
      position,
      department: department || "Engineering",
      basicSalary: !isNaN(basicSalary)
        ? Number(basicSalary)
        : employee.basicSalary,
      allowances: !isNaN(allowance) ? Number(allowance) : employee.allowances,
      deductions: !isNaN(deductions) ? Number(deductions) : employee.deductions,
      employmentStatus: employmentStatus || "ACTIVE",
      bio: bio || "",
    });

    const userUpdate = { email };
    if (role) userUpdate.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userUpdate.password = await bcrypt.hash(password, salt);
    }

    await User.update(userUpdate, {
      where: { id: employee.userId },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }
    return res
      .status(500)
      .json({ success: false, error: "Failed to update employee" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    if (employee.userId) {
      await User.destroy({ where: { id: employee.userId } });
    }
    await employee.destroy();

    return res.json({
      success: true,
      message: "Employee successfully deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete employee" });
  }
};
