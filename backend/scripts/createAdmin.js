const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email }).maxTimeMS(5000);
    if (existingAdmin) {
      console.log('\n❌ User with this email already exists');
      process.exit(1);
    }

    // Create admin
    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('\n✅ Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
    rl.close();
    process.exit(1);
  }
};

createAdmin();