const express = require('express');
const router = express.Router();
const { 
  createLostFoundListing, 
  getLostFoundListings, 
  getUserListings,
  submitClaim,
  getItemClaims
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .post(protect, upload.single('image'), createLostFoundListing)
  .get(protect, getLostFoundListings);

router.route('/user').get(protect, getUserListings);
router.route('/claim').post(protect, submitClaim);
router.route('/claims/:itemId').get(protect, getItemClaims);

module.exports = router;
