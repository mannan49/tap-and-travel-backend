import jwt from "jsonwebtoken";
import EventLog from "../models/eventLogModel.js";
import config from "../config/index.js";

export const logEvent = async (req, res, next) => {
  const start = Date.now();

  const platform = req.headers["x-platform"] || "Unknown";

  const {
    method,
    originalUrl: route,
    body: requestBody,
    query: queryParams,
  } = req;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const token = req.headers.authorization?.split(" ")[1];
  let userId = "";
  if (token) {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    userId = decoded?.sub || "";
  }

  res.on("finish", async () => {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;

    const timestamp = new Date().toISOString();
    const time = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });

    const logData = {
      userId,
      method,
      route,
      token,
      ip,
      userAgent,
      queryParams,
      requestBody,
      statusCode,
      responseTime,
      platform,
      timestamp,
      time,
    };

    try {
      await EventLog.create(logData);
    } catch (error) {
      console.error("Error logging event:", error);
    }
  });

  next();
};
