import { DEPARTMENTS } from "../constants/departments.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import Payslip from "../models/Payslip.js";
import { Op } from "sequelize";

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "ADMIN") {
      const [totalEmployees, todayAttendance, pendingLeaves] =
        await Promise.all([
          Employee.count({ where: { isDeleted: { [Op.ne]: true } } }),
          Attendance.count({
            where: {
              date: {
                [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
                [Op.lt]: new Date(new Date().setHours(24, 0, 0, 0)),
              },
            },
          }),
          LeaveApplication.count({ where: { status: "PENDING" } }),
        ]);

      return res.json({
        role: "ADMIN",
        totalEmployees,
        totalDepartments: DEPARTMENTS.length,
        todayAttendance,
        pendingLeaves,
      });
    } else {
      const employee = await Employee.findOne({
        where: { userId: user.id },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1,
      );

      const [currentMonthAttendance, pendingLeaves, latestPayslip] =
        await Promise.all([
          Attendance.count({
            where: {
              employeeId: employee.id,
              date: {
                [Op.gte]: firstDayOfMonth,
                [Op.lt]: lastDayOfMonth,
              },
            },
          }),
          LeaveApplication.count({
            where: {
              employeeId: employee.id,
              status: "PENDING",
            },
          }),
          Payslip.findOne({
            where: { employeeId: employee.id },
            order: [["createdAt", "DESC"]],
          }),
        ]);

      return res.json({
        role: "EMPLOYEE",
        employee: employee,
        currentMonthAttendance,
        pendingLeaves,
        latestPayslip: latestPayslip || null,
      });
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ error: "Failed" });
  }
};
