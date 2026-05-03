import LeaveApplication from "../models/LeaveApplication.js";
import Employee from "../models/Employee.js";

export const applyLeave = async (req, res) => {
  try {
    const session = req.session;
    const employee = await Employee.findOne({
      where: { userId: session.userId },
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });
    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot apply for leave.",
      });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(startDate) <= today || new Date(endDate) <= today) {
      return res
        .status(400)
        .json({ error: "Leave dates must be in the future" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    const leave = await LeaveApplication.create({
      employeeId: employee.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    return res.json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";

    if (isAdmin) {
      const status = req.query.status;
      const whereClause = status ? { status } : {};

      const leaves = await LeaveApplication.findAll({
        where: whereClause,
        include: [{ model: Employee, as: "employee" }],
        order: [["createdAt", "DESC"]],
      });

      return res.json({ data: leaves });
    } else {
      const employee = await Employee.findOne({
        where: { userId: session.userId },
      });

      if (!employee) return res.status(404).json({ error: "Not found" });

      const leaves = await LeaveApplication.findAll({
        where: { employeeId: employee.id },
        order: [["createdAt", "DESC"]],
      });

      return res.json({ data: leaves, employee });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await LeaveApplication.update({ status }, { where: { id: req.params.id } });

    const updatedLeave = await LeaveApplication.findByPk(req.params.id);

    return res.json({ success: true, data: updatedLeave });
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};
