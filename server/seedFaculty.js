const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const facultyAccounts = [
  { name: 'Dr. Faculty One', email: 'faculty1@bbdu.ac.in', password: 'facultybbd@123', role: 'faculty', isVerified: true },
  { name: 'Prof. Faculty Two', email: 'faculty2@bbdu.ac.in', password: 'facultybbd@123', role: 'faculty', isVerified: true },
  { name: 'Dr. Faculty Three', email: 'faculty3@bbdu.ac.in', password: 'facultybbd@123', role: 'faculty', isVerified: true },
  { name: 'Prof. Faculty Four', email: 'faculty4@bbdu.ac.in', password: 'facultybbd@123', role: 'faculty', isVerified: true },
  { name: 'Dr. Faculty Five', email: 'faculty5@bbdu.ac.in', password: 'facultybbd@123', role: 'faculty', isVerified: true },
];

const seedFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const account of facultyAccounts) {
      const userExists = await User.findOne({ email: account.email });
      if (!userExists) {
        await User.create(account);
        console.log(`Created faculty account: ${account.email}`);
      } else {
        console.log(`Faculty account already exists: ${account.email}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding faculty:', error);
    process.exit(1);
  }
};

seedFaculty();
