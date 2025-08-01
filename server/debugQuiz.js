const mongoose = require('mongoose');
const Quiz = require('./models/quiz.model');
const Course = require('./models/course.model');
const Submission = require('./models/submission.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kolp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function cleanupOldData() {
    try {
        console.log('🧹 Cleaning up old quiz data...\n');
        
        // Find all quizzes with old format (has questions field but no quizSets)
        const oldQuizzes = await Quiz.find({
            questions: { $exists: true, $ne: [] },
            $or: [
                { quizSets: { $exists: false } },
                { quizSets: { $size: 0 } }
            ]
        });
        
        console.log(`📝 Found ${oldQuizzes.length} old format quizzes to delete:`);
        oldQuizzes.forEach(quiz => {
            console.log(`   - Quiz ID: ${quiz._id}`);
            console.log(`     Course ID: ${quiz.courseId}`);
            console.log(`     Questions: ${quiz.questions?.length || 0}`);
        });
        
        if (oldQuizzes.length > 0) {
            // Get quiz IDs to delete
            const quizIds = oldQuizzes.map(quiz => quiz._id);
            
            // Delete old submissions first
            const deletedSubmissions = await Submission.deleteMany({
                quizId: { $in: quizIds }
            });
            console.log(`\n🗑️ Deleted ${deletedSubmissions.deletedCount} old submissions`);
            
            // Delete old quizzes
            const deletedQuizzes = await Quiz.deleteMany({
                _id: { $in: quizIds }
            });
            console.log(`🗑️ Deleted ${deletedQuizzes.deletedCount} old quizzes`);
            
            console.log('\n✅ Cleanup completed successfully!');
        } else {
            console.log('\n✅ No old format quizzes found. Database is clean!');
        }
        
        // Show remaining data
        const remainingQuizzes = await Quiz.find({});
        console.log(`\n📊 Remaining quizzes: ${remainingQuizzes.length}`);
        remainingQuizzes.forEach(quiz => {
            console.log(`   - Quiz ID: ${quiz._id}`);
            console.log(`     Course ID: ${quiz.courseId}`);
            console.log(`     Has quizSets: ${!!quiz.quizSets}`);
            console.log(`     Has questions: ${!!quiz.questions}`);
            console.log(`     quizSets length: ${quiz.quizSets?.length || 0}`);
            console.log(`     questions length: ${quiz.questions?.length || 0}`);
        });
        
        const remainingSubmissions = await Submission.find({});
        console.log(`\n📊 Remaining submissions: ${remainingSubmissions.length}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

cleanupOldData(); 