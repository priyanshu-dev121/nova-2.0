const mongoose = require('mongoose');

const messSchema = mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    breakfast: {
      type: String,
      required: true,
    },
    lunch: {
      type: String,
      required: true,
    },
    dinner: {
      type: String,
      required: true,
    },
    timings: {
      breakfast: { type: String, default: '08:00 AM - 09:30 AM' },
      lunch: { type: String, default: '12:30 PM - 02:00 PM' },
      snacks: { type: String, default: '05:00 PM - 06:00 PM' },
      dinner: { type: String, default: '08:00 PM - 09:30 PM' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mess', messSchema);
