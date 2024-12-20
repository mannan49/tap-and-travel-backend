import mongoose from "mongoose";
import Route from "../routes/routeModel.js";
import BusEntity from "../busEntity/busEntityModel.js";

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
      validate: {
        validator: (v) => v >= new Date(),
        message: "Date must be greater than or equal to today.",
      },
    },
    busDetails: {
      type: BusEntity.schema,
    },
    seats: [SeatSchema],
    fare: FareSchema,
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model("Bus", BusSchema);
export default Bus;
