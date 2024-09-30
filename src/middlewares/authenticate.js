import createHttpError from "http-errors";
import jwt from 'jsonwebtoken';
import config from "../config/index.js";
import Admin from "../auth/admin/adminModel.js"; // Ensure the path is correct

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  try {
    const parsedToken = token.split(" ")[1]; // Expecting 'Bearer <token>'
    if (!parsedToken) {
      return next(createHttpError(401, "Token format is invalid."));
    }

    const decoded = jwt.verify(parsedToken, config.JWT_SECRET);
    req.userId = decoded.sub; // Attach userId from the decoded token to the request object
    req.role = decoded.role; // You should ensure `role` is included in your JWT payload

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return next(createHttpError(401, "Invalid or expired token."));
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.userId); // `userId` is attached in the authenticate middleware
    if (!admin) {
      return next(createHttpError(404, "Admin not found"));
    }

    if (admin.role !== 'superadmin') {
      return next(createHttpError(403, "Access denied. SuperAdmin only."));
    }

    next(); // If the role is superadmin, proceed to the next middleware or controller
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export { authenticate, isSuperAdmin };
