const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');
const crypto = require('crypto');
const Subject = require('../models/Subject'); 
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');

// Helper to calculate distance in meters (Haversine Formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
};

const startSession = async (req, res) => {
  try {
    const { subject, durationMinutes = 2, latitude, longitude } = req.body; // Default reduced to 2 min
    
    // Generate a unique token for the QR
    const qrToken = crypto.randomBytes(16).toString('hex');
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit Manual Code

    const session = await AttendanceSession.create({
      faculty: req.user._id,
      subject,
      qrCode: qrToken,
      otp,
      expiresAt: new Date(Date.now() + durationMinutes * 60000),
      location: { latitude, longitude }
    });

    // Automatically "PUSH" to students via Campus Notices
    await Notice.create({
      title: `🚨 ATTENDANCE LIVE: ${subject}`,
      content: `A ${durationMinutes}-minute window is OPEN. Use Code [${otp}] or Scan Teacher's QR!`,
      author: req.user._id,
      target: 'Student'
    });

    res.status(201).json({
      sessionId: session._id,
      qrValue: `CAMPUSNOVA_ATT_${qrToken}`, // The data string encoded in QR
      manualCode: otp,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('QR Generation Server Error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Student: Mark attendance via QR Scan or Manual Code
const markAttendance = async (req, res) => {
  try {
    const { qrValue, manualCode, latitude, longitude } = req.body;
    let query = {
      isActive: true,
      expiresAt: { $gt: new Date() }
    };

    if (qrValue) {
      const token = qrValue.replace('CAMPUSNOVA_ATT_', '');
      query.qrCode = token;
    } else if (manualCode) {
      query.otp = manualCode;
    } else {
      return res.status(400).json({ message: 'No scan data or manual code provided.' });
    }

    const session = await AttendanceSession.findOne(query);

    if (!session) {
      return res.status(410).json({ message: 'Session expired or invalid code.' });
    }

    // Proxy Prevention Check
    if (session.location?.latitude && latitude) {
      const distance = getDistance(
        session.location.latitude, 
        session.location.longitude,
        latitude,
        longitude
      );
      
      // If distance > 20 meters, reject
      if (distance > 20) {
        return res.status(403).json({ 
          message: `Location mismatch! You are ${Math.round(distance)}m away. You must be in the classroom.`,
          distance: Math.round(distance)
        });
      }
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

// Get subjects for the dropdown (with auto-seed for demo)
const getSubjects = async (req, res) => {
  try {
    let subjects = await Subject.find({});
    
    if (subjects.length === 0) {
      const demoSubjects = [
        { name: 'Data Structures & Algorithms', code: 'CS201' },
        { name: 'Software Engineering', code: 'CS302' },
        { name: 'Computer Networks', code: 'CS204' },
        { name: 'Logic Design & Circuits', code: 'EE101' },
        { name: 'Microprocessors', code: 'EC305' }
      ];
      subjects = await Subject.insertMany(demoSubjects);
    }
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty: Get current session check-in count
const getSessionStatus = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('studentsMarked', 'name email');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({
      count: session.studentsMarked.length,
      students: session.studentsMarked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get any currently active session
const getActiveSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).select('subject expiresAt otp');
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startSession, markAttendance, getUserAttendance, getSubjects, getSessionStatus, getActiveSession };


