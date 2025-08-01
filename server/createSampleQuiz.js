const mongoose = require('mongoose');
const Quiz = require('./models/quiz.model');
const Course = require('./models/course.model');

// MongoDB connection string - adjust if needed
const MONGODB_URI = 'mongodb://localhost:27017/kolp';

async function createSampleQuiz() {
  try {
    console.log('Creating sample quiz...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Wait a bit to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get first course
    const course = await Course.findOne();
    if (!course) {
      console.log('No course found. Please create a course first.');
      return;
    }
    
    console.log('Found course:', course.title);
    
    // Create sample quiz
    const sampleQuiz = new Quiz({
      courseId: course._id,
      quizSets: [
        {
          name: 'Quiz Set 1 - Introduction',
          questions: [
            {
              text: 'What is the main purpose of this course?',
              options: ['To learn programming', 'To understand concepts', 'To pass exams', 'All of the above'],
              answer: 'All of the above'
            },
            {
              text: 'How many modules are in this course?',
              options: ['3', '5', '7', '10'],
              answer: '5'
            }
          ],
          isActive: true
        },
        {
          name: 'Quiz Set 2 - Advanced',
          questions: [
            {
              text: 'Which programming language is used in this course?',
              options: ['JavaScript', 'Python', 'Java', 'C++'],
              answer: 'JavaScript'
            },
            {
              text: 'What is the passing score for quizzes?',
              options: ['50%', '60%', '70%', '80%'],
              answer: '60%'
            }
          ],
          isActive: true
        }
      ]
    });
    
    await sampleQuiz.save();
    console.log('Sample quiz created successfully!');
    console.log('Quiz ID:', sampleQuiz._id);
    console.log('Course ID:', course._id);
    
  } catch (error) {
    console.error('Failed to create sample quiz:', error);
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

createSampleQuiz(); 