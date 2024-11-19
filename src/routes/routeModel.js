import mongoose from 'mongoose';

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
  },
);

const Route = mongoose.model('Route', RouteSchema);
export default Route;
