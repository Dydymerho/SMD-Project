import axiosClient from '../api/axiosClient';

export interface Syllabus {
  syllabusId: number;
  course: {
    courseId: number;
    courseCode: string;
    courseName: string;
    credits: number;
  };
  program: { programName: string };
  lecturer: { fullName: string };
  versionNotes: string;
}

// Authentication API
export const login = async (username: string, password: string) => {
  const response = await axiosClient.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await axiosClient.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
};

// Courses API
export const getCourses = async () => {
  const response = await axiosClient.get("/courses");
  return response.data;
};

export const getCourseById = async (id: string) => {
  const response = await axiosClient.get(`/courses/${id}`);
  return response.data;
};

// TODO: Backend không có /search endpoint cho courses, chỉ có search syllabuses
// export const searchCourses = async (query: string) => {
//   const response = await axiosClient.get('/v1/courses/search', {
//     params: { q: query },
//   });
//   return response.data;
// };

/*
export const getRecommendedCourses = async () => {
  const response = await axiosClient.get("/courses");
  return response.data;
};  */

// Syllabus API
export const getSyllabusByCourseId = async (courseId: string) => {
  const response = await axiosClient.get(`/syllabus/${courseId}`);
  return response.data;
};

export const getMySyllabi = async () => {
  const response = await axiosClient.get("/syllabus/my-syllabi");
  return response.data;
};

export const getPendingSyllabi = async () => {
  const response = await axiosClient.get("/syllabus/pending");
  return response.data;
};

export const getApprovedSyllabi = async () => {
  const response = await axiosClient.get("/syllabus/approved");
  return response.data;
};

export const approveSyllabus = async (syllabusId: string) => {
  const response = await axiosClient.post(`/syllabus/${syllabusId}/approve`);
  return response.data;
};

export const rejectSyllabus = async (syllabusId: string, reason: string) => {
  const response = await axiosClient.post(`/syllabus/${syllabusId}/reject`, {
    reason,
  });
  return response.data;
};

export const searchSyllabuses = async (query: string): Promise<Syllabus[]> => {
  const response = await axiosClient.get(`/syllabuses/search`, {
    params: { query }
  });
  return response.data;
};

// Admin API
export const getUsers = async () => {
  const response = await axiosClient.get("/admin/users");
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await axiosClient.post("/admin/users", userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await axiosClient.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await axiosClient.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await axiosClient.get("/admin/stats");
  return response.data;
};

export default axiosClient;
