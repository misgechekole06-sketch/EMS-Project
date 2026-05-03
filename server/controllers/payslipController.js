import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";

export const createPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const netSalary =
      Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

    const payslip = await Payslip.create({
      employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
    });

    return res.json({ success: true, data: payslip });
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};

export const getPayslips = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === "ADMIN") {
      const payslips = await Payslip.findAll({
        include: [{ model: Employee, as: "employee" }],
        order: [["createdAt", "DESC"]],
      });
      return res.json({ data: payslips });
    } else {
      const employee = await Employee.findOne({ where: { userId: userId } });

      if (!employee) return res.status(404).json({ error: "Not found" });

      const payslips = await Payslip.findAll({
        where: { employeeId: employee.id },
        order: [["createdAt", "DESC"]],
      });
      return res.json({ data: payslips });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findByPk(req.params.id, {
      include: [{ model: Employee, as: "employee" }],
    });

    if (!payslip) return res.status(404).json({ error: "Not found" });

    return res.json(payslip);
  } catch (error) {
    return res.status(500).json({ error: "Failed" });
  }
};
