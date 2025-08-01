require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./models/quiz.model');
const Submission = require('./models/submission.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kolp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function deleteOldQuizzes() {
    try {
        console.log('🗑️ Deleting all old quizzes...\n');
        
        // Delete all submissions first
        const deletedSubmissions = await Submission.deleteMany({});
        console.log(`🗑️ Deleted ${deletedSubmissions.deletedCount} submissions`);
        
        // Delete all quizzes
        const deletedQuizzes = await Quiz.deleteMany({});
        console.log(`🗑️ Deleted ${deletedQuizzes.deletedCount} quizzes`);
        
        console.log('\n✅ All old quizzes and submissions deleted successfully!');
        console.log('🔄 Now you can create new quizzes with proper format');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

deleteOldQuizzes(); 