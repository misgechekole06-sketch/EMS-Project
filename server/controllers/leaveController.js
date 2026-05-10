import LeaveApplication from "../models/LeaveApplication.js";
import Employee from "../models/Employee.js";
import { inngest } from "../inngest/index.js";

export const applyLeave = async (req, res) => {
  try {
    const user = req.user;

    const employee = await Employee.findOne({
      where: { userId: user.id },
    });

    if (!employee)
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });

    if (employee.isDeleted) {
      return res.status(403).json({
        success: false,
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) < today) {
      return res
        .status(400)
        .json({ success: false, error: "Start date cannot be in the past" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: "End date cannot be before start date",
      });
    }

    const leave = await LeaveApplication.create({
      employeeId: employee.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "PENDING",
    });

    try {
      await inngest.send({
        name: "leave/pending",
        data: { leaveApplicationId: leave.id },
      });
    } catch (inngestErr) {
      console.error("Inngest queuing failed:", inngestErr);
    }

    return res.json({ success: true, data: leave });
  } catch (error) {
    console.error("Apply Leave Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "ADMIN";

    if (isAdmin) {
      const status = req.query.status;
      const whereClause = status ? { status } : {};

      const leaves = await LeaveApplication.findAll({
        where: whereClause,
        include: [{ model: Employee, as: "employee" }],
        order: [["createdAt", "DESC"]],
      });

      return res.json({ success: true, data: leaves });
    } else {
      const employee = await Employee.findOne({
        where: { userId: user.id }, // FIX: user.id
      });

      if (!employee)
        return res
          .status(404)
          .json({ success: false, error: "Employee record not found" });

      const leaves = await LeaveApplication.findAll({
        where: { employeeId: employee.id },
        order: [["createdAt", "DESC"]],
      });

      return res.json({
        success: true,
        data: leaves,
        employee: { isDeleted: employee.isDeleted },
      });
    }
  } catch (error) {
    console.error("Get Leaves Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch leaves" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const leaveRequest = await LeaveApplication.findByPk(id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, error: "Leave application not found" });
    }

    await leaveRequest.update({ status });

    return res.json({ success: true, data: leaveRequest });
  } catch (error) {
    console.error("Update Leave Status Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update status" });
  }
};
