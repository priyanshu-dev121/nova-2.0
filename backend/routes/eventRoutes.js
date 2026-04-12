const express = require('express');
const router = express.Router();
const { createEvent, getEvents, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(protect, getEvents)
  .post(protect, admin, upload.single('image'), createEvent);

router.route('/:id')
  .delete(protect, admin, deleteEvent);

module.exports = router;

