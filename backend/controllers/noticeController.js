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
      // Robust normalization: trim and capitalize first letter
      const normalizedRole = role.toLowerCase().trim();
      const targetRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
      
      filter = { 
        target: { 
          $in: ['All', targetRole] 
        },
        dismissedBy: { $ne: req.user._id }
      };
    } else {
      filter = { dismissedBy: { $ne: req.user._id } };
    }

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notice
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Only author or admin can delete
    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await notice.deleteOne();
    res.json({ message: 'Notice removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dismiss a notice (per-user hidden)
const dismissNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { dismissedBy: req.user._id } },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json({ message: 'Notice dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotice, getNotices, deleteNotice, dismissNotice };

