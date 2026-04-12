const Note = require('../models/Note');

// Create a note
const createNote = async (req, res) => {
  try {
    const { title, subject, fileUrl } = req.body;
    const note = await Note.create({
      title,
      subject,
      fileUrl,
      faculty: req.user._id
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

module.exports = { createNote, getNotes };
