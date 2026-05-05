import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { inngest } from "../inngest/index.js";

export const clockInOut = async (req, res) => {
  try {
    const user = req.user;

    const employee = await Employee.findOne({
      where: { userId: user.userId },
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot clock in/out.",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const existing = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: today,
      },
    });

    if (!existing) {
      const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      const attendance = await Attendance.create({
        employeeId: employee.id,
        date: today,
        checkIn: now,
        status: isLate ? "LATE" : "PRESENT",
      });
      await inngest.send({
        name: "employee/check-out",
        data: {
          employeeId: employee.id,
          attendanceId: attendance.id,
        },
      });

      return res.json({ success: true, type: "CHECK_IN", data: attendance });
    } else if (!existing.checkOut) {
      const checkInTime = new Date(existing.checkIn).getTime();
      const diffMs = now.getTime() - checkInTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      const workingHours = parseFloat(diffHours.toFixed(2));
      let dayType = "Half Day";

      if (workingHours >= 8) dayType = "Full Day";
      else if (workingHours >= 6) dayType = "Three Quarter Day";
      else if (workingHours >= 4) dayType = "Half Day";
      else dayType = "Short Day";

      await existing.update({
        checkOut: now,
        workingHours: workingHours,
        dayType: dayType,
      });

      return res.json({ success: true, type: "CHECK_OUT", data: existing });
    } else {
      return res.json({ success: true, type: "CHECK_OUT", data: existing });
    }
  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ error: "Operation failed" });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const user = req.user;
    const employee = await Employee.findOne({
      where: { userId: user.userId },
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const limit = parseInt(req.query.limit || 30);

    const history = await Attendance.findAll({
      where: { employeeId: employee.id },
      order: [["date", "DESC"]],
      limit: limit,
    });

    return res.json({
      data: history,
      employee: { isDeleted: employee.isDeleted },
    });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
