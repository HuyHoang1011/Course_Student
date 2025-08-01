const mongoose = require('mongoose');
const Quiz = require('./models/quiz.model');
const Course = require('./models/course.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kolp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function checkQuizData() {
    try {
        console.log('🔍 Checking quiz data in database...\n');

        // Get all quizzes
        const quizzes = await Quiz.find({}).populate('courseId', 'title');
        console.log(`📊 Total quizzes found: ${quizzes.length}\n`);

        if (quizzes.length === 0) {
            console.log('❌ No quizzes found in database');
            return;
        }

        // Check each quiz
        for (let i = 0; i < quizzes.length; i++) {
            const quiz = quizzes[i];
            console.log(`\n📝 Quiz ${i + 1}:`);
            console.log(`   ID: ${quiz._id}`);
            console.log(`   Course: ${quiz.courseId?.title || 'Unknown'}`);
            console.log(`   Course ID: ${quiz.courseId}`);
            console.log(`   Quiz Sets Count: ${quiz.quizSets?.length || 0}`);
            
            if (quiz.quizSets && quiz.quizSets.length > 0) {
                console.log(`   Quiz Sets Details:`);
                quiz.quizSets.forEach((set, index) => {
                    console.log(`     Set ${index + 1}:`);
                    console.log(`       ID: ${set._id}`);
                    console.log(`       Name: ${set.name}`);
                    console.log(`       isActive: ${set.isActive}`);
                    console.log(`       Questions Count: ${set.questions?.length || 0}`);
                    if (set.questions && set.questions.length > 0) {
                        console.log(`       First Question: ${set.questions[0].text}`);
                    }
                });
            } else {
                console.log(`   ❌ No quiz sets found`);
            }
        }

        // Check courses without quizzes
        const courses = await Course.find({});
        const coursesWithQuizzes = quizzes.map(q => q.courseId?.toString());
        const coursesWithoutQuizzes = courses.filter(c => !coursesWithQuizzes.includes(c._id.toString()));
        
        console.log(`\n📚 Courses without quizzes: ${coursesWithoutQuizzes.length}`);
        coursesWithoutQuizzes.forEach(course => {
            console.log(`   - ${course.title} (ID: ${course._id})`);
        });

    } catch (error) {
        console.error('❌ Error checking quiz data:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkQuizData(); 