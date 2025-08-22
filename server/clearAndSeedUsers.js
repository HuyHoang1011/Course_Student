const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course_student_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ All existing users cleared');
    
    console.log('🔧 Creating new test users...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users with different roles
    const testUsers = [
      {
        name: 'Alice Student',
        email: 'alice@student.kolp.vn',
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Bob Instructor',
        email: 'bob@instructor.kolp.vn',
        password: hashedPassword,
        role: 'instructor'
      },
      {
        name: 'Admin User',
        email: 'admin@kolp.vn',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'John Student',
        email: 'john@student.kolp.vn',
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Sarah Instructor',
        email: 'sarah@instructor.kolp.vn',
        password: hashedPassword,
        role: 'instructor'
      },
      {
        name: 'Manager Admin',
        email: 'manager@kolp.vn',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Test Student',
        email: 'test@student.kolp.vn',
        password: hashedPassword,
        role: 'student'
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(testUsers);
    
    console.log('✅ Test users created successfully:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
    console.log('\n🔑 Login credentials for all users:');
    console.log('   Email: [any email from above]');
    console.log('   Password: password123');
    console.log('\n🚀 You can now test the login functionality with different roles!');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
});
