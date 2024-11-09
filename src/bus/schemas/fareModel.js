import mongoose from "mongoose";

const FareSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    promoCode: {
      type: String,
      default: null,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      required: true, // e.g., 'credit card', 'paypal', etc.
    },
  },
  {
    timestamps: true,
  }
);

const Fare = mongoose.model("Fare", FareSchema);
export default Fare;
