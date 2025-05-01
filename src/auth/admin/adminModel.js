import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    adminId: {
      type: Number,
      unique: true,
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: true,
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
    company: {
      type: String,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "driver"],
      default: "admin",
    },
    cnicNumber: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.adminId) {
    const lastAdmin = await mongoose
      .model("Admin")
      .findOne()
      .sort({ adminId: -1 });
    this.adminId = lastAdmin ? lastAdmin.adminId + 1 : 1;
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
