const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // Safety check: Clean up quotes or spaces if they were accidentally added in the hosting dashboard
    if (uri) {
      uri = uri.trim().replace(/^["']|["']$/g, '');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
