import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import User from "./userModel.js";
import config from "../../config/index.js";
import { sendOTP } from "../otp/OTPVerificationController.js";

const getNextUserId = async () => {
  try {
    const result = await User.aggregate([
      { $group: { _id: null, maxId: { $max: "$userId" } } },
    ]);
    return result.length > 0 ? result[0].maxId + 1 : 1;
  } catch (err) {
    throw new Error("Error fetching next user ID");
  }
};

const addUser = async (req, res, next) => {
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
    const {
      name,
      email,
      password,
      phoneNumber,
      RFIDCardNumber,
      travelHistory,
      paymentInformation,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: await getNextUserId(),
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      RFIDCardNumber,
      travelHistory,
      paymentInformation,
      verified: false,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Call the sendOTP function to send an OTP to the user's email
    await sendOTP(req, res);

    // Response without JWT until OTP is verified
    return res.status(201).json({
      message: "OTP sent to your email for verification",
      user: newUser,
    });
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      return next({ status: 400, message: "Email already exists" });
    }
    return next({ status: 500, message: err.message });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password, RFIDCardNumber } = req.body;
    let user;
    if (RFIDCardNumber) {
      if (typeof RFIDCardNumber !== "string") {
        return res.status(400).json({ message: "RFID Card Not found" });
      }
      user = await User.findOne({ RFIDCardNumber: String(RFIDCardNumber) });
      if (!user) {
        return next({ status: 401, message: "Invalid RFID Card Number" });
      }
    } else if (email && password) {
      // Check if login is via email and password
      user = await User.findOne({ email });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next({ status: 401, message: "Invalid credentials" });
      }
      if (!user) {
        return next({ status: 401, message: "Invalid credentials" });
      }
    }

    const token = jwt.sign(
      { sub: user._id, role: "user", name: user.name, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: `Welcome ${user.name.toUpperCase()} to dashboard!`,
      token,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (err) {
    return next({ status: 500, message: "Error fetching users" });
  }
};

const addRfidCardNumber = async (req, res, next) => {
  try {
    const { email, RFIDCardNumber } = req.body;

    // Validate the input
    if (!email || !RFIDCardNumber) {
      return res
        .status(400)
        .json({ message: "Email and RFIDCardNumber are required" });
    }

    // Check if the RFID card number already exists for another user
    const existingUserWithRfid = await User.findOne({ RFIDCardNumber });
    if (existingUserWithRfid) {
      return res.status(400).json({ message: "Already Registered RFID Card" });
    }

    // Find the user by email and update the RFID card number
    const user = await User.findOneAndUpdate(
      { email },
      { RFIDCardNumber },
      { new: true } // Return the updated user
    );

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "RFID card number updated successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const deleteRfidCardNumber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate the input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user by email and set the RFIDCardNumber to an empty string
    const user = await User.findOneAndUpdate(
      { email },
      { RFIDCardNumber: "" },
      { new: true } // Return the updated user
    );

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "RFID card number deleted successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getRfidCardNumber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate the input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user by email and return the RFIDCardNumber
    const user = await User.findOne({ email });

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "RFID card number retrieved successfully",
      RFIDCardNumber: user.RFIDCardNumber,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export {
  addUser,
  loginUser,
  getAllUsers,
  addRfidCardNumber,
  deleteRfidCardNumber,
  getRfidCardNumber,
};
