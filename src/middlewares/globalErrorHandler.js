import config from "../config/index.js";

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error details (optional)
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`, err);

  return res.status(statusCode).json({
    message: err.message,
    errorStack: config.DEV_MODE === "development" ? err.stack : "",
  });
};

export default globalErrorHandler;
