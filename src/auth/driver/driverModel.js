import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver's name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"],
    },
    cnicNumber: {
      type: String,
      required: [true, "CNIC number is required"],
      unique: true,
      match: [/^\d{13}$/, "CNIC must be exactly 13 digits"],
    },
    role: {
      type: String,
      default: "driver",
      enum: ["driver"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
    },
    lastBusDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: false,
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", DriverSchema);
export default Driver;
