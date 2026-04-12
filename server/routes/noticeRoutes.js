const express = require('express');
const router = express.Router();
const { createNotice, getNotices } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotices)
  .post(protect, createNotice);

module.exports = router;
