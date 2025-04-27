import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import Admin from "./adminModel.js";
import config from "../../config/index.js";
import { validationResult } from "express-validator";
import Bus from "../../bus/busModel.js";
import Route from "../../routes/routeModel.js";
import BusEntity from "../../busEntity/busEntityModel.js";
import Payment from "../../payment/paymentModel.js";
import Ticket from "../../ticket/ticketModel.js";
import mongoose from "mongoose";

export const getNextAdminId = async () => {
  const lastAdmin = await Admin.findOne().sort({ adminId: -1 });
  return lastAdmin ? lastAdmin.adminId + 1 : 1;
};

// Register a new admin
export const registerAdmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: 400,
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }

  const { name, email, password, company, role, companyId } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists." });
    }

    const adminId = await getNextAdminId();
    const newAdmin = new Admin({
      adminId,
      name,
      email,
      password,
      role: role || "admin",
      company: role === "driver" ? null : company,
      companyId: companyId || null,
    });
    await newAdmin.save();

    const token = jwt.sign(
      { sub: newAdmin._id, role: newAdmin.role, name: newAdmin.name },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      admin: {
        _id: newAdmin._id,
        adminId: newAdmin.adminId,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
      token,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Admin login
export const loginAdmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: 400,
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }

  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: admin._id, role: admin.role, name: admin.name },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const decodedToken = jwtDecode(token);
    return res.status(200).json({
      message: `Welome ${decodedToken.name.toUpperCase()} to dashboard!`,
      token,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Get admin profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        company: admin.company,
        role: admin.role,
      });
    } else {
      return res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res, next) => {
  const { name, email, password, company } = req.body;

  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.name = name || admin.name;
      admin.email = email || admin.email;
      admin.company = company || admin.company;

      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }

      const updatedAdmin = await admin.save();
      return res.json({
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        company: updatedAdmin.company,
        role: updatedAdmin.role,
      });
    } else {
      return res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Get all admins (for SuperAdmin)
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    return res.status(200).json(admins);
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export const getCompaniesInforamtion = async (req, res, next) => {
  try {
    const admins = await Admin.find({ role: "admin" }).select(
      "_id name email company"
    );
    const adminWithBusCount = await Promise.all(
      admins.map(async (admin) => {
        const busCount = await Bus.countDocuments({ adminId: admin._id });
        return {
          adminId: admin._id, // Use _id instead of adminId
          name: admin.name,
          company: admin.company,
          email: admin.email,
          totalBuses: busCount,
        };
      })
    );

    return res.status(200).json(adminWithBusCount);
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

// Get company name and admin name by ID
export const getCompanyName = async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "ID is required in the request body." });
  }

  try {
    const admin = await Admin.findById(id).select("name company");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    return res.status(200).json({
      adminName: admin.name,
      companyName: admin.company,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export const getDriversByAdminId = async (req, res) => {
  const { adminId } = req.query;

  try {
    const buses = await Admin.find({ companyId: adminId });

    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedDriver = await Admin.findByIdAndDelete(id);

    if (!deletedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (error) {
    next({
      status: 500,
      message: error.message || "Error deleting driver",
    });
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driver = await Admin.findById(id).populate("adminId", "name email");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver fetched successfully", driver });
  } catch (error) {
    next({
      status: 500,
      message: error.message || "Error fetching driver",
    });
  }
};

export const getAdminsDataAnalytics = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "admin" });

    const response = await Promise.all(
      admins.map(async (admin) => {
        const busesCount = await Bus.countDocuments({ adminId: admin._id });
        const routesCount = await Route.countDocuments({ adminId: admin._id });
        const vehiclesCount = await BusEntity.countDocuments({
          adminId: admin._id,
        });
        const driversCount = await Admin.countDocuments({
          role: "driver",
          companyId: admin._id,
        });
        const payments = await Payment.find({
          adminId: admin._id,
          status: "succeeded",
        });
        const totalRevenue = payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );
        return {
          adminId: admin._id,
          adminName: admin.name,
          routes: routesCount,
          vehicles: vehiclesCount,
          drivers: driversCount,
          buses: busesCount,
          revenue: totalRevenue,
        };
      })
    );
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fethcing admins data analytics",
      error: error.message,
    });
  }
};

export const getAdminDashboardAnalytics = async (req, res, next) => {
  try {
    const { adminId } = req.query;

    if (!adminId || typeof adminId !== "string") {
      return res
        .status(400)
        .json({ error: "adminId is required in query params." });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Run all DB queries in parallel
    const [
      driversCount,
      totalVehicles,
      upcomingBuses,
      totalRevenueAgg,
      todaysRevenueAgg,
      totalTicketsCount,
      todaysTicketsCount,
    ] = await Promise.all([
      Admin.countDocuments({ role: "driver", companyId: adminId }),
      BusEntity.countDocuments({ adminId }),
      Bus.find({ adminId, date: { $gt: now } }).lean(), // only upcoming buses
      Payment.aggregate([
        {
          $match: {
            adminId: adminId,
            status: "succeeded",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            adminId: adminId,
            status: "succeeded",
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Ticket.countDocuments({ adminId }),
      Ticket.countDocuments({
        adminId,
        issueDate: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

    // Use same filter for today's shuttles (from the upcoming list)
    const todaysBuses = upcomingBuses.filter((bus) => {
      const busDate = new Date(bus.date);
      return busDate >= todayStart && busDate <= todayEnd;
    });

    // Count unique driverIds from upcoming buses only
    const assignedDriverIds = new Set(
      upcomingBuses.map((bus) => bus.driverId?.toString()).filter(Boolean)
    );

    const assignedDrivers = assignedDriverIds.size;

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const todaysRevenue = todaysRevenueAgg[0]?.total || 0;

    res.json({
      driversRegistered: driversCount,
      totalVehicles,
      todaysShuttles: todaysBuses.length,
      totalRevenue,
      todaysRevenue,
      totalTickets: totalTicketsCount,
      todaysTickets: todaysTicketsCount,
      assignedDrivers,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return next({ status: 500, message: error.message });
  }
};
