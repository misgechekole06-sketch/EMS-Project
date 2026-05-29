import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./Employee.js";

const Payslip = sequelize.define(
  "Payslip",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    basicSalary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    allowances: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    deductions: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    netSalary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "payslips",
    timestamps: true,
  },
);

Payslip.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });

export default Payslip;
