import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import { Op } from "sequelize";
import sendEmail from "../config/nodemailer.js";

export const inngest = new Inngest({
  id: "fullstack-ems",
  name: "EMS Project",
});

const autoCheckOut = inngest.createFunction(
  {
    id: "auto-check-out",
    name: "Auto Check Out",
    triggers: [{ event: "employee/check-out" }],
  },
  // FIX: Wrap logic in a handler object
  {
    handler: async ({ event, step }) => {
      const { employeeId, attendanceId } = event.data;

      await step.sleep("wait-for-9-hours", "9h");

      let attendance = await Attendance.findByPk(attendanceId);

      if (attendance && !attendance.checkOut) {
        const employee = await Employee.findByPk(employeeId);

        if (employee?.email) {
          await sendEmail({
            to: employee.email,
            subject: "Attendance Reminder",
            body: "<h1>Please check out! You have been working for over 9 hours.</h1>",
          });
        }

        await step.sleep("wait-for-1-hour", "1h");

        attendance = await Attendance.findByPk(attendanceId);

        if (attendance && !attendance.checkOut) {
          const checkInTime = new Date(attendance.checkIn).getTime();
          attendance.checkOut = new Date(checkInTime + 4 * 60 * 60 * 1000);
          attendance.workingHours = 4;
          attendance.dayType = "Half Day";
          attendance.status = "LATE";
          await attendance.save();
        }
      }
    },
  },
);

const leaveApplicationReminder = inngest.createFunction(
  {
    id: "leave-application-reminder",
    name: "Leave Application Reminder",
    triggers: [{ event: "leave/pending" }],
  },
  // FIX: Wrap logic in a handler object
  {
    handler: async ({ event, step }) => {
      const { leaveApplicationId } = event.data;
      await step.sleep("wait-for-24-hours", "24h");

      const leaveApplication = await LeaveApplication.findByPk(
        leaveApplicationId,
      );
      if (leaveApplication?.status === "PENDING") {
        const employee = await Employee.findByPk(leaveApplication.employeeId);

        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "Leave Application Reminder",
          body: `<h1>Hello Admin, please take action on leave request from ${employee?.firstName} ${employee?.lastName}.</h1>`,
        });
      }
    },
  },
);

const attendanceReminderCron = inngest.createFunction(
  {
    id: "attendance-reminder-cron",
    name: "Daily Attendance Reminder",
    triggers: [{ cron: "0 30 8 * * *" }],
  },
  // FIX: Wrap logic in a handler object
  {
    handler: async ({ step }) => {
      const today = await step.run("get-today-date", () => {
        const startUTC = new Date(
          new Date().toLocaleDateString("en-CA", {
            timeZone: "Africa/Addis_Ababa",
          }) + "T00:00:00+03:00",
        );
        const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
        return {
          startUTC: startUTC.toISOString(),
          endUTC: endUTC.toISOString(),
        };
      });

      const activeEmployees = await step.run(
        "get-active-employees",
        async () => {
          const employees = await Employee.findAll({
            where: { isDeleted: false, employmentStatus: "ACTIVE" },
            raw: true,
          });
          return employees.map((e) => ({
            id: e.id.toString(),
            firstName: e.firstName,
            lastName: e.lastName,
            email: e.email,
          }));
        },
      );

      const onLeaveIds = await step.run("get-on-leave-ids", async () => {
        const leaves = await LeaveApplication.findAll({
          where: {
            status: "APPROVED",
            startDate: { [Op.lte]: new Date(today.endUTC) },
            endDate: { [Op.gte]: new Date(today.startUTC) },
          },
          raw: true,
        });
        return leaves.map((l) => l.employeeId.toString());
      });

      const checkedInIds = await step.run("get-checked-in-ids", async () => {
        const attendances = await Attendance.findAll({
          where: {
            date: {
              [Op.gte]: new Date(today.startUTC),
              [Op.lt]: new Date(today.endUTC),
            },
          },
          raw: true,
        });
        return attendances.map((a) => a.employeeId.toString());
      });

      const absentEmployees = activeEmployees.filter(
        (emp) => !onLeaveIds.includes(emp.id) && !checkedInIds.includes(emp.id),
      );

      if (absentEmployees.length > 0) {
        await step.run("send-reminder-emails", async () => {
          const emailPromises = absentEmployees.map((emp) => {
            return sendEmail({
              to: emp.email,
              subject: "Attendance Reminder",
              body: `<h1>Hello ${emp.firstName}, please mark your attendance for today.</h1>`,
            });
          });
          await Promise.all(emailPromises);
        });
      }

      return {
        totalActive: activeEmployees.length,
        absent: absentEmployees.length,
      };
    },
  },
);

export const functions = [
  autoCheckOut,
  leaveApplicationReminder,
  attendanceReminderCron,
];
