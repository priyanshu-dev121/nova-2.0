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
    console.log('Fetching notices for role:', role);
    
    // TEMPORARILY REMOVE FILTER TO DEBUG
    const notices = await Notice.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    
    console.log(`Found ${notices.length} notices total.`);
    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: error.message });
  }
};




module.exports = { createNotice, getNotices };
