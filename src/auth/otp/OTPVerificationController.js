import { OTPVerification } from "./OTPVerificationModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import User from "../user/userModel.js";

// Generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.AUTH_EMAIL,
    pass: config.AUTH_PASSWORD,
  },
});

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    // Save OTP to database
    const otpEntry = new OTPVerification({ email, otp });
    await otpEntry.save();

    // Send OTP to the user's email
    await transporter.sendMail({
      from: config.AUTH_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email", email: email });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res
      .status(500)
      .json({ error: "Failed to send OTP", details: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTPVerification.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP or OTP expired" });
    }
    await User.updateOne({ email }, { verified: true });

    // Generate a JWT token on successful verification
    const token = jwt.sign({ email }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });

    // Delete OTP record after successful verification
    await OTPVerification.deleteOne({ email });

    res.status(200).json({ message: "OTP verified", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    // Remove any previous OTP for this email
    await OTPVerification.deleteOne({ email });

    // Save new OTP to the database
    const otpEntry = new OTPVerification({ email, otp });
    await otpEntry.save();

    // Send OTP to the user's email
    await transporter.sendMail({
      from: config.AUTH_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your new OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};
