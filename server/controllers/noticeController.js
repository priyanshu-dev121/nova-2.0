const Notice = require('../models/Notice');

// Create a new notice
const createNotice = async (req, res) => {
  try {
    const { title, content, target } = req.body;
    const notice = await Notice.create({
      title,
      content,
      target,
      author: req.user._id
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all relative notices
const getNotices = async (req, res) => {
  try {
    let filter = {};
    
    // Non-admins see notices for "All" or their specific role
    if (req.user.role !== 'admin') {
      const userRole = req.user.role === 'faculty' ? 'Faculty' : 'Student';
      filter = { target: { $in: ['All', userRole] } };
    }

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createNotice, getNotices };
