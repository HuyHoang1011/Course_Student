# Quiz Integration với Course Model

## 🎯 Tổng quan

Hệ thống đã được tích hợp để tự động đồng bộ thống kê quiz với Course model thông qua MongoDB hooks. Mỗi khi tạo/sửa/xóa quiz, các thống kê sẽ được tự động cập nhật.

## 🏗️ Cấu trúc mới

### Course Model Extensions
```javascript
stats: {
  // ... existing fields
  quizCount: { type: Number, default: 0 },       // số quiz đã publish
  totalQuestions: { type: Number, default: 0 },  // tổng câu hỏi của tất cả quiz publish
},
flags: {
  hasQuiz: { type: Boolean, default: false }     // để show badge nhanh
}
```

### Quiz Model
- **QuestionSchema**: Hỗ trợ multiple choice với explanation và points
- **QuizSchema**: Hỗ trợ time limit, randomization, retake settings
- **Auto-sync hooks**: Tự động cập nhật course stats

## 🔄 Hooks tự động

### Post-save Hook
```javascript
QuizSchema.post('save', async function(doc, next) {
  try { 
    await recalcQuizStats(doc.courseId); 
    next(); 
  } catch (e) { 
    next(e); 
  }
});
```

### Post-delete Hook
```javascript
QuizSchema.post('findOneAndDelete', async function(doc, next) {
  try { 
    if (doc) await recalcQuizStats(doc.courseId); 
    next(); 
  } catch (e) { 
    next(e); 
  }
});
```

## 📊 API Endpoints

### Quiz Management
```
GET    /api/quizzes/courses/:courseId/quizzes     # Lấy danh sách quiz của course
GET    /api/quizzes/courses/:courseId/quizzes/summary  # Lấy thống kê quiz
GET    /api/quizzes/:id                           # Lấy quiz theo ID
POST   /api/quizzes                               # Tạo quiz mới
PUT    /api/quizzes/:id                           # Cập nhật quiz
DELETE /api/quizzes/:id                           # Xóa quiz
PATCH  /api/quizzes/:id/toggle-published          # Toggle trạng thái publish
```

### Course với Quiz Stats
```
GET /api/courses/:id  # Trả về course với quizStats
```

Response example:
```json
{
  "_id": "course_id",
  "title": "Course Title",
  "stats": {
    "studentCount": 25,
    "quizCount": 3,
    "totalQuestions": 15
  },
  "flags": {
    "hasQuiz": true
  },
  "quizStats": {
    "quizCount": 3,
    "totalQuestions": 15,
    "hasQuiz": true
  }
}
```

## 🛠️ Utility Functions

### Recalc Quiz Stats
```javascript
const { recalcQuizStatsForCourse } = require('./utils/quizStatsUtil');

// Recalc cho 1 course
await recalcQuizStatsForCourse(courseId);

// Recalc cho tất cả courses
await recalcQuizStatsForAllCourses();

// Validate consistency
await validateQuizStatsConsistency();
```

### Migration Script
```bash
# Chạy migration để recalc quiz stats cho tất cả courses
node scripts/recalcQuizStats.js
```

## 🎨 Frontend Integration

### Course Card với Quiz Badge
```jsx
const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      {course.flags?.hasQuiz && (
        <span className="quiz-badge">
          🧪 {course.stats.quizCount} quizzes
        </span>
      )}
      <p>{course.stats.totalQuestions} questions</p>
    </div>
  );
};
```

### Course Detail với Quiz Section
```jsx
const CourseDetail = ({ course }) => {
  return (
    <div>
      <h1>{course.title}</h1>
      
      {/* Quiz Stats */}
      {course.quizStats?.hasQuiz && (
        <div className="quiz-stats">
          <h3>Quizzes</h3>
          <p>{course.quizStats.quizCount} quizzes available</p>
          <p>{course.quizStats.totalQuestions} total questions</p>
        </div>
      )}
      
      {/* Quiz List */}
      {course.quizStats?.hasQuiz && (
        <QuizList courseId={course._id} />
      )}
    </div>
  );
};
```

## 🔍 Monitoring & Debugging

### Logs
Hệ thống tự động log mỗi khi cập nhật quiz stats:
```
✅ Updated quiz stats for course 507f1f77bcf86cd799439011: 3 quizzes, 15 questions
```

### Validation
```javascript
// Kiểm tra consistency
const validation = await validateQuizStatsConsistency();
console.log(`Found ${validation.inconsistenciesCount} inconsistencies`);
```

### Performance
- **Aggregation queries** được optimize với indexes
- **Hooks** chỉ chạy khi cần thiết
- **Batch operations** hỗ trợ recalc nhiều courses

## 🚀 Best Practices

### 1. Quiz Creation
```javascript
// Luôn validate questions trước khi save
const quiz = new Quiz({
  courseId,
  title: "Final Exam",
  questions: validatedQuestions,
  passingScore: 80,
  timeLimit: 60 // minutes
});
```

### 2. Course Display
```javascript
// Sử dụng flags.hasQuiz để quyết định hiển thị
if (course.flags.hasQuiz) {
  // Show quiz section
} else {
  // Hide quiz section
}
```

### 3. Performance Optimization
```javascript
// Sử dụng select để chỉ lấy fields cần thiết
const course = await Course.findById(id)
  .select('title stats.quizCount flags.hasQuiz');
```

## 🐛 Troubleshooting

### Quiz Stats không đồng bộ
```bash
# Chạy migration script
node scripts/recalcQuizStats.js

# Hoặc recalc manual cho 1 course
const { recalcQuizStatsForCourse } = require('./utils/quizStatsUtil');
await recalcQuizStatsForCourse(courseId);
```

### Validation Errors
```javascript
// Kiểm tra consistency
const validation = await validateQuizStatsConsistency();
if (validation.inconsistenciesCount > 0) {
  console.log('Inconsistencies found:', validation.inconsistencies);
}
```

## 📈 Future Enhancements

### 1. Quiz Analytics
- Thống kê completion rate
- Average scores per quiz
- Time spent per quiz

### 2. Advanced Quiz Features
- Question banks
- Adaptive difficulty
- Proctoring integration

### 3. Performance Monitoring
- Quiz stats update metrics
- Hook execution time tracking
- Cache layer for frequently accessed stats

## 🎯 Kết luận

Hệ thống quiz integration cung cấp:
- ✅ **Auto-sync**: Tự động đồng bộ stats
- ✅ **Performance**: Optimized queries và indexes
- ✅ **Flexibility**: Hỗ trợ nhiều loại quiz
- ✅ **Monitoring**: Validation và debugging tools
- ✅ **Scalability**: Hỗ trợ large-scale deployments

Với hooks tự động, bạn không cần lo lắng về việc maintain quiz stats - hệ thống sẽ tự động xử lý mọi thay đổi!
