import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.Mixed },
  payload: mongoose.Schema.Types.Mixed,
  method: String,
  route: String,
  token: String,
  ip: String,
  userAgent: String,
  queryParams: mongoose.Schema.Types.Mixed,
  requestBody: mongoose.Schema.Types.Mixed,
  statusCode: Number,
  responseTime: Number,
  platform: String,
  timestamp: { type: Date, default: Date.now },
  time: String,
});
export default mongoose.model("EventLog", eventLogSchema);
