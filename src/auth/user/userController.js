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

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 401, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user._id, role: "user", name: user.name },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const decodedToken = jwtDecode(token);

    return res.status(200).json({
      message: `Welcome ${decodedToken.name.toUpperCase()} to dashboard!`,
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

export { addUser, loginUser, getAllUsers };
