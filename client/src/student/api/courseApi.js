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


export async function setSubmitting(token) {
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

