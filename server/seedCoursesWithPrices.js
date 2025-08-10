const mongoose = require('mongoose');
const Course = require('./models/course.model');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course_student_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find an instructor user (create one if none exists)
    let instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('No instructor found, creating one...');
      instructor = await User.create({
        name: 'Sample Instructor',
        email: 'instructor@example.com',
        password: 'password123',
        role: 'instructor'
      });
      console.log('Created instructor:', instructor.email);
    }

    // Create 3 courses with different prices
    const courses = [
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners who want to start their web development journey.',
        price: 3,
        instructorId: instructor._id,
        status: 'active',
        sections: [
          {
            title: 'HTML Basics',
            description: 'Introduction to HTML structure and elements',
            order: 1,
            lessons: [
              {
                title: 'What is HTML?',
                description: 'Understanding HTML and its role in web development',
                type: 'text',
                url: 'https://example.com/html-intro',
                duration: 15,
                order: 1
              },
              {
                title: 'HTML Elements',
                description: 'Common HTML elements and their usage',
                type: 'video',
                url: 'https://example.com/html-elements',
                duration: 25,
                order: 2
              }
            ]
          },
          {
            title: 'CSS Styling',
            description: 'Learn to style your HTML with CSS',
            order: 2,
            lessons: [
              {
                title: 'CSS Introduction',
                description: 'Basic CSS syntax and selectors',
                type: 'video',
                url: 'https://example.com/css-intro',
                duration: 20,
                order: 1
              }
            ]
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500'
      },
      {
        title: 'JavaScript Programming',
        description: 'Master JavaScript programming from basics to advanced concepts. Build interactive web applications.',
        price: 4,
        instructorId: instructor._id,
        status: 'active',
        sections: [
          {
            title: 'JavaScript Basics',
            description: 'Core JavaScript concepts and syntax',
            order: 1,
            lessons: [
              {
                title: 'Variables and Data Types',
                description: 'Understanding JavaScript variables and data types',
                type: 'video',
                url: 'https://example.com/js-variables',
                duration: 30,
                order: 1
              },
              {
                title: 'Functions',
                description: 'Creating and using functions in JavaScript',
                type: 'video',
                url: 'https://example.com/js-functions',
                duration: 35,
                order: 2
              }
            ]
          },
          {
            title: 'DOM Manipulation',
            description: 'Working with the Document Object Model',
            order: 2,
            lessons: [
              {
                title: 'Selecting Elements',
                description: 'How to select and manipulate DOM elements',
                type: 'video',
                url: 'https://example.com/js-dom',
                duration: 25,
                order: 1
              }
            ]
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500'
      },
      {
        title: 'React.js Mastery',
        description: 'Learn React.js framework to build modern, scalable web applications. From components to state management.',
        price: 5,
        instructorId: instructor._id,
        status: 'active',
        sections: [
          {
            title: 'React Fundamentals',
            description: 'Core React concepts and component-based architecture',
            order: 1,
            lessons: [
              {
                title: 'What is React?',
                description: 'Introduction to React and its benefits',
                type: 'video',
                url: 'https://example.com/react-intro',
                duration: 20,
                order: 1
              },
              {
                title: 'Components',
                description: 'Creating and using React components',
                type: 'video',
                url: 'https://example.com/react-components',
                duration: 30,
                order: 2
              }
            ]
          },
          {
            title: 'State Management',
            description: 'Managing component state and props',
            order: 2,
            lessons: [
              {
                title: 'useState Hook',
                description: 'Using React hooks for state management',
                type: 'video',
                url: 'https://example.com/react-usestate',
                duration: 35,
                order: 1
              }
            ]
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500'
      }
    ];

    // Clear existing courses (optional - comment out if you want to keep existing ones)
    // await Course.deleteMany({});
    
    // Insert courses
    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ title: courseData.title });
      
      if (!existingCourse) {
        const course = await Course.create(courseData);
        console.log(`Created course: ${course.title} - $${course.price}`);
      } else {
        console.log(`Course already exists: ${courseData.title}`);
      }
    }

    console.log('Courses seeded successfully!');
    
    // Display all courses with prices
    const allCourses = await Course.find().populate('instructorId', 'name email');
    console.log('\nAll courses in database:');
    allCourses.forEach(course => {
      console.log(`- ${course.title}: $${course.price} (Instructor: ${course.instructorId.name})`);
    });

  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
});
