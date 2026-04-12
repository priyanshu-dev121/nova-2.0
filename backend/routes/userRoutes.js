const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePic,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/profile/upload', protect, upload.single('image'), uploadProfilePic);

module.exports = router;
