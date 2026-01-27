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

// Departments API
export const getDepartments = async () => {
  const response = await axiosClient.get("/departments");
  return response.data;
};

export const getDepartmentById = async (id: string) => {
  const response = await axiosClient.get(`/departments/${id}`);
  return response.data;
};

// Programs API
export const getPrograms = async () => {
  const response = await axiosClient.get("/programs");
  return response.data;
};

export const getProgramsByDepartment = async (departmentId: string) => {
  const response = await axiosClient.get(`/programs/department/${departmentId}`);
  return response.data;
};


// Syllabus API
export const getSyllabusByCourseId = async (courseId: string, academicYear: string = '2024-2025') => {
  // Get the latest syllabus for a course and academic year
  const response = await axiosClient.get(`/syllabuses/course/${courseId}/latest`, {
    params: { academicYear }
  });
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
  // backend expects 'keyword' param name according to docs
  const response = await axiosClient.get(`/syllabuses/search`, {
    params: { keyword: query }
  });
  return response.data;
};

// Admin API
export const getUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await axiosClient.post("/auth/register", {
    username: userData.username,
    password: userData.password,
    fullName: userData.fullName,
    email: userData.email,
    departmentId: userData.departmentId || null
  });
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await axiosClient.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await axiosClient.delete(`/users/${userId}`);
  return response.data;
};

export const lockUser = async (userId: string, userFullName?: string, userEmail?: string) => {
  const response = await axiosClient.put(`/users/${userId}`, { 
    status: 'SUSPENDED',
    fullName: userFullName || 'Unknown',
    email: userEmail || 'unknown@example.com'
  });
  return response.data;
};

export const unlockUser = async (userId: string, userFullName?: string, userEmail?: string) => {
  const response = await axiosClient.put(`/users/${userId}`, { 
    status: 'ACTIVE',
    fullName: userFullName || 'Unknown',
    email: userEmail || 'unknown@example.com'
  });
  return response.data;
};

export const resetPassword = async (userId: string, newPassword: string) => {
  // Backend doesn't have password reset endpoint
  // Instead, use auth/register or send notification
  console.warn('Password reset not supported by backend. User should use "Forgot Password" feature.');
  return Promise.resolve({ message: 'Please use forgot password feature' });
};

export const assignRoleToUser = async (userId: string, roleName: string) => {
  const response = await axiosClient.post(`/roles/assign`, {
    userId: parseInt(userId),
    roleName: roleName
  });
  return response.data;
};

export const removeRoleFromUser = async (userId: string, roleName: string) => {
  const response = await axiosClient.delete(`/roles/remove`, {
    params: { userId: parseInt(userId), roleName }
  });
  return response.data;
};

export const getAllRoles = async () => {
  const response = await axiosClient.get("/roles");
  return response.data;
};

export const getUserRoles = async (userId: string) => {
  const response = await axiosClient.get(`/roles/user/${userId}`);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await axiosClient.get("/admin/stats");
  return response.data;
};

// Audit Log API
export const getRecentAuditLogs = async (days: number = 7) => {
  const response = await axiosClient.get(`/syllabuses/audit-logs/recent`, {
    params: { days }
  });
  return response.data;
};

export const getAuditLogsByUser = async (username: string) => {
  const response = await axiosClient.get(`/syllabuses/audit-logs/user/${username}`);
  return response.data;
};

export const getAuditLogsByDateRange = async (startDate: string, endDate: string) => {
  const response = await axiosClient.get(`/syllabuses/audit-logs/date-range`, {
    params: { startDate, endDate }
  });
  return response.data;
};

export const getAuditLogsBySyllabus = async (syllabusId: string) => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/audit-logs`);
  return response.data;
};

// Notification API
export const getNotifications = async (page: number = 0, size: number = 20) => {
  const response = await axiosClient.get("/notifications", {
    params: { page, size }
  });
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await axiosClient.get("/notifications/unread");
  return response.data;
};

export const getNotificationStats = async () => {
  const response = await axiosClient.get("/notifications/stats");
  return response.data;
};

export const markNotificationAsRead = async (id: number) => {
  const response = await axiosClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.put("/notifications/read-all");
  return response.data;
};

export default axiosClient;
