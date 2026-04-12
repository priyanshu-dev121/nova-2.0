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
    const { role } = req.user;
    let filter = {};

    // Admins see everything. Students and Faculty see "All" + their specific role.
    if (role !== 'admin') {
      // Normalize role to match the Notice model's capitalize enum ['All', 'Student', 'Faculty']
      const targetRole = role.charAt(0).toUpperCase() + role.slice(1);
      
      filter = { 
        target: { 
          $in: ['All', targetRole] 
        } 
      };
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

