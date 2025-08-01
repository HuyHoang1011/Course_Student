import axios from 'axios';

export const getMyCertificates = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:5000/api/certificates', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}; 