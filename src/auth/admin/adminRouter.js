import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
} from "./adminController.js";
import { authenticate, isSuperAdmin } from "../../middlewares/authenticate.js";
import {
  userValidationRules,
  loginValidationRules,
} from "../user/validation.js";

const adminRouter = express.Router();

// Public routes
// adminRouter.post("/register", registerAdmin);
adminRouter.post("/register", userValidationRules(), registerAdmin);
adminRouter.post("/login", loginValidationRules(), loginAdmin);

// Private routes
adminRouter.get("/profile", authenticate, getAdminProfile);
adminRouter.put("/profile", authenticate, updateAdminProfile);

// SuperAdmin only route
adminRouter.get("/", authenticate, isSuperAdmin, getAllAdmins);

export default adminRouter;
