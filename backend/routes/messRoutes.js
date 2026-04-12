const express = require('express');
const router = express.Router();
const { getMessMenu, updateMessMenu, seedMessMenu } = require('../controllers/messController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMessMenu);
router.route('/:id').put(protect, admin, updateMessMenu);
router.route('/seed').post(protect, admin, seedMessMenu);

module.exports = router;
