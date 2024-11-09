import mongoose from "mongoose";

const OTPVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "10m" },
});

export const OTPVerification = mongoose.model(
  "OTPVerification",
  OTPVerificationSchema
);
