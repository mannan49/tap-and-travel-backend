import express from "express";
import { addUser, getAllUsers, loginUser } from "./userController.js";
import { userValidationRules, loginValidationRules } from "./validation.js";

const userRouter = express.Router();

userRouter.get("/req", getAllUsers);
userRouter.post("/register", userValidationRules(), addUser);
userRouter.post("/login", loginValidationRules(), loginUser);

export default userRouter;
