import Employee from "../models/Employee.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const employee = await Employee.findOne({
      where: { userId: user.id },
    });

    if (!employee) {
      return res.json({
        success: true,
        employee: {
          firstName: "Administrator",
          lastName: "",
          email: user.email,
        },
      });
    }

    return res.json({
      success: true,
      employee: employee,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    const employee = await Employee.findOne({
      where: { userId: user.id }, // FIX: user.id
    });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    if (employee.isDeleted) {
      return res.status(403).json({
        success: false,
        error: "Your account is deactivated. You cannot update your profile.",
      });
    }

    await employee.update({
      bio: req.body.bio,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update profile" });
  }
};
