const User = require('../models/User');

// Simple async handler to avoid external dependency issues
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      section: user.section,
      year: user.year,
      department: user.department,
      bio: user.bio,
      github: user.github,
      linkedIn: user.linkedIn,
      profilePic: user.profilePic,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.section = req.body.section || user.section;
    user.year = req.body.year || user.year;
    user.department = req.body.department || user.department;
    user.bio = req.body.bio || user.bio;
    user.github = req.body.github || user.github;
    user.linkedIn = req.body.linkedIn || user.linkedIn;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      section: updatedUser.section,
      year: updatedUser.year,
      department: updatedUser.department,
      bio: updatedUser.bio,
      github: updatedUser.github,
      linkedIn: updatedUser.linkedIn,
      profilePic: updatedUser.profilePic,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Upload profile picture
// @route   POST /api/users/profile/upload
// @access  Private
const uploadProfilePic = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    user.profilePic = req.file.path; // Cloudinary secure URL
    await user.save();

    res.json({
      _id: user._id,
      profilePic: user.profilePic,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePic,
};
