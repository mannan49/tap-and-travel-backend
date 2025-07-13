import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Admin from "../auth/admin/adminModel.js";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw createHttpError(401, "Token has expired.");
    }
    if (err.name === "JsonWebTokenError") {
      throw createHttpError(401, "Invalid token.");
    }
    throw createHttpError(500, "Internal server error.");
  }
};

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  const parsedToken = token.split(" ")[1];
  if (!parsedToken) {
    return next(createHttpError(401, "Token format is invalid."));
  }

  try {
    const decoded = verifyToken(parsedToken);
    req.userId = decoded.sub;
    req.role = decoded.role;
    next();
  } catch (err) {
    return next(err);
  }
};

// Admin role validation middleware
const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(createHttpError(401, "Authentication token is missing."));
  }

  try {
    const decoded = verifyToken(token);
    const adminId = decoded.sub;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return next(createHttpError(404, "Admin not found."));
    }
    if (admin.role !== "admin") {
      return next(createHttpError(403, "Access denied. Admin only."));
    }

    req.admin = admin;
    next();
  } catch (error) {
    return next(error);
  }
};

// SuperAdmin role validation middleware
const isSuperAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(createHttpError(401, "Authentication token is missing."));
  }

  try {
    const decoded = verifyToken(token);
    const adminId = decoded.sub;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return next(createHttpError(404, "Admin not found."));
    }
    if (admin.role !== "superadmin") {
      return next(createHttpError(403, "Access denied. SuperAdmin only."));
    }

    req.admin = admin;
    next();
  } catch (error) {
    return next(error);
  }
};

export { authenticate, isAdmin, isSuperAdmin };
