import axios from 'axios';

export async function fetchActiveCourses(token) {
  const res = await axios.get('http://localhost:5000/api/courses/active', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
