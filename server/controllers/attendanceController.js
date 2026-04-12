const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');
const crypto = require('crypto');

// Faculty: Start a session & generate QR data
const startSession = async (req, res) => {
  try {
    const { subject, durationMinutes = 10 } = req.body;
    
    // Generate a unique token for the QR
    const qrToken = crypto.randomBytes(16).toString('hex');
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Optional backup OTP

    const session = await AttendanceSession.create({
      faculty: req.user._id,
      subject,
      qrCode: qrToken,
      otp,
      expiresAt: new Date(Date.now() + durationMinutes * 60000)
    });

    res.status(201).json({
      sessionId: session._id,
      qrValue: `CAMPUSNOVA_ATT_${qrToken}`, // The data string encoded in QR
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('QR Generation Server Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Student: Mark attendance via QR Scan
const markAttendance = async (req, res) => {
  try {
    const { qrValue } = req.body;
    const token = qrValue.replace('CAMPUSNOVA_ATT_', '');

    const session = await AttendanceSession.findOne({ 
      qrCode: token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(410).json({ message: 'Session expired or invalid.' });
    }

    if (session.studentsMarked.includes(req.user._id)) {
      return res.status(400).json({ message: 'Attendance already marked.' });
    }

    session.studentsMarked.push(req.user._id);
    await session.save();

    res.json({ message: 'Attendance marked successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: Get their personal attendance stats
const getUserAttendance = async (req, res) => {
  try {
    const totalSessions = await AttendanceSession.countDocuments({});
    const attendedSessions = await AttendanceSession.countDocuments({
      studentsMarked: req.user._id
    });

    const percentage = totalSessions === 0 ? 0 : Math.round((attendedSessions / totalSessions) * 100);

    const records = await AttendanceSession.find({
      studentsMarked: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      percentage,
      count: attendedSessions,
      total: totalSessions,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startSession, markAttendance, getUserAttendance };

