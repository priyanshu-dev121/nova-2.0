const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    const mongoose = require('mongoose');
    
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = req.file.path; 
    }

    const finalDate = (eventDate && eventDate !== '') ? new Date(eventDate) : new Date();

    // Ensure the ID is a valid Mongoose ObjectId for the DB
    const createdById = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? new mongoose.Types.ObjectId(req.user._id) 
      : req.user._id;

    const event = await Event.create({
      title,
      description,
      eventDate: finalDate,
      imageUrl,
      createdBy: createdById
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Critical Event Creation Error:', error);
    res.status(500).json({ 
      message: 'Failed to publish event', 
      detail: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 }).populate('createdBy', 'name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event permanently removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, deleteEvent };
