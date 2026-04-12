const express = require('express');
const router = express.Router();
const { createNote, getNotes, deleteNote, getFacultyNotesHistory } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(protect, getNotes)
  .post(protect, upload.single('file'), createNote);

router.get('/my-notes', protect, getFacultyNotesHistory);

router.route('/:id')
  .delete(protect, deleteNote);

module.exports = router;
