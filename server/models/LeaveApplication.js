import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./Employee.js";

const LeaveApplication = sequelize.define(
  "LeaveApplication",
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
    type: {
      type: DataTypes.ENUM("SICK", "CASUAL", "ANNUAL"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "leaveapplications",
    timestamps: true,
  },
);

LeaveApplication.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

export default LeaveApplication;
