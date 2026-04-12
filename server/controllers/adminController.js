const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: { $regex: /^student$/i } });
    const facultyCount = await User.countDocuments({ role: { $regex: /^faculty$/i } });
    const openComplaintsCount = await Complaint.countDocuments({ status: { $ne: 'Resolved' } });
    
    // Get latest 5 active complaints with populated user info
    const recentComplaints = await Complaint.find({ status: { $ne: 'Resolved' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name'); // Fixed population field from 'user' to 'userId'

    res.json({
      stats: {
        students: studentCount,
        faculty: facultyCount,
        complaints: openComplaintsCount
      },
      recentComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (students or faculty)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role && role !== 'All') {
      query.role = { $regex: new RegExp(`^${role}$`, 'i') };
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot be deleted via this portal.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User permanently removed from the system.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats, getAllUsers, deleteUser };
