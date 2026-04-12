const express = require('express');
const router = express.Router();
const { 
  startSession, 
  markAttendance, 
  getUserAttendance, 
  getSubjects, 
  getSessionStatus,
  getActiveSession,
  getFacultyStats,
  getFacultyHistory
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.post('/mark', protect, markAttendance);
router.get('/user', protect, getUserAttendance);
router.get('/subjects', protect, getSubjects);
router.get('/session/:id', protect, getSessionStatus);
router.get('/active-session', protect, getActiveSession);
router.get('/stats', protect, getFacultyStats);
router.get('/history', protect, getFacultyHistory);

module.exports = router;


