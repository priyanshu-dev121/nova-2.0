require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const { signup } = require('./controllers/authController');
const attendanceRoutes = require('./routes/attendanceRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noteRoutes = require('./routes/noteRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const messRoutes = require('./routes/messRoutes');
const noticeRoutes = require('./routes/noticeRoutes');


const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Apply Routes
console.log('Registering Direct Auth Routes');
app.post('/api/auth/signup', signup);

console.log('Registering Auth Routes at /api/auth');
app.use('/api/auth', authRoutes);

console.log('Registering Attendance Routes at /api/attendance');
app.use('/api/attendance', attendanceRoutes);

console.log('Registering Complaint Routes at /api/complaints');
app.use('/api/complaints', complaintRoutes);

console.log('Registering Note Routes at /api/notes');
app.use('/api/notes', noteRoutes);

console.log('Registering Lost & Found Routes at /api/lostfound');
app.use('/api/lostfound', lostFoundRoutes);

console.log('Registering Mess Routes at /api/mess');
app.use('/api/mess', messRoutes);

console.log('Registering Notice Routes at /api/notices');
app.use('/api/notices', noticeRoutes);


// Base Route
app.get('/', (req, res) => {
  res.send('Campus Nova API is running...');
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - Campus Nova Fully Loaded`);
});
