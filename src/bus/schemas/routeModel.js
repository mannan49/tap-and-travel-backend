import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema(
  {
    startCity: {
      type: String,
      required: true,
    },
    endCity: {
      type: String,
      required: true,
    },
    startTerminals: [
      {
        name: {
          type: String,
          required: true,
        },
        locationLink: {
          type: String,
          required: true,
        },
      },
    ],
    endTerminals: [
      {
        name: {
          type: String,
          required: true,
        },
        locationLink: {
          type: String,
          required: true,
        },
      },
    ],
    stops: [
      {
        name: {
          type: String,
          required: true,
        },
        locationLink: {
          type: String,
          required: true,
        },
        timeDuration: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.model("Route", RouteSchema);
export default Route;
