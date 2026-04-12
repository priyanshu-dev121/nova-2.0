const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const role = 'student';

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'A verified account with this email already exists. Please login.' });
      } else {
        // User exists but not verified - update details and resend OTP
        existingUser.name = name;
        existingUser.password = password; // Will be hashed by pre-save hook
        await existingUser.save();
        
        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteOne({ email }); // Clear old OTPs
        await OTP.create({ email, otp: otpCode });

        // Send Email
        const message = `Your new Campus Nova verification code is: ${otpCode}. It expires in 10 minutes.`;
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">Campus Nova Verification</h2>
            <p>Welcome back. Please use the following code to continue your verification:</p>
            <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px; margin: 10px 0;">
              ${otpCode}
            </div>
          </div>
        `;

        await sendEmail({ email, subject: 'Campus Nova - Verify Your Account', message, html });
        return res.status(200).json({ message: 'Email already in system. A fresh verification code has been sent.', email });
      }
    }

    // 2. Original Signup Flow for New User
    const user = await User.create({ name, email, password, role });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp: otpCode });

    const message = `Your Campus Nova verification code is: ${otpCode}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Campus Nova Welcome</h2>
        <p>Verify your account with the code below:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; border-radius: 5px;">${otpCode}</div>
      </div>
    `;

    try {
      await sendEmail({ email: user.email, subject: 'Campus Nova - Verification', message, html });
      res.status(201).json({ message: 'Success! Please check your email for the verification code.', email: user.email });
    } catch (err) {
      res.status(201).json({ message: 'Account created, but we had trouble sending the email. Please try logging in to resend.', email: user.email });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already registered. Please try logging in.' });
    }
    res.status(500).json({ message: 'Something went wrong on our end. Please try again later.' });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Email verified successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check for Hardcoded Single Admin (Prioritize over DB)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bbdu.ac.in';
    const adminPass = process.env.ADMIN_PASSWORD || 'adminbbd@1';

    if (email === adminEmail && password === adminPass) {
      return res.json({
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Campus Admin',
        email: adminEmail,
        role: 'admin',
        token: generateToken('65f1a2b3c4d5e6f7a8b9c0d1'),
      });
    }


    // 2. Regular Login (Student & Pre-generated Faculty)
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp: otpCode });

    const message = `Your Campus Nova password reset code is: ${otpCode}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Campus Nova Password Reset</h2>
        <p>Please use the following code to reset your password:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px; margin: 10px 0;">
          ${otpCode}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Campus Nova - Password Reset',
      message,
      html,
    });

    res.json({ message: 'Reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
