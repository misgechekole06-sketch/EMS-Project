import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { DEPARTMENTS } from "../constants/departments.js";
import User from "./User.js";

const Employee = sequelize.define(
  "Employee",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING, allowNull: false },
    basicSalary: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    allowances: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    employmentStatus: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    joinDate: { type: DataTypes.DATE, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    bio: { type: DataTypes.TEXT, defaultValue: "" },
    department: { type: DataTypes.ENUM(...DEPARTMENTS), allowNull: false },
  },
  {
    tableName: "employees",
    timestamps: true,
  },
);

User.hasOne(Employee, { foreignKey: "userId", onDelete: "CASCADE" });
Employee.belongsTo(User, { foreignKey: "userId" });

export default Employee;
