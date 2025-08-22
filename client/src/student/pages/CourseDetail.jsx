import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CourseDetail.css';
import Footer from '../../components/Footer';
import { getCourseByID, getQuizzesByCourseId } from '../api/courseApi';
import { createEnrollment, getEnrollmentByCourseId, getMyEnrollments, cancelEnrollment } from '../api/enrollmentApi';
import PaymentModal from '../components/PaymentModal';

// Quiz Results Component
function QuizResults({ submission, onClose }) {
  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <div className="quiz-result">
          <h2>Quiz Results 📊</h2>
          <div className="result-details">
            <p><strong>Score:</strong> {submission.score}/{submission.totalQuestions}</p>
            <p><strong>Percentage:</strong> {submission.percentage}%</p>
            <p><strong>Status:</strong> {submission.passed ? '✅ Passed' : '❌ Failed'}</p>
            <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
          </div>
          <button className="quiz-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Quiz Modal Component
function QuizModal({ quizSet, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.length !== quizSet.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/quizzes/submit', {
        quizId: quizSet.quizId,
        quizSetId: quizSet.quizSetId,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizSet.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (result) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <div className="quiz-result">
            <h2>Quiz Complete! 🎉</h2>
            <div className="result-details">
              <p><strong>Score:</strong> {result.score}/{quizSet.questions.length}</p>
              <p><strong>Percentage:</strong> {Math.round((result.score / quizSet.questions.length) * 100)}%</p>
              <p><strong>Status:</strong> {result.passed ? '✅ Passed' : '❌ Failed'}</p>
            </div>
            <button className="quiz-close-btn" onClick={onComplete}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <div className="quiz-header">
          <h2>Quiz</h2>
          <button className="quiz-close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="quiz-content">
          <div className="question-counter">
            Question {currentQuestion + 1} of {quizSet.questions.length}
          </div>
          
          <div className="question">
            <h3>{quizSet.questions[currentQuestion].question}</h3>
            <div className="options">
              {quizSet.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="quiz-navigation">
            <button 
              className="nav-btn prev-btn" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            {currentQuestion === quizSet.questions.length - 1 ? (
              <button 
                className="nav-btn submit-btn" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button 
                className="nav-btn next-btn" 
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizSubmission, setQuizSubmission] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view course details');
        setLoading(false);
        return;
      }
      
      console.log('Fetching course data for courseId:', courseId);
      
      // Fetch course details
      const courseData = await getCourseByID(token, courseId);
      console.log('Course data fetched:', courseData);
      setCourse(courseData);
      
      // Fetch enrollment status
      try {
        console.log('Checking enrollment status...');
        const enrollmentData = await getEnrollmentByCourseId(token, courseId);
        console.log('Enrollment status:', enrollmentData);
        setEnrollment(enrollmentData);
      } catch (err) {
        console.log('User not enrolled or enrollment check failed:', err.message);
        // User not enrolled, that's okay
        setEnrollment(null);
      }
      
      // Fetch quizzes
      try {
        console.log('Fetching quizzes...');
        const quizzesData = await getQuizzesByCourseId(token, courseId);
        console.log('Quizzes fetched:', quizzesData);
        setQuizzes(quizzesData);
      } catch (err) {
        console.log('No quizzes available or quiz fetch failed:', err.message);
        // No quizzes available, that's okay
        setQuizzes([]);
      }
      
    } catch (err) {
      console.error('Failed to load course data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load course data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to enroll in this course');
        return;
      }

      // Check if course is free or paid
      const isFree = course.priceType === 'free' || Number(course.price || 0) === 0;
      
      if (!isFree) {
        // For paid courses, redirect to payment or show payment modal
        alert(`This is a paid course (${course.currency || 'AUD'}${course.price}). Please complete payment before enrollment.`);
        // TODO: Redirect to payment page or open payment modal
        // navigate(`/student/payment/${courseId}`);
        setLoading(false);
        return;
      }
      
      // Only allow direct enrollment for free courses
      const enrollmentData = await createEnrollment(token, courseId);
      console.log('Enrollment successful:', enrollmentData);
      
      // Update enrollment state
      setEnrollment(enrollmentData);
      
      // Show success message
      alert('Successfully enrolled in the course!');
      
    } catch (err) {
      console.error('Enrollment error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to enroll in course. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async () => {
    if (!window.confirm('Are you sure you want to cancel your enrollment? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to manage your enrollment');
        return;
      }
      
      // We need to get the enrollment ID first
      if (!enrollment || !enrollment._id) {
        alert('Enrollment information not found. Please refresh the page and try again.');
        return;
      }
      
      await cancelEnrollment(enrollment._id);
      console.log('Enrollment cancelled successfully');
      
      // Update enrollment state
      setEnrollment(null);
      
      // Show success message
      alert('Enrollment cancelled successfully');
      
    } catch (err) {
      console.error('Cancel enrollment error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel enrollment. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleQuizComplete = (submission) => {
    setQuizSubmission(submission);
    setShowQuizModal(false);
    setShowQuizResults(true);
  };

  const closeQuizResults = () => {
    setShowQuizResults(false);
    setQuizSubmission(null);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to complete enrollment');
        return;
      }
      
      // After successful payment, create enrollment
      const enrollmentData = await createEnrollment(token, courseId);
      console.log('Enrollment successful after payment:', enrollmentData);
      
      // Update enrollment state
      setEnrollment(enrollmentData);
      
      // Show success message
      alert('Payment successful! You are now enrolled in the course.');
      
    } catch (err) {
      console.error('Enrollment after payment error:', err);
      const errorMessage = err.response?.data?.message || 'Payment successful but enrollment failed. Please contact support.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="cd-loading">
          <div className="cd-spinner"></div>
          <p>Loading course details...</p>
        </div>
      ) : error ? (
        <div className="cd-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : !course ? (
        <div className="cd-error">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist.</p>
        </div>
      ) : (
        <div className="cd-page">
          {/* HERO */}
          <header className="cd-hero">
            <div className="cd-hero-grid">
              <figure className="cd-hero-media">
                {/* Ưu tiên image trong introductionAssets, sau đó đến thumbnailUrl */}
                {course.introductionAssets?.find(a => a.kind === 'image') ? (
                  <img
                    src={course.introductionAssets.find(a => a.kind === 'image')?.url}
                    alt={course.title}
                    className="cd-hero-img"
                  />
                ) : course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="cd-hero-img" />
                ) : (
                  <div className="cd-hero-placeholder">
                    <span>Course Preview</span>
                  </div>
                )}
                {/* Nếu có video preview */}
                {course.introductionAssets?.find(a => a.kind === 'video') && (
                  <div className="cd-hero-video">
                    <video controls className="cd-video">
                      <source
                        src={course.introductionAssets.find(a => a.kind === 'video')?.url}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </figure>

              <div className="cd-hero-content">
                <h1 className="cd-title">{course.title}</h1>
                {course.subtitle && <p className="cd-subtitle">{course.subtitle}</p>}

                <div className="cd-meta">
                  {course.level && (
                    <span className={`cd-chip level-${course.level}`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  )}
                  {course.stats?.totalLessons > 0 && (
                    <span className="cd-chip">📚 {course.stats.totalLessons} lessons</span>
                  )}
                  {course.stats?.totalDurationSec > 0 && (
                    <span className="cd-chip">⏱ {Math.floor(course.stats.totalDurationSec / 60)} min</span>
                  )}
                  {course.stats?.studentCount > 0 && (
                    <span className="cd-chip">👥 {course.stats.studentCount} students</span>
                  )}
                </div>

                <div className="cd-priceRow">
                  {course.priceType === 'free' || course.price === 0 ? (
                    <div className="cd-price free">Free</div>
                  ) : (
                    <div className="cd-price paid">
                      {course.salePrice && course.salePrice < course.price && (
                        <span className="cd-price-original">
                          {course.currency || 'AUD'}${course.price}
                        </span>
                      )}
                      <span className="cd-price-current">
                        {course.currency || 'AUD'}${course.salePrice || course.price}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cd-actions">
                  {!enrollment ? (
                    <>
                      {course.priceType === 'free' || course.price === 0 ? (
                        <button 
                          className="cd-btn cd-btn-primary" 
                          onClick={handleEnroll}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Start Learning'}
                        </button>
                      ) : (
                        <>
                          <button 
                            className="cd-btn cd-btn-primary" 
                            onClick={() => {
                              // For paid courses, open payment modal
                              setShowPaymentModal(true);
                            }}
                            disabled={loading}
                          >
                            Enroll Now
                          </button>
                          <button
                            className="cd-btn cd-btn-ghost"
                            onClick={() => {
                              // Show course details
                              alert(`Course: ${course.title}\nPrice: ${course.currency || 'AUD'}${course.price}\n\nThis is a paid course. Complete payment to access all content.`);
                            }}
                            disabled={loading}
                          >
                            Learn More
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="cd-enrolled">
                      <span className="cd-enrolled-badge">✓ Enrolled</span>
                      <button 
                        className="cd-btn cd-btn-link" 
                        onClick={handleCancelEnrollment}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Cancel enrollment'}
                      </button>
                    </div>
                  )}
                </div>

                {course.instructorId && (
                  <div className="cd-instructor">
                    <span className="cd-instructor-label">Instructor</span>
                    <span className="cd-instructor-name">
                      {typeof course.instructorId === 'object'
                        ? course.instructorId.name
                        : 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="cd-content">
            {/* About / Introduction */}
            {course.description && (
              <section className="cd-section">
                <h2 className="cd-h2">About this course</h2>
                <p className="cd-lead">{course.description}</p>
              </section>
            )}

            {course.introductionAssets?.length > 0 && (
              <section className="cd-section">
                <h2 className="cd-h2">Course introduction</h2>
                <div className="cd-intro-grid">
                  {course.introductionAssets.map((asset, i) => (
                    <article key={i} className="cd-intro-card">
                      {asset.title && <h3 className="cd-h3">{asset.title}</h3>}
                      {asset.description && <p className="cd-muted">{asset.description}</p>}
                      {asset.kind === 'text' && (
                        <p className="cd-body">{asset.textContent || asset.description}</p>
                      )}
                      {asset.kind === 'image' && (
                        <img className="cd-intro-img" src={asset.url} alt={asset.title || 'Intro'} />
                      )}
                      {asset.kind === 'video' && (
                        <video controls className="cd-intro-video">
                          <source src={asset.url} type="video/mp4" />
                        </video>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Sections/Lessons (tạm thời đọc từ course.sections nếu bạn chưa đổi FE) */}
            {enrollment && course.sections?.length > 0 && (
              <section className="cd-section">
                <h2 className="cd-h2">Course content</h2>
                <div className="cd-sections">
                  {course.sections.map((section, idx) => (
                    <details key={idx} className="cd-section-item" open={idx === 0}>
                      <summary>
                        <div className="cd-section-head">
                          <h3 className="cd-h3">
                            Section {section.order}: {section.title}
                          </h3>
                          {section.description && (
                            <p className="cd-muted">{section.description}</p>
                          )}
                        </div>
                      </summary>

                      <ul className="cd-lessons">
                        {section.lessons?.map((lesson, j) => (
                          <li key={j} className="cd-lesson">
                            <div className="cd-lesson-main">
                              <div className="cd-lesson-title">
                                <span className="cd-lesson-index">{lesson.order}</span>
                                <strong>{lesson.title}</strong>
                              </div>
                              <div className="cd-lesson-meta">
                                <span className={`cd-tag type-${lesson.contentType}`}>
                                  {lesson.contentType}
                                </span>
                                {lesson.durationSec > 0 && (
                                  <span className="cd-tag">
                                    {Math.floor(lesson.durationSec / 60)}m {lesson.durationSec % 60}s
                                  </span>
                                )}
                                {lesson.isPreview && <span className="cd-tag cd-tag-outline">Preview</span>}
                              </div>
                            </div>

                            <div className="cd-lesson-body">
                              {lesson.contentType === 'video' && lesson.url && (
                                <video controls className="cd-lesson-video">
                                  <source src={lesson.url} type="video/mp4" />
                                </video>
                              )}
                              {lesson.contentType === 'text' && (
                                <p className="cd-body">{lesson.textContent || lesson.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Quizzes */}
            {enrollment && quizzes?.length > 0 && (
              <section className="cd-section">
                <h2 className="cd-h2">Quizzes</h2>
                <div className="cd-quiz-grid">
                  {quizzes.map((quiz, i) => (
                    <article key={i} className="cd-quiz-card">
                      <div className="cd-quiz-head">
                        <h3 className="cd-h3">{quiz.title}</h3>
                        <p className="cd-muted">{quiz.description}</p>
                      </div>
                      <div className="cd-quiz-meta">
                        <span className="cd-tag">{quiz.questions?.length || 0} questions</span>
                        <span className="cd-tag">Passing: {quiz.passingScore || 70}%</span>
                      </div>
                      <button className="cd-btn cd-btn-primary" onClick={() => handleStartQuiz(quiz)}>
                        Start quiz
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Stats */}
            {course.stats && (
              <section className="cd-section">
                <h2 className="cd-h2">At a glance</h2>
                <div className="cd-stats">
                  <div className="cd-stat">
                    <span className="cd-stat-num">{course.stats.totalLessons || 0}</span>
                    <span className="cd-stat-label">Total lessons</span>
                  </div>
                  <div className="cd-stat">
                    <span className="cd-stat-num">
                      {Math.floor((course.stats.totalDurationSec || 0) / 60)}
                    </span>
                    <span className="cd-stat-label">Total minutes</span>
                  </div>
                  <div className="cd-stat">
                    <span className="cd-stat-num">{course.stats.studentCount || 0}</span>
                    <span className="cd-stat-label">Students enrolled</span>
                  </div>
                  {course.stats.ratingCount > 0 && (
                    <div className="cd-stat">
                      <span className="cd-stat-num">
                        {course.stats.ratingAvg?.toFixed(1) || 0}
                      </span>
                      <span className="cd-stat-label">Average rating</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && selectedQuiz && (
        <QuizModal
          quizSet={selectedQuiz}
          onClose={() => setShowQuizModal(false)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Quiz Results */}
      {showQuizResults && quizSubmission && (
        <QuizResults submission={quizSubmission} onClose={closeQuizResults} />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={course}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <Footer />
    </>
  );
} 