import express from "express";
import {
  addRfidCardNumber,
  addUser,
  changePassword,
  deleteRfidCardNumber,
  getAllUsers,
  getRfidCardNumber,
  getUserById,
  loginUser,
  resetPasswordAfterOtp,
  sendForgotPasswordOtp,
  updateProfile,
  verifyForgotPasswordOtp,
  verifyPassword,
} from "./userController.js";
import {
  userValidationRules,
  loginValidationRules,
  passwordValidationRules,
} from "./validation.js";
import { resendOTP, verifyOTP } from "../otp/OTPVerificationController.js";

const userRouter = express.Router();

userRouter.get("/req", getAllUsers);
userRouter.post("/register", userValidationRules(), addUser);
userRouter.post("/login", loginValidationRules(), loginUser);

userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/resend-otp", resendOTP);

userRouter.post("/rfid-add", addRfidCardNumber);
userRouter.get("/rfid-get", getRfidCardNumber);
userRouter.post("/rfid-delete", deleteRfidCardNumber);
userRouter.patch("/update-profile", updateProfile);
userRouter.post("/change-password", passwordValidationRules(), changePassword);
userRouter.post("/verify-password", verifyPassword);
userRouter.get("/:id", getUserById);

userRouter.post("/forgot-password/send-otp", sendForgotPasswordOtp);
userRouter.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
userRouter.post("/forgot-password/reset", resetPasswordAfterOtp);

export default userRouter;
