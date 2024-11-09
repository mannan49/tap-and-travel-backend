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
  RFIDCardNumber: String,
  travelHistory: Array,
  paymentInformation: Object,
});

const User = mongoose.model("User", userSchema);
export default User;
