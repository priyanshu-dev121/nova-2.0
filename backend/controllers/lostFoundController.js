const LostFound = require('../models/LostFound');

// @desc    Post a lost/found item
// @route   POST /api/lostfound
// @access  Private
const createLostFoundListing = async (req, res) => {
  const { title, description, contactInfo } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const item = await LostFound.create({
      title,
      description,
      imageUrl: req.file.path,
      contactInfo,
      userId: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lost/found items
// @route   GET /api/lostfound
// @access  Private
const getLostFoundListings = async (req, res) => {
  try {
    const items = await LostFound.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's lost/found items
// @route   GET /api/lostfound/user
// @access  Private
const getUserListings = async (req, res) => {
  try {
    const items = await LostFound.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLostFoundListing, getLostFoundListings, getUserListings };
