import express from "express";
import { createPaymentIntent, getPaymentsBySearchFilter, handleWebhook, updatePaymentStatus } from "./paymentController.js";


const paymentRouter = express.Router();

paymentRouter.post("/create-payment-intent", createPaymentIntent);
paymentRouter.post("/update-status", updatePaymentStatus);
paymentRouter.post("/payments-advance-search", getPaymentsBySearchFilter);

paymentRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleWebhook
);

export default paymentRouter;
