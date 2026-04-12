const Note = require('../models/Note');

// Create a note
const createNote = async (req, res) => {
  try {
    const { title, subject, isOfficial } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resource file' });
    }

    const note = await Note.create({
      title,
      subject,
      fileUrl: req.file.path, // req.file.path contains the Cloudinary URL from multer-storage-cloudinary
      faculty: req.user._id,
      isOfficial: isOfficial === 'true' || isOfficial === true // Support both string (form-data) and boolean
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate('faculty', 'name');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // In a real app, you might also delete the file from cloud storage (S3/Cloudinary)
    // For now, we delete the database entry
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notes for current faculty
const getFacultyNotesHistory = async (req, res) => {
  try {
    const notes = await Note.find({ faculty: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNote, getNotes, deleteNote, getFacultyNotesHistory };
