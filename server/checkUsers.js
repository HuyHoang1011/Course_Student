require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const connectDB = require('./configs/db');

async function checkUsers() {
  try {
    // Connect to database
    await connectDB();
    
    // Get all users
    const users = await User.find().select('-password');
    
    console.log('📊 Users in database:');
    console.log('Total users:', users.length);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    // Check specific test emails
    const testEmails = ['alice@student.kolp.vn', 'bob@instructor.kolp.vn', 'admin@kolp.vn'];
    
    console.log('\n🔍 Checking test emails:');
    for (const email of testEmails) {
      const user = await User.findOne({ email }).select('-password');
      if (user) {
        console.log(`✅ Found: ${email} (${user.role})`);
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

checkUsers(); 