import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Admin ID is required."],
  },
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
});

const Route = mongoose.model("Route", RouteSchema);
export default Route;
