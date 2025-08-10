const mongoose = require('mongoose');
const Course = require('./models/course.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course_student_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Use the existing instructor ID from your course
    const existingInstructorId = '686b4ab04ab394f43f91674f';
    
    // Create 3 courses matching your existing structure
    const courses = [
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners who want to start their web development journey.',
        instructorId: existingInstructorId,
        content: [
          {
            type: 'video',
            url: 'https://example.com/html-intro',
            title: 'HTML Basics',
            description: 'Introduction to HTML structure and elements'
          },
          {
            type: 'video',
            url: 'https://example.com/css-intro',
            title: 'CSS Styling',
            description: 'Learn to style your HTML with CSS'
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500',
        status: 'active',
        adminNote: 'Approved for student enrollment',
        reviewedAt: new Date(),
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
        ]
      },
      {
        title: 'React.js Mastery',
        description: 'Learn React.js framework to build modern, scalable web applications. From components to state management.',
        instructorId: existingInstructorId,
        content: [
          {
            type: 'video',
            url: 'https://example.com/react-intro',
            title: 'React Fundamentals',
            description: 'Core React concepts and component-based architecture'
          },
          {
            type: 'video',
            url: 'https://example.com/react-hooks',
            title: 'React Hooks',
            description: 'Modern React with hooks for state management'
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
        status: 'active',
        adminNote: 'Approved for student enrollment',
        reviewedAt: new Date(),
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
        ]
      },
      {
        title: 'Node.js Backend Development',
        description: 'Master Node.js to build robust backend APIs and server-side applications with Express.js and MongoDB.',
        instructorId: existingInstructorId,
        content: [
          {
            type: 'video',
            url: 'https://example.com/node-intro',
            title: 'Node.js Basics',
            description: 'Introduction to Node.js runtime environment'
          },
          {
            type: 'video',
            url: 'https://example.com/express-api',
            title: 'Express.js API',
            description: 'Building RESTful APIs with Express.js'
          }
        ],
        imageIntroduction: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
        status: 'active',
        adminNote: 'Approved for student enrollment',
        reviewedAt: new Date(),
        sections: [
          {
            title: 'Node.js Fundamentals',
            description: 'Core Node.js concepts and runtime environment',
            order: 1,
            lessons: [
              {
                title: 'What is Node.js?',
                description: 'Understanding Node.js and its benefits',
                type: 'video',
                url: 'https://example.com/node-intro',
                duration: 25,
                order: 1
              },
              {
                title: 'Event Loop',
                description: 'Understanding Node.js event loop and non-blocking I/O',
                type: 'video',
                url: 'https://example.com/node-eventloop',
                duration: 30,
                order: 2
              }
            ]
          },
          {
            title: 'Express.js Framework',
            description: 'Building web applications with Express.js',
            order: 2,
            lessons: [
              {
                title: 'Express Basics',
                description: 'Setting up Express.js and basic routing',
                type: 'video',
                url: 'https://example.com/express-basics',
                duration: 35,
                order: 1
              }
            ]
          }
        ]
      }
    ];

    // Insert courses
    for (const courseData of courses) {
      const existingCourse = await Course.findOne({ title: courseData.title });
      
      if (!existingCourse) {
        const course = await Course.create(courseData);
        console.log(`✅ Created course: ${course.title}`);
      } else {
        console.log(`⚠️  Course already exists: ${courseData.title}`);
      }
    }

    console.log('\n🎉 Courses seeded successfully!');
    
    // Display all active courses
    const activeCourses = await Course.find({ status: 'active' }).populate('instructorId', 'name email');
    console.log('\n📚 All active courses in database:');
    activeCourses.forEach(course => {
      console.log(`- ${course.title} (Status: ${course.status})`);
    });

    console.log(`\nTotal active courses: ${activeCourses.length}`);

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
});
