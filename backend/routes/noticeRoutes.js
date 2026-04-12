const express = require('express');
const router = express.Router();
const { createNotice, getNotices, deleteNotice, dismissNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotices)
  .post(protect, createNotice);

router.route('/:id')
  .delete(protect, deleteNotice);

router.route('/:id/dismiss')
  .put(protect, dismissNotice);

module.exports = router;
