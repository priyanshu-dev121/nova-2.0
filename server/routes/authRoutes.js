const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.get('/test', (req, res) => res.json({ message: 'Auth routes are working!' }));
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
