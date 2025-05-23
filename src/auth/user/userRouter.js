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
  resendSignupOtp,
  resetPasswordAfterOtp,
  saveFcmToken,
  sendForgotPasswordOtp,
  updateProfile,
  verifyForgotPasswordOtp,
  verifyPassword,
  verifySignupOtp,
} from "./userController.js";
import {
  userValidationRules,
  loginValidationRules,
  passwordValidationRules,
} from "./validation.js";

const userRouter = express.Router();

userRouter.get("/req", getAllUsers);
userRouter.post("/register", userValidationRules(), addUser);
userRouter.post("/login", loginValidationRules(), loginUser);

userRouter.post("/verify-otp", verifySignupOtp);
userRouter.post("/resend-otp", resendSignupOtp);

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
userRouter.post("/save-token", saveFcmToken);

export default userRouter;
