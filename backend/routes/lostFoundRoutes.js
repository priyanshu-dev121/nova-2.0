const express = require('express');
const router = express.Router();
const { createLostFoundListing, getLostFoundListings, getUserListings } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/').post(protect, upload.single('image'), createLostFoundListing);
router.route('/').get(protect, getLostFoundListings);
router.route('/user').get(protect, getUserListings);

module.exports = router;
