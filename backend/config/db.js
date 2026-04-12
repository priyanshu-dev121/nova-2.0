const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // Safety check: Clean up quotes or spaces from hosting dashboard
    if (uri) {
      uri = uri.trim().replace(/^["']|["']$/g, '');
      
      // LOGGING FOR DEPLOYMENT DEBUGGING (Masked)
      const prefix = uri.substring(0, 15);
      console.log(`📡 DB Connection Attempt - URI starts with: ${prefix}...`);
    } else {
      console.error('❌ CRITICAL ERROR: MONGODB_URI is undefined in the environment!');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Connection Failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
