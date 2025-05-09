import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./userModel.js";
import config from "../../config/index.js";
import { generateSecretKey } from "../../helpers/generateSecretKey.js";
import { transporter } from "../../helpers/transporter.js";
import { generateOTP } from "../../helpers/generateOTP.js";
import { getOtpEmailTemplate } from "../../helpers/get-otp-email-template.js";
import EventTypes from "../../constants/eventTypes.js";

const getNextUserId = async () => {
  try {
    const result = await User.aggregate([
      { $group: { _id: null, maxId: { $max: "$userId" } } },
    ]);
    return result.length > 0 ? result[0].maxId + 1 : 1;
  } catch (err) {
    throw new Error("Error fetching next user ID");
  }
};

const addUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({
      status: 400,
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }

  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      RFIDCardNumber,
      travelHistory,
      paymentInformation,
    } = req.body;

    const existingUser = await User.findOne({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser) {
      if (existingUser.verified) {
        return next({ status: 400, message: "Email already exists" });
      }

      // Update OTP for unverified user
      existingUser.signupOtp = {
        otp,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        expired: false,
        verified: false,
      };

      await existingUser.save();

      await transporter.sendMail({
        from: config.AUTH_EMAIL,
        to: email,
        subject: "Signup OTP (Resent)",
        html: getOtpEmailTemplate(otp),
      });

      return res.status(200).json({
        message: "New OTP sent to your email for verification",
        userId: existingUser._id,
      });
    }

    // No user exists — create a new one
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: await getNextUserId(),
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      RFIDCardNumber,
      travelHistory,
      paymentInformation,
      verified: false,
      signupOtp: {
        otp,
        expiresAt,
      },
    });

    const savedUser = await newUser.save();

    await transporter.sendMail({
      from: config.AUTH_EMAIL,
      to: email,
      subject: "Signup OTP",
      html: getOtpEmailTemplate(otp),
    });

    return res.status(201).json({
      message: "OTP sent to your email for verification",
      userId: savedUser._id,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export const verifySignupOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.signupOtp || user.signupOtp.verified) {
      return next({ status: 400, message: "Invalid or already verified" });
    }

    if (user.signupOtp.expired || new Date() > user.signupOtp.expiresAt) {
      return next({ status: 400, message: "OTP expired" });
    }

    if (user.signupOtp.otp !== otp) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    user.verified = true;
    user.signupOtp.verified = true;
    user.signupOtp.expired = true;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { sub: user._id, role: "user", name: user.name, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.locals.logEvent = {
      eventName: EventTypes.USER_SIGNUP,
      payload: user,
    };

    return res.status(200).json({
      message: `Welcome ${user.name.toUpperCase()} to Tap & Travel.`,
      token,
      userId: user._id,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

export const resendSignupOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next({ status: 400, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    if (user.verified) {
      return next({ status: 400, message: "User already verified" });
    }

    const otp = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins

    user.signupOtp = {
      otp,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      expired: false,
      verified: false,
    };

    await user.save();

    await transporter.sendMail({
      from: config.AUTH_EMAIL,
      to: email,
      subject: "Resend OTP - Tap & Travel",
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f5;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-bottom: 10px;">Tap & Travel</h2>
          <p style="color: #475569; font-size: 18px; margin-bottom: 20px;">Here is your new OTP to complete verification</p>
          <div style="display: flex; justify-content: center; background: #f1f5f9; border: 2px solid #1e293b; border-radius: 12px; padding: 15px 20px; font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #1e293b; margin-bottom: 20px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
      `,
    });

    return res.status(200).json({
      message: "OTP resent successfully to your email.",
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: "Invalid credentials" });
    }
    if (!user) {
      return next({ status: 401, message: "Invalid credentials" });
    }
    if (!user.verified) {
      return next({ status: 401, message: "Your Account Is Not Verified" });
    }

    const token = jwt.sign(
      { sub: user._id, role: "user", name: user.name, email: user.email },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.locals.logEvent = {
      eventName: EventTypes.USER_LOGIN,
      payload: user,
    };

    return res.status(200).json({
      message: `Welcome ${user.name.toUpperCase()} to Tap & Travel.`,
      token,
      userId: user._id,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (err) {
    return next({ status: 500, message: "Error fetching users" });
  }
};

const addRfidCardNumber = async (req, res, next) => {
  try {
    const { email, RFIDCardNumber, RFIDCardStatus } = req.body;

    // Validate the input
    if (!email || !RFIDCardNumber) {
      return res
        .status(400)
        .json({ message: "Email and RFIDCardNumber are required" });
    }

    // Check if the RFID card number already exists for another user
    const existingUserWithRfid = await User.findOne({ RFIDCardNumber });
    if (existingUserWithRfid) {
      return res.status(400).json({ message: "Already Registered RFID Card" });
    }

    // Find the user by email and update the RFID card number
    const user = await User.findOneAndUpdate(
      { email },
      { RFIDCardNumber, RFIDCardStatus },
      { new: true } // Return the updated user
    );

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    res.locals.logEvent = {
      eventName: EventTypes.SUPERADMIN_DELIVER_RFID,
      payload: user,
    };

    return res.status(200).json({
      message: "RFID card number updated successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const deleteRfidCardNumber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate the input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        RFIDCardNumber: "",
        RFIDCardStatus: "pending"
      },
      { new: true } 
    );

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    res.locals.logEvent = {
      eventName: EventTypes.SUPERADMIN_DELETED_RFID,
      payload: user,
    };

    return res.status(200).json({
      message: "RFID card number deleted successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getRfidCardNumber = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate the input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user by email and return the RFIDCardNumber
    const user = await User.findOne({ email });

    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "RFID card number retrieved successfully",
      RFIDCardNumber: user.RFIDCardNumber,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User Not Found." });
    }

    const updateFields = {};
    const allowedFields = ["name", "phoneNumber", "address", "RFIDCardStatus"];

    // Loop through allowed fields and add them to updateFields if they exist in req.body
    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updateFields[field] = req.body[field];
      }
    });

    // Update the user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const verifyPassword = async (req, res, next) => {
  try {
    const { email, oldPassword } = req.body;
    if (!email || !oldPassword) {
      return res.status(400).json({
        message: "Email and old password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Password doesn't match to the Old Pasword." });
    }

    // If the password matches
    return res
      .status(200)
      .json({ verified: true, message: "Password is correct" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate the input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, old password, and new password are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    // Check if the old password matches the user's current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next({ status: 401, message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the input
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const sendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next({ status: 404, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const secretKey = generateSecretKey();
    const now = new Date();

    user.forgotPasswordOtp = {
      otp,
      expired: false,
      verified: false,
      createdAt: now,
      updatedAt: now,
      secret_key: secretKey,
    };

    await user.save();

    await transporter.sendMail({
      from: config.AUTH_EMAIL,
      to: email,
      subject: "Forgot Password OTP",
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f5;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-bottom: 10px;">Tap & Travel</h2>
          <p style="color: #475569; font-size: 18px; margin-bottom: 20px;">Enter this OTP to complete your verification</p>
  
          <div style="display: flex; justify-content: center; background: #f1f5f9; border: 2px solid #1e293b; border-radius: 12px; padding: 15px 20px; font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #1e293b; margin-bottom: 20px;">
            ${otp}
          </div>
  
          <p style="color: #64748b; font-size: 14px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next({ status: 404, message: "User not found" });

    const forgotOtp = user?.forgotPasswordOtp;
    if (!forgotOtp || forgotOtp.expired) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    const now = new Date();
    const otpExpirationTime = new Date(
      forgotOtp.createdAt.getTime() + 10 * 60000
    );

    if (now > otpExpirationTime) {
      forgotOtp.expired = true;
      await user.save();
      return next({ status: 400, message: "OTP expired" });
    }

    if (forgotOtp.otp !== otp) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    forgotOtp.verified = true;
    await user.save();

    res.status(200).json({
      message: "Congratulations! OTP verified!",
      secret_key: forgotOtp.secret_key,
    });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const resetPasswordAfterOtp = async (req, res, next) => {
  try {
    const { email, secret_key, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next({ status: 404, message: "User not found" });

    const forgotOtp = user.forgotPasswordOtp;
    if (
      !forgotOtp ||
      forgotOtp?.expired ||
      !forgotOtp.verified ||
      forgotOtp.secret_key !== secret_key
    ) {
      return next({
        status: 400,
        message: "Sorry! Your OTP is not verified",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear the forgotPasswordOtp field
    user.forgotPasswordOtp.expired = true;

    await user.save();

    res.locals.logEvent = {
      eventName: EventTypes.USER_RESET_PASSWORD,
      payload: user,
    };

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return next({ status: 500, message: err.message });
  }
};

const saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save token" });
  }
};

export {
  updateProfile,
  changePassword,
  getUserById,
  verifyPassword,
  addUser,
  loginUser,
  getAllUsers,
  addRfidCardNumber,
  deleteRfidCardNumber,
  getRfidCardNumber,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordAfterOtp,
  saveFcmToken,
};
