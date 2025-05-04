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
      formattedAddress: {
        type: String,
      },
      placeId: {
        type: String,
      },
      geometry: {
        location: {
          lat: Number,
          lng: Number,
        },
        viewport: {
          northeast: {
            lat: Number,
            lng: Number,
          },
          southwest: {
            lat: Number,
            lng: Number,
          },
        },
      },
      locationLink: {
        type: String,
      },
      duration: {
        type: Number,
        default: 0,
      },
    },
  ],
});

const Route = mongoose.model("Route", RouteSchema);
export default Route;
