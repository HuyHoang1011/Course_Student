import axios from 'axios';
import quizSet from '../pages/CourseDetail';
import answers from '../pages/CourseDetail';


export async function fetchActiveCourses(token) {
  const res = await axios.get('http://localhost:5000/api/courses/active', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function setMySubmitting(token) {
  const res = await axios.post('http://localhost:5000/api/quizzes/submit', {
    quizId: quizSet.quizId,
    quizSetId: quizSet.quizSetId,
    answers
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function getCourseByID(token, courseId) {
  const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
}

export async function getQuizzesByCourseId(token, courseId) {
  const res = await axios.get(`http://localhost:5000/api/quizzes/course/${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
}



