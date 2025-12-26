import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Subjects API
export const getSubjects = async () => {
  const response = await api.get('/subjects');
  return response.data;
};

export const getSubjectById = async (id: string) => {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
};

export const searchSubjects = async (query: string) => {
  const response = await api.get('/subjects/search', {
    params: { q: query },
  });
  return response.data;
};

// Syllabus API
export const getSyllabusBySubjectId = async (subjectId: string) => {
  const response = await api.get(`/syllabus/${subjectId}`);
  return response.data;
};

export default api;
