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

const isSuperAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.userId);
    if (!admin) {
      return next(createHttpError(404, "Admin not found"));
    }

    if (admin.role !== "superadmin") {
      return next(createHttpError(403, "Access denied. SuperAdmin only."));
    }

    next();
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export { authenticate, isSuperAdmin };
