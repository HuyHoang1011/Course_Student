const mongoose = require('mongoose');
require('dotenv').config();

async function approveCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const Course = require('./models/course.model');
    
    // Find and approve the Advanced JavaScript Programming course
    const course = await Course.findOneAndUpdate(
      { title: "Advanced JavaScript Programming" },
      { 
        status: 'active',
        adminNote: 'Approved for testing quiz functionality',
        reviewedAt: new Date()
      },
      { new: true }
    );
    
    if (course) {
      console.log(`✅ Course approved: ${course.title}`);
      console.log(`📊 Status: ${course.status}`);
    } else {
      console.log('❌ Course not found');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

approveCourse(); 