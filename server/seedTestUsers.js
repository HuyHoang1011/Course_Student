/**
 * seedTestUsers.js
 * - Optional: seed admin & instructor test users (controlled by SEED_USERS flag)
 * - Migrate legacy Course docs (with sections/introductionContent/imageIntroduction)
 *   to new Course/Module/Lesson structure.
 *
 * Run: node seedTestUsers.js
 */

const path = require('path');
require('dotenv').config(); // nếu .env không cùng thư mục: { path: path.resolve(__dirname, '../.env') }
const mongoose = require('mongoose');

// ====== Import models (đường dẫn theo cấu trúc của bạn trong /server) ======
const User = require('./models/user.model');
const Course = require('./models/course.model');   // schema mới (đã bỏ sections ở model)
const Module = require('./models/module.model');
const Lesson = require('./models/lesson.model');

// ====== Config flags ======
const SEED_USERS = true; // đặt false nếu không muốn tạo user test
const CREATE_SAMPLE_COURSE = true; // đặt false nếu không muốn tạo course mẫu
const CLEAR_DATABASE = true; // đặt false nếu không muốn xóa database cũ

// ====== Course Configuration ======
const INSTRUCTOR_ID = '686b4ab04ab394f43f91674f'; // ID của instructor

// ====== Helpers ======
function getUri() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL;
  if (!uri) throw new Error('Missing MONGODB_URI (or MONGO_URI/DATABASE_URL) in .env');
  return uri;
}

function safeHostFromUri(uri) {
  try {
    const afterAt = uri.split('@')[1] || uri;
    return (afterAt.split('?')[0] || '').replace(/\/.*/, '');
  } catch {
    return '***';
  }
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function connectDB() {
  const uri = getUri();
  console.log('🔌 Connecting MongoDB @', safeHostFromUri(uri));
  await mongoose.connect(uri, {});
  console.log('✅ Connected to MongoDB');
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch {}
}

// ====== Seed test users (optional) ======
async function ensureTestUsers() {
  if (!SEED_USERS) return { admin: null, instructor: null };

  // Admin
  let admin = await User.findOne({ email: 'admin.demo@uni.edu' });
  if (!admin) {
    admin = await User.create({
      name: 'Demo Admin',
      email: 'admin.demo@uni.edu',
      passwordHash: 'demo', // chỉ seed (đừng dùng prod)
      role: 'admin',
    });
    console.log('👤 Seeded admin:', admin.email);
  }

  // Instructor
  let instructor = await User.findOne({ email: 'instructor.demo@uni.edu' });
  if (!instructor) {
    instructor = await User.create({
      name: 'Demo Instructor',
      email: 'instructor.demo@uni.edu',
      passwordHash: 'demo',
      role: 'instructor',
    });
    console.log('👤 Seeded instructor:', instructor.email);
  }

  return { admin, instructor };
}

// ====== Migration from legacy Course to Module/Lesson ======
/**
 * Map introductionContent (cũ) -> introductionAssets (mới)
 */
function mapIntroductionAssets(introductionContent) {
  if (!Array.isArray(introductionContent)) return [];
  return introductionContent.map((it) => ({
    kind: it.type, // 'video' | 'image' | 'text'
    url: it.url || undefined,
    title: it.title || undefined,
    description: it.description || undefined,
    textContent: it.type === 'text' ? (it.description || '') : undefined,
  }));
}

async function migrateCourses() {
  let migratedCourses = 0;
  let createdModules = 0;
  let createdLessons = 0;

  // Chọn các course có cấu trúc cũ
  const filter = {
    $or: [
      { sections: { $exists: true } },
      { introductionContent: { $exists: true } },
      { imageIntroduction: { $exists: true } },
    ],
  };

  const cursor = Course.find(filter).cursor();

  for await (const course of cursor) {
    try {
      const courseId = course._id;

      // Nếu đã có module cho course này → skip (tránh double-migrate)
      const existedModule = await Module.findOne({ courseId }).select('_id').lean();
      if (existedModule) {
        console.log(`⏭  Skip "${course.title}" — modules already exist`);
        continue;
      }

      // Map intro assets + thumbnail từ trường cũ (nếu cần)
      const introAssets = mapIntroductionAssets(course.introductionContent);
      const patch = {};
      if (introAssets.length) patch.introductionAssets = introAssets;
      if (course.imageIntroduction && !course.thumbnailUrl) {
        patch.thumbnailUrl = course.imageIntroduction;
      }
      // Publish nếu status=active mà isPublished chưa set
      if (typeof course.isPublished === 'undefined') {
        patch.isPublished = course.status === 'active';
      }

      const sections = Array.isArray(course.sections) ? course.sections : [];
      let totalLessons = 0;
      let totalDurationSec = 0;

      // Tạo Module/Lesson
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i] || {};
        const moduleDoc = await Module.create({
          courseId,
          title: sec.title || `Module ${i + 1}`,
          summary: sec.description || '',
          order: Number.isFinite(sec.order) ? sec.order : (i + 1),
        });
        createdModules++;

        const lessons = Array.isArray(sec.lessons) ? sec.lessons : [];
        for (let j = 0; j < lessons.length; j++) {
          const les = lessons[j] || {};
          const contentType = les.type || 'text';
          const durationSec = les.duration ? les.duration * 60 : 0;

          await Lesson.create({
            courseId,
            moduleId: moduleDoc._id,
            title: les.title || `Lesson ${i + 1}.${j + 1}`,
            description: les.description || '',
            order: Number.isFinite(les.order) ? les.order : (j + 1),
            contentType,
            url: les.url || (contentType !== 'text' ? 'https://example.com/resource' : undefined),
            textContent: contentType === 'text' ? (les.description || '') : undefined,
            durationSec,
            isPreview: i === 0 && j < 2, // 2 bài preview ở module đầu
          });

          totalLessons++;
          totalDurationSec += durationSec;
          createdLessons++;
        }
      }

      // Cập nhật Course: set stats + fields mới, unset fields cũ
      const update = {
        ...(Object.keys(patch).length ? { $set: patch } : {}),
        $unset: {
          sections: '',
          introductionContent: '',
          imageIntroduction: '',
        },
      };

      // Đảm bảo luôn set stats (kể cả không có section)
      update.$set = update.$set || {};
      update.$set['stats.totalLessons'] = totalLessons;
      update.$set['stats.totalDurationSec'] = totalDurationSec;

      await Course.updateOne({ _id: courseId }, update);

      console.log(`✔ Migrated "${course.title}" → modules: ${sections.length}, lessons: ${totalLessons}`);
      migratedCourses++;
    } catch (err) {
      console.error(`❌ Error migrating course "${course.title}":`, err.message);
    }
  }

  console.log('--- MIGRATION COMPLETED ---');
  console.log({ migratedCourses, createdModules, createdLessons });

  if (migratedCourses === 0) {
    console.log('ℹ️  No courses found that need migration');
  }
}

