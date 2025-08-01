const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Sample courses data with status field
const sampleCourses = [
  {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.",
    content: [
      {
        type: "video",
        url: "https://example.com/videos/web-dev-intro.mp4"
      },
      {
        type: "pdf",
        url: "https://example.com/pdfs/web-dev-guide.pdf"
      },
      {
        type: "slide",
        url: "https://example.com/slides/web-dev-slides.pdf"
      }
    ],
    imageIntroduction: "https://example.com/images/web-dev.jpg",
    status: "pending"
  },
  {
    title: "Advanced JavaScript Programming",
    description: "Master advanced JavaScript concepts including ES6+, async programming, and design patterns.",
    content: [
      {
        type: "video",
        url: "https://example.com/videos/js-advanced.mp4"
      },
      {
        type: "pdf",
        url: "https://example.com/pdfs/js-advanced-guide.pdf"
      }
    ],
    imageIntroduction: "https://example.com/images/js-advanced.jpg",
    status: "pending"
  },
  {
    title: "React.js Fundamentals",
    description: "Build interactive user interfaces with React.js and modern JavaScript.",
    content: [
      {
        type: "video",
        url: "https://example.com/videos/react-fundamentals.mp4"
      },
      {
        type: "slide",
        url: "https://example.com/slides/react-slides.pdf"
      }
    ],
    imageIntroduction: "https://example.com/images/react.jpg",
    status: "pending"
  },
  {
    title: "Node.js Backend Development",
    description: "Create robust server-side applications with Node.js and Express.",
    content: [
      {
        type: "video",
        url: "https://example.com/videos/node-backend.mp4"
      },
      {
        type: "pdf",
        url: "https://example.com/pdfs/node-backend-guide.pdf"
      }
    ],
    imageIntroduction: "https://example.com/images/node-backend.jpg",
    status: "inactive"
  },
  {
    title: "Database Design and SQL",
    description: "Learn database design principles and SQL for data management.",
    content: [
      {
        type: "video",
        url: "https://example.com/videos/database-design.mp4"
      },
      {
        type: "pdf",
        url: "https://example.com/pdfs/database-guide.pdf"
      }
    ],
    imageIntroduction: "https://example.com/images/database.jpg",
    status: "draft"
  }
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    const Course = require('./models/course.model');
    const User = require('./models/user.model');
    
    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️ Cleared existing courses');
    
    // Find an instructor user (assuming there's at least one instructor)
    const instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('⚠️ No instructor found. Creating a sample instructor...');
      const sampleInstructor = await User.create({
        name: "Sample Instructor",
        email: "instructor@example.com",
        password: "password123",
        role: "instructor"
      });
      console.log('✅ Created sample instructor');
    }
    
    const instructorId = instructor ? instructor._id : (await User.findOne({ role: 'instructor' }))._id;
    
    // Create courses with instructor ID
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructorId: instructorId
    }));
    
    const createdCourses = await Course.create(coursesWithInstructor);
    console.log(`✅ Created ${createdCourses.length} courses successfully`);
    
    // Display created courses with their status
    createdCourses.forEach(course => {
      console.log(`📚 ${course.title} - Status: ${course.status}`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (err) {
    console.error('❌ Error seeding courses:', err);
    process.exit(1);
  }
}

async function clearEnrollments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Enrollment = require('./models/enrollment.model');
    await Enrollment.deleteMany({}); // Delete all enrollments
    console.log('✅ Deleted all enrollments successfully');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error deleting enrollments:', err);
    process.exit(1);
  }
}

// Check command line arguments to determine what to run
const command = process.argv[2];

if (command === 'seed') {
  seedCourses();
} else if (command === 'clear-enrollments') {
  clearEnrollments();
} else {
  console.log('Usage:');
  console.log('  node seedCourses.js seed              - Seed courses with status field');
  console.log('  node seedCourses.js clear-enrollments - Clear all enrollments');
  console.log('  node seedCourses.js                   - Show this help message');
}
