require('dotenv').config();
const mongoose = require('mongoose');
const { 
  recalcQuizStatsForAllCourses, 
  getQuizStatsSummary, 
  validateQuizStatsConsistency 
} = require('../utils/quizStatsUtil');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Main migration function
async function migrateQuizStats() {
  try {
    console.log('🚀 Starting Quiz Stats Migration...\n');
    
    // Step 1: Validate current state
    console.log('📊 Step 1: Validating current quiz stats...');
    const validation = await validateQuizStatsConsistency();
    console.log(`Found ${validation.inconsistenciesCount} inconsistencies out of ${validation.totalCourses} courses\n`);
    
    if (validation.inconsistenciesCount > 0) {
      console.log('🔍 Inconsistencies found:');
      validation.inconsistencies.forEach((inc, index) => {
        console.log(`${index + 1}. ${inc.courseTitle}`);
        console.log(`   Stored: ${inc.stored.quizCount} quizzes, ${inc.stored.totalQuestions} questions`);
        console.log(`   Actual: ${inc.actual.quizCount} quizzes, ${inc.actual.totalQuestions} questions\n`);
      });
    }
    
    // Step 2: Recalculate all quiz stats
    console.log('🔄 Step 2: Recalculating quiz stats for all courses...');
    const results = await recalcQuizStatsForAllCourses();
    console.log(`\n✅ Recalculation completed!`);
    console.log(`📊 Results: ${results.successCount} successful, ${results.errorCount} errors\n`);
    
    // Step 3: Validate again
    console.log('🔍 Step 3: Validating quiz stats after migration...');
    const finalValidation = await validateQuizStatsConsistency();
    console.log(`Final validation: ${finalValidation.inconsistenciesCount} inconsistencies remaining\n`);
    
    // Step 4: Show summary
    console.log('📈 Step 4: Final quiz statistics summary...');
    const summary = await getQuizStatsSummary();
    console.log('📊 Quiz Statistics Summary:');
    console.log(`   Total Courses: ${summary.totalCourses}`);
    console.log(`   Courses with Quizzes: ${summary.coursesWithQuizzes}`);
    console.log(`   Total Quizzes: ${summary.totalQuizCount}`);
    console.log(`   Total Questions: ${summary.totalQuestions}`);
    console.log(`   Avg Quizzes per Course: ${summary.avgQuizzesPerCourse.toFixed(2)}`);
    console.log(`   Avg Questions per Course: ${summary.avgQuestionsPerCourse.toFixed(2)}\n`);
    
    // Step 5: Show detailed results
    if (results.results.length > 0) {
      console.log('📋 Detailed Results:');
      results.results.forEach((result, index) => {
        if (result.status === 'success') {
          console.log(`${index + 1}. ✅ ${result.courseTitle}: ${result.quizCount} quizzes, ${result.totalQuestions} questions`);
        } else {
          console.log(`${index + 1}. ❌ ${result.courseTitle}: ${result.error}`);
        }
      });
    }
    
    console.log('\n🎉 Quiz Stats Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  connectDB().then(migrateQuizStats);
}

module.exports = { migrateQuizStats };
