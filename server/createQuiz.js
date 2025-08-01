const mongoose = require('mongoose');
require('dotenv').config();

async function createQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const Course = require('./models/course.model');
    const Quiz = require('./models/quiz.model');
    
    // Find the Advanced JavaScript Programming course
    const course = await Course.findOne({ title: "Advanced JavaScript Programming" });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    console.log(`📚 Found course: ${course.title} (ID: ${course._id})`);
    
    // Check if quiz already exists
    const existingQuiz = await Quiz.findOne({ courseId: course._id });
    if (existingQuiz) {
      console.log('⚠️ Quiz already exists for this course');
      return;
    }
    
    // Create sample quiz questions
    const quizQuestions = [
      {
        text: "What is the difference between 'let' and 'const' in ES6?",
        options: [
          "let is block-scoped, const is function-scoped",
          "let can be reassigned, const cannot be reassigned",
          "const is block-scoped, let is function-scoped",
          "There is no difference"
        ],
        answer: "let can be reassigned, const cannot be reassigned"
      },
      {
        text: "What does the 'async/await' syntax do in JavaScript?",
        options: [
          "It makes code run faster",
          "It provides a way to handle asynchronous operations more cleanly",
          "It prevents errors from occurring",
          "It makes code more readable but doesn't change functionality"
        ],
        answer: "It provides a way to handle asynchronous operations more cleanly"
      },
      {
        text: "What is a closure in JavaScript?",
        options: [
          "A function that has access to variables in its outer scope",
          "A way to close browser windows",
          "A method to end loops early",
          "A type of JavaScript object"
        ],
        answer: "A function that has access to variables in its outer scope"
      },
      {
        text: "What is the purpose of the 'this' keyword in JavaScript?",
        options: [
          "It always refers to the global object",
          "It refers to the current function",
          "It refers to the object that is currently executing the code",
          "It refers to the parent object"
        ],
        answer: "It refers to the object that is currently executing the code"
      },
      {
        text: "What is the difference between '==' and '===' in JavaScript?",
        options: [
          "There is no difference",
          "== checks value and type, === checks only value",
          "== checks only value, === checks value and type",
          "== is faster than ==="
        ],
        answer: "== checks only value, === checks value and type"
      }
    ];
    
    // Create the quiz
    const quiz = await Quiz.create({
      courseId: course._id,
      questions: quizQuestions
    });
    
    console.log(`✅ Quiz created successfully!`);
    console.log(`📝 Quiz ID: ${quiz._id}`);
    console.log(`❓ Questions: ${quiz.questions.length}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createQuiz(); 