const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createComplaint);
router.route('/user').get(protect, getUserComplaints);
router.route('/admin').get(protect, admin, getAllComplaints);
router.route('/:id').patch(protect, admin, updateComplaintStatus);

module.exports = router;
