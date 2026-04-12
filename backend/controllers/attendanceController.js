const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');
const crypto = require('crypto');
const Subject = require('../models/Subject'); 
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const Note = require('../models/Note');

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
    const allSessions = await AttendanceSession.find({});
    const attendedSessions = await AttendanceSession.find({
      studentsMarked: req.user._id
    });

    const totalSessionsCount = allSessions.length;
    const attendedSessionsCount = attendedSessions.length;
    const percentage = totalSessionsCount === 0 ? 0 : Math.round((attendedSessionsCount / totalSessionsCount) * 100);

    // Calculate subject-wise breakdown
    const subjectMap = {};
    
    // Initialize all subjects encountered in any session
    allSessions.forEach(session => {
      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = { name: session.subject, total: 0, present: 0 };
      }
      subjectMap[session.subject].total += 1;
    });

    // Count presence for active user
    attendedSessions.forEach(session => {
      if (subjectMap[session.subject]) {
        subjectMap[session.subject].present += 1;
      }
    });

    const subjectStats = Object.values(subjectMap).map(sub => ({
      ...sub,
      percentage: sub.total === 0 ? 0 : Math.round((sub.present / sub.total) * 100),
      code: sub.name.split(' ').map(w => w[0]).join('').toUpperCase() + '101' // Simple fallback code
    }));

    res.json({
      percentage,
      count: attendedSessionsCount,
      total: totalSessionsCount,
      records: attendedSessions.sort((a, b) => b.createdAt - a.createdAt),
      subjects: subjectStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty: Get overall stats for dashboard
const getFacultyStats = async (req, res) => {
  try {
    const totalSessions = await AttendanceSession.countDocuments({ faculty: req.user._id });
    const totalNotes = await Note.countDocuments({ faculty: req.user._id });
    
    // Calculate average attendance rate
    const sessions = await AttendanceSession.find({ faculty: req.user._id });
    let totalAttendance = 0;
    sessions.forEach(s => {
      totalAttendance += s.studentsMarked.length;
    });
    
    const avgAttendance = totalSessions === 0 ? 0 : Math.round(totalAttendance / totalSessions);

    res.json({
      classesCount: totalSessions,
      notesCount: totalNotes,
      avgAttendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty: Get detailed history of sessions
const getFacultyHistory = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ faculty: req.user._id })
      .sort({ createdAt: -1 });
    
    const history = sessions.map(s => ({
      id: s._id,
      subject: s.subject,
      count: s.studentsMarked.length,
      date: s.createdAt,
      otp: s.otp
    }));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subjects for the dropdown (STATIC SEED - FAILSAFE)
const getSubjects = async (req, res) => {
  try {
    const curriculum = [
      { id: 'sub1', name: 'Differential Equations and Fourier Analysis', code: 'NBS4201' },
      { id: 'sub2', name: 'Programming Concepts with Python', code: 'NCS4201' },
      { id: 'sub3', name: 'Basic Electrical Engineering', code: 'NEE4201' },
      { id: 'sub4', name: 'Engineering Chemistry', code: 'NBS4203' },
      { id: 'sub5', name: 'Basics of Artificial Intelligence', code: 'NCS4202' },
      { id: 'sub6', name: 'Communicative English', code: 'NHSCC1201' },
      { id: 'sub7', name: 'Python Programming Lab', code: 'NCS4251' },
      { id: 'sub8', name: 'Basic Electrical Engineering Lab', code: 'NEE4251' },
      { id: 'sub9', name: 'Engineering Chemistry Lab', code: 'NBS4253' }
    ];

    // Simply return the official curriculum directly to ensure 100% uptime
    res.json(curriculum);
  } catch (error) {
    console.error('Subject Fetch Static Error:', error);
    res.status(500).json({ message: 'Failed to load courses' });
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

module.exports = { 
  startSession, 
  markAttendance, 
  getUserAttendance, 
  getSubjects, 
  getSessionStatus, 
  getActiveSession,
  getFacultyStats,
  getFacultyHistory
};


