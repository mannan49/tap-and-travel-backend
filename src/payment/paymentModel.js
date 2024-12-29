import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        paymentId: { type: String, required: true },
        userId: { type: String, required: true, ref: "User", },
        busId: { type: String, required: true, ref: "Bus", },
        adminId: { type: String, required: true, ref: "Admin", },
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        status: { type: String, required: true },
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
