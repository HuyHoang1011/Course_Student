const mongoose = require('mongoose');
const Enrollment = require('./models/enrollment.model');
const Submission = require('./models/submission.model');

// MongoDB connection string - adjust if needed
const MONGODB_URI = 'mongodb://localhost:27017/kolp';

async function migrateEnrollmentAttemptedQuizzes() {
  try {
    console.log('Starting migration: Adding attemptedQuizSets to enrollments...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Wait a bit to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all enrollments
    const enrollments = await Enrollment.find({});
    console.log(`Found ${enrollments.length} enrollments to migrate`);
    
    let updatedCount = 0;
    
    for (const enrollment of enrollments) {
      try {
        // Get all submissions for this student in this course
        const submissions = await Submission.find({
          studentId: enrollment.studentId,
          quizId: { $exists: true } // Only submissions with quizId
        }).populate('quizId', 'courseId');
        
        // Filter submissions for this specific course
        const courseSubmissions = submissions.filter(sub => 
          sub.quizId && sub.quizId.courseId.toString() === enrollment.courseId.toString()
        );
        
        // Extract attempted quiz set IDs
        const attemptedQuizSets = [...new Set(courseSubmissions.map(sub => sub.quizSetId))];
        
        // Update enrollment if needed
        if (!enrollment.attemptedQuizSets || enrollment.attemptedQuizSets.length === 0) {
          enrollment.attemptedQuizSets = attemptedQuizSets;
          await enrollment.save();
          updatedCount++;
          console.log(`Updated enrollment for student ${enrollment.studentId} in course ${enrollment.courseId}`);
        }
      } catch (enrollmentError) {
        console.error(`Error processing enrollment ${enrollment._id}:`, enrollmentError.message);
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} enrollments.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run migration
migrateEnrollmentAttemptedQuizzes(); 