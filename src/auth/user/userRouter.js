import express from "express";
import {
  addRfidCardNumber,
  addUser,
  deleteRfidCardNumber,
  getAllUsers,
  getRfidCardNumber,
  loginUser,
} from "./userController.js";
import { userValidationRules, loginValidationRules } from "./validation.js";
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

export default userRouter;
