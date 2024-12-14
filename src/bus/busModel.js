import mongoose from "mongoose";

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

// Bus Details Schema
const BusDetailsSchema = new mongoose.Schema(
  {
    busNumber: {
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
  { _id: false } // Prevent adding _id for bus details
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
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMedium: {
      type: String,
      default: "",
    },
  },
  { _id: false } // Prevent adding _id for fare
);

// Route Schema
const RouteSchema = new mongoose.Schema(
  {
    startCity: {
      type: String,
      required: true,
    },
    endCity: {
      type: String,
      required: true,
    },
    stops: [
      {
        name: {
          type: String,
          required: true,
        },
        locationLink: {
          type: String,
        },
        duration: {
          type: Number,
        },
      },
    ],
  },
  { _id: false } // Prevent adding _id for route
);

// Bus Schema
const BusSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      unique: true,
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required."],
    },
    adminName: {
      type: String,
      required: [true, "Admin Name is required."],
    },
    route: RouteSchema,
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
    busCapacity: {
      type: Number,
      required: [true, "Bus capacity is required."],
      min: [1, "Bus capacity must be at least 1."],
    },
    busDetails: BusDetailsSchema,
    seats: [SeatSchema],
    fare: FareSchema,
  },
  {
    timestamps: true,
  }
);

const Bus = mongoose.model("Bus", BusSchema);
export default Bus;
