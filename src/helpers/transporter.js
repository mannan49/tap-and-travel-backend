import nodemailer from "nodemailer";
import config from "../config/index.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.AUTH_EMAIL,
    pass: config.AUTH_PASSWORD,
  },
});
