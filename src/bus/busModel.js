import mongoose from "mongoose";
import Route from "../routes/routeModel.js";

const BusEntitySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required."],
    },
    busNumber: {
      type: String,
      required: true,
    },
    busCapacity: {
      type: String,
      required: true,
    },
    engineNumber: {
      type: String,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    ac: {
      type: Boolean,
      default: false,
    },
    fuelType: {
      type: String,
      default: "diesel",
      enum: ["diesel", "electric"],
    },
    standard: {
      type: String,
      default: "executive",
      enum: ["economy", "executive", "business"],
    },
  },
  { _id: false }
);

// Seat Schema
const SeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    neighborSeatNumber: {
      type: String,
      default: null,
    },
    booked: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    neighborGender: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Fare Schema
const FareSchema = new mongoose.Schema(
  {
    actualPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    promoCode: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Bus Schema
const BusSchema = new mongoose.Schema(
  {
    busEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus-Entity",
      required: [true, "Bus Entity Id is required."],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required."],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "RouteId id required"],
    },
    route: {
      type: Route.schema,
    },
    adminName: {
      type: String,
      required: [true, "Admin Name is required."],
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required."],
    },
    arrivalTime: {
      type: String,
      required: [true, "Arrival time is required."],
    },
    date: {
      type: Date,
      required: [true, "Date is required."],
    },
    busDetails: BusEntitySchema,
    seats: [SeatSchema],
    fare: FareSchema,
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model("Bus", BusSchema);
export default Bus;