// ====== Clear Old Database ======
async function clearOldDatabase() {
  try {
    console.log('🗑️  Clearing old database...');
    
    // Delete all existing courses, modules, and lessons
    const courseResult = await Course.deleteMany({});
    const moduleResult = await Module.deleteMany({});
    const lessonResult = await Lesson.deleteMany({});
    
    console.log(`✅ Deleted ${courseResult.deletedCount} courses`);
    console.log(`✅ Deleted ${moduleResult.deletedCount} modules`);
    console.log(`✅ Deleted ${lessonResult.deletedCount} lessons`);
    
    console.log('🗑️  Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

// ====== Create Sample Course ======
async function createSampleCourse() {
  if (!CREATE_SAMPLE_COURSE) return;

  try {
    // Kiểm tra xem course đã tồn tại chưa
    const existingCourse = await Course.findOne({ 
      title: 'Introduction to Web Development',
      instructorId: INSTRUCTOR_ID 
    });

    if (existingCourse) {
      console.log('⏭  Sample course already exists, skipping creation');
      return existingCourse;
    }

    // Tạo course mới theo đúng structure của course.model.js
    const course = await Course.create({
      title: 'Introduction to Web Development',
      subtitle: 'Learn the fundamentals of web development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything you need to know to build modern websites.',
      level: 'beginner',
      priceType: 'paid',
      price: 49.99,
      currency: 'AUD',
      instructorId: INSTRUCTOR_ID,
      thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      promoVideoUrl: 'https://example.com/promo-video.mp4',
      introductionAssets: [
        {
          kind: 'text',
          title: 'Welcome to Web Development',
          description: 'Get started with your web development journey',
          textContent: 'Welcome to Introduction to Web Development! In this course, you will learn the fundamental technologies that power the modern web: HTML, CSS, and JavaScript. By the end of this course, you will be able to create beautiful, responsive websites from scratch.'
        },
        {
          kind: 'image',
          title: 'Course Overview',
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
          description: 'Visual overview of what you will learn'
        }
      ],
      isPublished: true,
      status: 'active',
      stats: {
        totalLessons: 0,
        totalDurationSec: 0,
        ratingAvg: 0,
        ratingCount: 0,
        studentCount: 0
      }
    });

    console.log('✅ Created sample course:', course.title);

    // Tạo modules và lessons cho course
    const modules = [
      {
        title: 'Getting Started with Web Development',
        summary: 'Introduction to the course and setting up your development environment',
        order: 1,
        lessons: [
          {
            title: 'Welcome to Web Development',
            description: 'Overview of what you will learn in this course',
            order: 1,
            contentType: 'text',
            textContent: 'Welcome to Introduction to Web Development! In this course, you will learn the fundamental technologies that power the modern web: HTML, CSS, and JavaScript. By the end of this course, you will be able to create beautiful, responsive websites from scratch.',
            durationSec: 300,
            isPreview: true
          },
          {
            title: 'Setting Up Your Development Environment',
            description: 'Install and configure the tools you need for web development',
            order: 2,
            contentType: 'text',
            textContent: 'Before we start coding, you need to set up your development environment. We will install a code editor (VS Code), a web browser (Chrome), and set up your file structure.',
            durationSec: 600,
            isPreview: true
          }
        ]
      },
      {
        title: 'HTML Fundamentals',
        summary: 'Learn the structure and elements of HTML',
        order: 2,
        lessons: [
          {
            title: 'What is HTML?',
            description: 'Understanding the role of HTML in web development',
            order: 1,
            contentType: 'text',
            textContent: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page semantically and originally included cues for the appearance of the document.',
            durationSec: 450
          },
          {
            title: 'Basic HTML Structure',
            description: 'Learn the essential HTML elements and document structure',
            order: 2,
            contentType: 'text',
            textContent: 'Every HTML document has a basic structure that includes the DOCTYPE declaration, html, head, and body elements. The head contains metadata about the document, while the body contains the visible content.',
            durationSec: 600
          }
        ]
      },
      {
        title: 'CSS Styling',
        summary: 'Make your websites beautiful with CSS',
        order: 3,
        lessons: [
          {
            title: 'Introduction to CSS',
            description: 'Learn how CSS makes websites visually appealing',
            order: 1,
            contentType: 'text',
            textContent: 'CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. CSS describes how elements should be rendered on screen, on paper, in speech, or on other media.',
            durationSec: 450
          },
          {
            title: 'CSS Selectors and Properties',
            description: 'Master CSS selectors and common properties',
            order: 2,
            contentType: 'text',
            textContent: 'CSS selectors are patterns used to select the elements you want to style. Properties define the visual characteristics of the selected elements, such as color, size, position, and more.',
            durationSec: 600
          }
        ]
      }
    ];

    let totalLessons = 0;
    let totalDurationSec = 0;

    // Tạo modules và lessons
    for (const moduleData of modules) {
      const module = await Module.create({
        courseId: course._id,
        title: moduleData.title,
        summary: moduleData.summary,
        order: moduleData.order
      });

      console.log(`  📚 Created module: ${module.title}`);

      for (const lessonData of moduleData.lessons) {
        await Lesson.create({
          courseId: course._id,
          moduleId: module._id,
          title: lessonData.title,
          description: lessonData.description,
          order: lessonData.order,
          contentType: lessonData.contentType,
          textContent: lessonData.textContent,
          durationSec: lessonData.durationSec,
          isPreview: lessonData.isPreview || false
        });

        totalLessons++;
        totalDurationSec += lessonData.durationSec;
        console.log(`    📝 Created lesson: ${lessonData.title}`);
      }
    }

    // Cập nhật stats của course
    await Course.updateOne(
      { _id: course._id },
      {
        $set: {
          'stats.totalLessons': totalLessons,
          'stats.totalDurationSec': totalDurationSec
        }
      }
    );

    console.log(`✅ Course setup complete: ${totalLessons} lessons, ${Math.round(totalDurationSec / 60)} minutes total`);
    return course;

  } catch (error) {
    console.error('❌ Error creating sample course:', error.message);
    throw error;
  }
}

// ====== Main ======
(async () => {
  try {
    await connectDB();

    await ensureTestUsers();
    
    if (CLEAR_DATABASE) {
      await clearOldDatabase(); // Xóa dữ liệu cũ trước khi tạo mới
    }
    
    await createSampleCourse(); // Tạo course mẫu
    await migrateCourses();

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    await disconnectDB();
    process.exit(1);
  }
})();
