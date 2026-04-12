const Complaint = require('../models/Complaint');

// @desc    File a complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  const { title, description, category } = req.body;

  try {
    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      description,
      category,
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user complaints
// @route   GET /api/complaints/user
// @access  Private
const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (Admin Only)
// @route   GET /api/complaints/admin
// @access  Private/Admin
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status (Admin Only)
// @route   PATCH /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = req.body.status || complaint.status;
    complaint.actionTaken = req.body.actionTaken !== undefined ? req.body.actionTaken : complaint.actionTaken;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
};
