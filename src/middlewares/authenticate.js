import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import Admin from "../auth/admin/adminModel.js";

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  try {
    const parsedToken = token.split(" ")[1];
    if (!parsedToken) {
      return next(createHttpError(401, "Token format is invalid."));
    }

    const decoded = jwt.verify(parsedToken, config.JWT_SECRET);
    req.userId = decoded.sub;
    req.role = decoded.role;

    next();
  } catch (err) {
    return next(createHttpError(401, "Invalid or expired token."));
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(createHttpError(401, "Authentication token is missing."));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
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
    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(401, "Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Token has expired."));
    }
    return next(createHttpError(500, error.message));
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(createHttpError(401, "Authentication token is missing."));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const adminId = decoded.sub;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return next(createHttpError(404, "Admin not found."));
    }
    if (admin.role !== "superadmin") {
      return next(createHttpError(403, "Access denied. SuprAdmin only."));
    }
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(401, "Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Token has expired."));
    }
    return next(createHttpError(500, error.message));
  }
};

export { authenticate, isSuperAdmin };
