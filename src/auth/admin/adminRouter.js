import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  getCompaniesInforamtion,
  getCompanyName,
  getDriversByAdminId,
  deleteDriver,
} from "./adminController.js";
import { authenticate, isSuperAdmin } from "../../middlewares/authenticate.js";
import { loginValidationRules } from "../user/validation.js";

const adminRouter = express.Router();

// Public routes
adminRouter.get("/companies-information", getCompaniesInforamtion);
adminRouter.get("/company-name", getCompanyName);
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginValidationRules(), loginAdmin);

// Private routes
adminRouter.get("/profile", authenticate, getAdminProfile);
adminRouter.put("/profile", authenticate, updateAdminProfile);

// SuperAdmin only route
// adminRouter.get("/", authenticate, getAllAdmins);
adminRouter.get("/", getDriversByAdminId);
adminRouter.delete("/:id", deleteDriver);

export default adminRouter;
