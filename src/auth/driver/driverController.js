import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import Admin from "../admin/adminModel.js";
import EventTypes from "../../constants/eventTypes.js";

export const loginDriver = [
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { email, password } = req.body;

      // Check if driver exists
      const driver = await Admin.findOne({ email });
      if (!driver) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, driver.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          sub: driver._id,
          role: "driver",
          name: driver.name,
          email: driver.email,
        },
        config.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        message: `Welcome ${driver.name.toUpperCase()}!`,
        token,
      });
    } catch (error) {
      next({
        status: 500,
        message: error.message || "Error logging in driver",
      });
    }
  },
];

// Controller to add a new driver
export const addDriver = [
  // Controller logic
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const {
        name,
        email,
        gender,
        password,
        dob,
        phoneNumber,
        cnicNumber,
        companyId,
      } = req.body;

      // Verify if admin exists
      const admin = await Admin.findById(companyId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Check for duplicate email
      const existingDriver = await Admin.findOne({ email });
      if (existingDriver) {
        return res
          .status(400)
          .json({ message: "A driver with this email already exists" });
      }

      // Create a new driver
      const newDriver = new Admin({
        name,
        email,
        gender,
        password,
        dob,
        phoneNumber,
        cnicNumber,
        companyId: companyId,
        role: "driver",
      });

      await newDriver.save();

      res.locals.logEvent = {
        eventName: EventTypes.ADMIN_ADD_DRIVER,
        payload: newDriver,
      };

      res.status(201).json({
        message: "Driver added successfully",
        driver: newDriver,
      });
    } catch (error) {
      next({
        status: 500,
        message: error.message || "Error adding driver",
      });
    }
  },
];

// Controller to get all drivers
export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Admin.find().populate("adminId", "name email");
    res.status(200).json({ message: "Drivers fetched successfully", drivers });
  } catch (error) {
    next({
      status: 500,
      message: error.message || "Error fetching drivers",
    });
  }
};
export const getDriversByAdminId = async (req, res) => {
  const { adminId } = req.query;

  try {
    // Explicitly find by adminId
    const buses = await Admin.find({ comapnyId: adminId });

    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get a driver by ID
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

// Controller to update driver details
export const updateDriver = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDriver = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.locals.logEvent = {
      eventName: EventTypes.ADMIN_UPDATE_DRIVER,
      payload: updatedDriver,
    };

    res
      .status(200)
      .json({ message: "Driver updated successfully", driver: updatedDriver });
  } catch (error) {
    next({
      status: 500,
      message: error.message || "Error updating driver",
    });
  }
};

// Controller to delete a driver
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
