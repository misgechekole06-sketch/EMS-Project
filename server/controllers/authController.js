import User from "../models/User.js";
import Employee from "../models/Employee.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password, role_type } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    if (role_type === "admin" && user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied: Not an administrator" });
    }
    if (role_type === "employee" && user.role !== "EMPLOYEE") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied: Not an employee" });
    }

    const isValid = await bcryptjs.compare(password, user.password);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ success: true, user: payload, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: "Login failed" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
    });

    return res.status(200).json({
      success: true,
      employee: employee || null,
      role: req.user.role,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch profile" });
  }
};

export const verifyUser = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Both passwords are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, error: "Current password is incorrect" });
    }

    const hashed = await bcryptjs.hash(newPassword, 10);
    await user.update({ password: hashed });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to change password" });
  }
};
