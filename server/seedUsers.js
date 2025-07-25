require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

const connectDB = require('./configs/db');

async function seedUsers() {
  try {
    // Connect to database
    await connectDB();
    
    // Check if users already exist
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log('✅ Users already exist in database');
      console.log('Existing users:', existingUsers.map(u => ({ email: u.email, role: u.role })));
      process.exit(0);
    }

    // Create test users
    const testUsers = [
      {
        name: 'Alice Student',
        email: 'alice@student.kolp.vn',
        password: await bcrypt.hash('password123', 10),
        role: 'student'
      },
      {
        name: 'Bob Instructor',
        email: 'bob@instructor.kolp.vn',
        password: await bcrypt.hash('password123', 10),
        role: 'instructor'
      },
      {
        name: 'Admin User',
        email: 'admin@kolp.vn',
        password: await bcrypt.hash('password123', 10),
        role: 'admin'
      }
    ];

    // Insert users
    await User.insertMany(testUsers);
    
    console.log('✅ Test users created successfully!');
    console.log('Test accounts:');
    console.log('- Student: alice@student.kolp.vn / password123');
    console.log('- Instructor: bob@instructor.kolp.vn / password123');
    console.log('- Admin: admin@kolp.vn / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers(); 