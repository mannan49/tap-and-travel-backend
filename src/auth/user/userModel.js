import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  RFIDCardNumber: {
    type: String,
  },
  address: {
    province: String,
    city: String,
    postalCode: Number,
    address: String,
  },
  RFIDCardStatus: {
    type: "String",
    default: "pending",
    enum: ["pending", "booked", "delivered"],
  },
  signupOtp: {
    otp: { type: String },
    expired: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  forgotPasswordOtp: {
    otp: { type: String },
    expired: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    secret_key: { type: String },
  },
  travelHistory: Array,
  paymentInformation: Object,
});

const User = mongoose.model("User", userSchema);
export default User;
