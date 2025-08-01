const mongoose = require('mongoose');
const Quiz = require('./models/quiz.model');
const Course = require('./models/course.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kolp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function testCreateQuiz() {
    try {
        console.log('🧪 Testing quiz creation...\n');
        
        // Get first course
        const course = await Course.findOne({});
        if (!course) {
            console.log('❌ No courses found in database');
            return;
        }
        
        console.log('📚 Using course:', course.title, '(ID:', course._id, ')');
        
        // Create test quiz data
        const quizData = {
            courseId: course._id,
            quizSets: [
                {
                    name: 'Test Quiz Set 1',
                    questions: [
                        {
                            text: 'What is 2 + 2?',
                            options: ['3', '4', '5', '6'],
                            answer: '4'
                        },
                        {
                            text: 'What is the capital of France?',
                            options: ['London', 'Berlin', 'Paris', 'Madrid'],
                            answer: 'Paris'
                        }
                    ],
                    isActive: true
                }
            ]
        };
        
        console.log('📝 Creating quiz with data:', JSON.stringify(quizData, null, 2));
        
        // Create quiz
        const quiz = await Quiz.create(quizData);
        console.log('✅ Quiz created successfully!');
        console.log('   Quiz ID:', quiz._id);
        console.log('   Course ID:', quiz.courseId);
        console.log('   Quiz Sets:', quiz.quizSets.length);
        
        // Verify quiz was saved
        const savedQuiz = await Quiz.findById(quiz._id);
        console.log('\n🔍 Verifying saved quiz:');
        console.log('   Found:', !!savedQuiz);
        if (savedQuiz) {
            console.log('   Quiz Sets:', savedQuiz.quizSets.length);
            console.log('   First Set Name:', savedQuiz.quizSets[0]?.name);
            console.log('   Questions in first set:', savedQuiz.quizSets[0]?.questions?.length);
        }
        
        // List all quizzes
        const allQuizzes = await Quiz.find({});
        console.log('\n📊 All quizzes in database:', allQuizzes.length);
        allQuizzes.forEach((q, index) => {
            console.log(`   Quiz ${index + 1}:`);
            console.log(`     ID: ${q._id}`);
            console.log(`     Course ID: ${q.courseId}`);
            console.log(`     Quiz Sets: ${q.quizSets?.length || 0}`);
            console.log(`     Has questions field: ${!!q.questions}`);
            console.log(`     Questions length: ${q.questions?.length || 0}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

testCreateQuiz(); 