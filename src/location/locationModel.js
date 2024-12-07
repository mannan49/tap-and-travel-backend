import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    userLatitude: {
      type: Number,
      required: false,
    },
    userLongitude: {
      type: Number,
      required: false,
    },
    driverLatitude: {
      type: Number,
      required: false,
    },
    driverLongitude: {
      type: Number,
      required: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;
