import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import globalErrorHandler from "./src/middlewares/globalErrorHandler.js";
import http from "http";
import swaggerUi from "swagger-ui-express";
import { initializeWebSocket } from "./webSocket.js";
import swaggerFile from "./swagger-output.json" assert { type: "json" };

// Importing routes
import userRouter from "./src/auth/user/userRouter.js";
import connectDB from "./src/config/connectDB.js";
import adminRouter from "./src/auth/admin/adminRouter.js";
import busRouter from "./src/bus/busRouter.js";
import ticketRouter from "./src/ticket/ticketRouter.js";
import locationRouter from "./src/location/locationRouter.js";
import routeRouter from "./src/routes/routeRouter.js";
import driverRouter from "./src/auth/driver/driverRouter.js";
import busEntityRouter from "./src/busEntity/busEntityRouter.js";
import paymentRouter from "./src/payment/paymentRouter.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const corsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
connectDB();

// Use the generated Swagger JSON file with Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// API routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/driver", driverRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/bus", busRouter);
app.use("/api/v1/ticket", ticketRouter);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/route", routeRouter);
app.use("/api/v1/bus-entity", busEntityRouter);
app.use("/api/v1/payment", paymentRouter);

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the TapAndTravel application." });
});

// Global error handler
app.use(globalErrorHandler);

const server = http.createServer(app);

app.post("/api/validate-rfid", (req, res) => {
  const { uid } = req.body;

  // Validate the UID (you can replace this with database logic)
  if (uid === scannedUID) {
    res.json({ status: "success", message: "Access Granted!" });
  } else {
    res.json({ status: "error", message: "Invalid UID!" });
  }
});

// Initialize WebSocket
initializeWebSocket(server);

// Start server
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
