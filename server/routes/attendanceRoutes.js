const express = require('express');
const router = express.Router();
const { startSession, markAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.post('/mark', protect, markAttendance);
router.get('/user', protect, getUserAttendance);

module.exports = router;

