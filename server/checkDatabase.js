require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/course.model');
const Quiz = require('./models/quiz.model');
const User = require('./models/user.model');
const Enrollment = require('./models/enrollment.model');
const Submission = require('./models/submission.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kolp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function checkDatabase() {
    try {
        console.log('🔍 Checking entire database...\n');
        
        // Check Users
        const users = await User.find({});
        console.log(`👥 Users: ${users.length}`);
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
        // Check Courses
        const courses = await Course.find({});
        console.log(`\n📚 Courses: ${courses.length}`);
        courses.forEach(course => {
            console.log(`   - ${course.title} (ID: ${course._id})`);
            console.log(`     Instructor: ${course.instructorId}`);
            console.log(`     Description: ${course.description?.substring(0, 50)}...`);
        });
        
        // Check Quizzes
        const quizzes = await Quiz.find({});
        console.log(`\n📝 Quizzes: ${quizzes.length}`);
        quizzes.forEach(quiz => {
            console.log(`   - Quiz ID: ${quiz._id}`);
            console.log(`     Course ID: ${quiz.courseId}`);
            console.log(`     Quiz Sets: ${quiz.quizSets?.length || 0}`);
            console.log(`     Has questions field: ${!!quiz.questions}`);
            console.log(`     Questions length: ${quiz.questions?.length || 0}`);
        });
        
        // Check Enrollments
        const enrollments = await Enrollment.find({});
        console.log(`\n📋 Enrollments: ${enrollments.length}`);
        enrollments.forEach(enrollment => {
            console.log(`   - Student: ${enrollment.studentId} | Course: ${enrollment.courseId} | Status: ${enrollment.status}`);
        });
        
        // Check Submissions
        const submissions = await Submission.find({});
        console.log(`\n📊 Submissions: ${submissions.length}`);
        submissions.forEach(submission => {
            console.log(`   - Quiz: ${submission.quizId} | Student: ${submission.studentId} | Score: ${submission.score}`);
        });
        
        // Check database connection
        console.log(`\n🔌 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Connection state: ${mongoose.connection.readyState}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

checkDatabase(); 