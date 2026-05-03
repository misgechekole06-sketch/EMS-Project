import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Attendance = sequelize.define("Attendance", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    checkIn: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    checkOut: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    status: {
        type: DataTypes.ENUM("PRESENT", "ABSENT", "LATE"),
        defaultValue: "PRESENT",
    },
    workingHours: {
        type: DataTypes.FLOAT,
        defaultValue: null,
    },
    dayType: {
        type: DataTypes.ENUM("Full Day", "Three Quarter Day", "Half Day", "Short Day"),
        defaultValue: null,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['employeeId', 'date']
        }
    ]
});

export default Attendance;