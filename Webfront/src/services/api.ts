import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

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

export const getMySyllabi = async () => {
  const response = await api.get('/syllabus/my-syllabi');
  return response.data;
};

export const getPendingSyllabi = async () => {
  const response = await api.get('/syllabus/pending');
  return response.data;
};

export const getApprovedSyllabi = async () => {
  const response = await api.get('/syllabus/approved');
  return response.data;
};

export const approveSyllabus = async (syllabusId: string) => {
  const response = await api.post(`/syllabus/${syllabusId}/approve`);
  return response.data;
};

export const rejectSyllabus = async (syllabusId: string, reason: string) => {
  const response = await api.post(`/syllabus/${syllabusId}/reject`, { reason });
  return response.data;
};

// Admin API
export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export default api;
