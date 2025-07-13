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
  let userId = "";
  let token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      userId = decoded?.sub || "";
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.warn("JWT expired while logging event.");
      } else {
        console.warn("Invalid JWT token while logging event.");
      }
      token = "";
    }
  }

  res.on("finish", async () => {
    const logTrigger = res.locals.logEvent;
    if (!logTrigger?.eventName) return;
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
      eventName: logTrigger.eventName,
      payload: logTrigger.payload,
    };

    try {
      await EventLog.create(logData);
    } catch (error) {
      console.error("Error logging event:", error);
    }
  });

  next();
};
