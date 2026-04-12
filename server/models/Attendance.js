const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same user on the same date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
