const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Quiz = require('../models/quiz.model');

/**
 * Recalculate quiz statistics for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - Updated stats
 */
async function recalcQuizStatsForCourse(courseId) {
  try {
    const [agg] = await Quiz.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId), isPublished: true } },
      { $project: { qCount: { $size: '$questions' } } },
      { $group: { 
        _id: null, 
        quizCount: { $sum: 1 }, 
        totalQuestions: { $sum: '$qCount' } 
      }}
    ]);
    
    const quizCount = agg?.quizCount || 0;
    const totalQuestions = agg?.totalQuestions || 0;
    
    await Course.updateOne(
      { _id: courseId },
      { 
        $set: { 
          'stats.quizCount': quizCount, 
          'stats.totalQuestions': totalQuestions, 
          'flags.hasQuiz': quizCount > 0 
        } 
      }
    );
    
    console.log(`✅ Updated quiz stats for course ${courseId}: ${quizCount} quizzes, ${totalQuestions} questions`);
    
    return { quizCount, totalQuestions, hasQuiz: quizCount > 0 };
  } catch (error) {
    console.error(`❌ Error recalculating quiz stats for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Recalculate quiz statistics for all courses
 * @returns {Promise<Object>} - Summary of updates
 */
async function recalcQuizStatsForAllCourses() {
  try {
    console.log('🔄 Starting quiz stats recalculation for all courses...');
    
    const courses = await Course.find({}).select('_id title');
    console.log(`📚 Found ${courses.length} courses to process`);
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const course of courses) {
      try {
        const stats = await recalcQuizStatsForCourse(course._id);
        results.push({
          courseId: course._id,
          courseTitle: course.title,
          ...stats,
          status: 'success'
        });
        successCount++;
      } catch (error) {
        results.push({
          courseId: course._id,
          courseTitle: course.title,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
    }
    
    console.log(`✅ Quiz stats recalculation completed!`);
    console.log(`📊 Success: ${successCount}, Errors: ${errorCount}`);
    
    return {
      totalCourses: courses.length,
      successCount,
      errorCount,
      results
    };
  } catch (error) {
    console.error('❌ Error in bulk quiz stats recalculation:', error);
    throw error;
  }
}

/**
 * Get quiz statistics summary for all courses
 * @returns {Promise<Object>} - Summary statistics
 */
async function getQuizStatsSummary() {
  try {
    const summary = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          coursesWithQuizzes: { $sum: { $cond: ['$flags.hasQuiz', 1, 0] } },
          totalQuizCount: { $sum: '$stats.quizCount' },
          totalQuestions: { $sum: '$stats.totalQuestions' },
          avgQuizzesPerCourse: { $avg: '$stats.quizCount' },
          avgQuestionsPerCourse: { $avg: '$stats.totalQuestions' }
        }
      }
    ]);
    
    return summary[0] || {
      totalCourses: 0,
      coursesWithQuizzes: 0,
      totalQuizCount: 0,
      totalQuestions: 0,
      avgQuizzesPerCourse: 0,
      avgQuestionsPerCourse: 0
    };
  } catch (error) {
    console.error('❌ Error getting quiz stats summary:', error);
    throw error;
  }
}

/**
 * Validate quiz statistics consistency
 * @returns {Promise<Object>} - Validation results
 */
async function validateQuizStatsConsistency() {
  try {
    console.log('🔍 Validating quiz statistics consistency...');
    
    const inconsistencies = [];
    const courses = await Course.find({}).select('_id title stats flags');
    
    for (const course of courses) {
      // Get actual quiz count from Quiz collection
      const actualQuizCount = await Quiz.countDocuments({ 
        courseId: course._id, 
        isPublished: true 
      });
      
      // Get actual question count
      const actualQuestionCount = await Quiz.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(course._id), isPublished: true } },
        { $project: { qCount: { $size: '$questions' } } },
        { $group: { _id: null, total: { $sum: '$qCount' } } }
      ]);
      
      const actualQuestions = actualQuestionCount[0]?.total || 0;
      const storedQuizCount = course.stats.quizCount || 0;
      const storedQuestionCount = course.stats.totalQuestions || 0;
      const storedHasQuiz = course.flags.hasQuiz || false;
      const actualHasQuiz = actualQuizCount > 0;
      
      if (actualQuizCount !== storedQuizCount || 
          actualQuestions !== storedQuestionCount || 
          actualHasQuiz !== storedHasQuiz) {
        inconsistencies.push({
          courseId: course._id,
          courseTitle: course.title,
          stored: {
            quizCount: storedQuizCount,
            totalQuestions: storedQuestionCount,
            hasQuiz: storedHasQuiz
          },
          actual: {
            quizCount: actualQuizCount,
            totalQuestions: actualQuestions,
            hasQuiz: actualHasQuiz
          }
        });
      }
    }
    
    console.log(`🔍 Validation completed. Found ${inconsistencies.length} inconsistencies.`);
    
    return {
      totalCourses: courses.length,
      inconsistenciesCount: inconsistencies.length,
      inconsistencies
    };
  } catch (error) {
    console.error('❌ Error validating quiz stats consistency:', error);
    throw error;
  }
}

module.exports = {
  recalcQuizStatsForCourse,
  recalcQuizStatsForAllCourses,
  getQuizStatsSummary,
  validateQuizStatsConsistency
};
