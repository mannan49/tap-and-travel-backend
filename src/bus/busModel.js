import mongoose from 'mongoose';

const BusSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  startLocation: {
    type: String,
    required: true,
  },
  endLocation: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):?([0-5]\d)$/.test(v), // Validate HH:mm format
      message: (props) => `${props.value} is not a valid time!`,
    },
  },
  arrivalTime: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):?([0-5]\d)$/.test(v), // Validate HH:mm format
      message: (props) => `${props.value} is not a valid time!`,
    },
  },
  date: {
    type: Date,
    required: true,
  },
  busCapacity: {
    type: Number,
    required: true,
  },
  busDetails: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true, // Automatically create createdAt and updatedAt fields
});

const Bus = mongoose.model('Bus', BusSchema);
export default Bus;
