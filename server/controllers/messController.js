const Mess = require('../models/Mess');

// @desc    Get Mess menu
// @route   GET /api/mess
// @access  Private
const getMessMenu = async (req, res) => {
  try {
    const menu = await Mess.find({});
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Mess menu (Admin Only)
// @route   PUT /api/mess/:id
// @access  Private/Admin
const updateMessMenu = async (req, res) => {
  try {
    const { breakfast, lunch, dinner, timings } = req.body;
    const item = await Mess.findById(req.params.id);
    
    if (item) {
      item.breakfast = breakfast || item.breakfast;
      item.lunch = lunch || item.lunch;
      item.dinner = dinner || item.dinner;
      item.timings = timings || item.timings;
      
      const updatedMenu = await item.save();
      res.json(updatedMenu);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed initial menu
// @route   POST /api/mess/seed
// @access  Private/Admin
const seedMessMenu = async (req, res) => {
  const initialMenu = [
    { day: 'Monday', breakfast: 'Poha, Milk', lunch: 'Rajma Chawal, Salad', dinner: 'Mix Veg, Roti, Dal' },
    { day: 'Tuesday', breakfast: 'Aloo Paratha, Curd', lunch: 'Kadi Chawal, Papad', dinner: 'Paneer Butter Masala, Roti' },
    { day: 'Wednesday', breakfast: 'Sandwich, Tea', lunch: 'Veg Pulao, Raita', dinner: 'Egg Curry / Mushroom, Roti' },
    { day: 'Thursday', breakfast: 'Idli Sambhar', lunch: 'Chole Bhature', dinner: 'Dal Tadka, Sabzi, Rice' },
    { day: 'Friday', breakfast: 'Pasta, Coffee', lunch: 'Dal Makhani, Jeera Rice', dinner: 'Kofta Curry, Roti' },
    { day: 'Saturday', breakfast: 'Upma, Tea', lunch: 'Aloo Gobhi, Rice, Dal', dinner: 'Special Thali' },
    { day: 'Sunday', breakfast: 'Chole Puri', lunch: 'Veg Biryani', dinner: 'Yellow Dal, Seasonal Veg' },
  ];

  try {
    const count = await Mess.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Menu already seeded' });
    
    await Mess.insertMany(initialMenu);
    res.status(201).json({ message: 'Menu seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessMenu, updateMessMenu, seedMessMenu };
