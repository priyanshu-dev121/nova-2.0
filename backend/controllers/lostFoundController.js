const LostFound = require('../models/LostFound');
const Claim = require('../models/Claim');

// @desc    Post a lost/found item
// @route   POST /api/lostfound
// @access  Private
const createLostFoundListing = async (req, res) => {
  const { title, description, contactInfo, type, category, location, date } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const item = await LostFound.create({
      title,
      description,
      imageUrl: req.file.path,
      contactInfo,
      type,
      category,
      location,
      date,
      userId: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lost/found items with filtering
// @route   GET /api/lostfound
// @access  Private
const getLostFoundListings = async (req, res) => {
  try {
    const { type, category, search, location } = req.query;
    let query = { status: { $ne: 'resolved' } };

    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostFound.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
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

// @desc    Submit a claim request
// @route   POST /api/lostfound/claim
// @access  Private
const submitClaim = async (req, res) => {
  const { itemId, message } = req.body;
  try {
    const item = await LostFound.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const claim = await Claim.create({
      itemId,
      claimerId: req.user._id,
      message
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get claims for an item (for the poster)
// @route   GET /api/lostfound/claims/:itemId
// @access  Private
const getItemClaims = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.itemId);
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const claims = await Claim.find({ itemId: req.params.itemId }).populate('claimerId', 'name email');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createLostFoundListing, 
  getLostFoundListings, 
  getUserListings,
  submitClaim,
  getItemClaims
};
