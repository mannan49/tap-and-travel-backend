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
      message: `Welcome ${user.name.toUpperCase()} to Tap & Travel.`,
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
    const { email, RFIDCardNumber, RFIDCardStatus } = req.body;

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
      { RFIDCardNumber, RFIDCardStatus },
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


const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const updateFields = {};
    const allowedFields = ["name", "phoneNumber", "address", "RFIDCardStatus"];

    // Loop through allowed fields and add them to updateFields if they exist in req.body
    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updateFields[field] = req.body[field];
      }
    });

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};



const verifyPassword = async (req, res, next) => {
  try {
    const { email, oldPassword } = req.body;
    if (!email || !oldPassword) {
      return res.status(400).json({
        message: "Email and old password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password doesn't match to the Old Pasword." });
    }

    // If the password matches
    return res.status(200).json({ verified: true, message: "Password is correct" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};


const changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate the input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, old password, and new password are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    // Check if the old password matches the user's current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next({ status: 401, message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};



const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the input
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};



export {
  updateProfile, changePassword, getUserById, verifyPassword,
  addUser,
  loginUser,
  getAllUsers,
  addRfidCardNumber,
  deleteRfidCardNumber,
  getRfidCardNumber,
};
