const mongoose = require('mongoose');

const attendanceSessionSchema = mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    otp: { type: String, required: true }, // For verification if needed
    qrCode: { type: String, required: true }, // Unique string for QR
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    studentsMarked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
