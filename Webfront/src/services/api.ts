import axiosClient from '../api/axiosClient';
import aiAxiosClient from '../api/aiAxiosClient';

export interface Syllabus {
  syllabusId: number;
  course: {
    courseId: number;
    courseCode: string;
    courseName: string;
    credits: number;
    department?: {
      departmentId: number;
      deptName: string;
    };
  };
  program: { programName: string };
  lecturer: { fullName: string };
  versionNotes: string;
  academicYear?: string;
  currentStatus?: string;
  createdBy?: string;
  creator?: {
    fullName: string;
  };
}

// Interface for Principal detail view (flat structure from API)
export interface PrincipalSyllabusDetail {
  syllabusId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  deptId?: number;
  deptName?: string;
  programId?: number;
  programName?: string;
  lecturerId: number;
  lecturerName: string;
  lecturerEmail?: string;
  versionNo?: number;
  versionNotes?: string;
  academicYear?: string;
  currentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  publishedAt?: string | null;
  archivedAt?: string | null;
  isLatestVersion?: boolean;
  previousVersionId?: string | null;
}

export interface SessionPlanResponse {
  sessionId: number;
  syllabusId: number;
  weekNo: number;
  topic: string;
  teachingMethod: string;
}

export interface AssessmentResponse {
  assessmentId: number;
  syllabusId: number;
  name: string;
  weightPercent: number;
  criteria: string;
}

export interface MaterialResponse {
  materialId: number;
  syllabusId: number;
  title: string;
  author: string;
  materialType: string;
}

export interface SyllabusDetailResponse {
  id: number;
  courseCode: string;
  courseName: string;
  deptName: string;
  aiSumary: string;
  lecturerName: string;
  credit: number;
  academicYear: string;
  type: string;
  target: string[];
  sessionPlans: SessionPlanResponse[];
  assessments: AssessmentResponse[];
  materials: MaterialResponse[];
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



// Lấy tất cả syllabuses (alias rõ ràng)
export const getAllSyllabuses = async () => {
  const response = await axiosClient.get("/syllabuses");
  return response.data;
};

// Tạo syllabus mới
export const createSyllabus = async (syllabusData: any) => {
  const response = await axiosClient.post("/syllabuses", syllabusData);
  return response.data;
};

// Tạo syllabus từ phiên bản trước đó
export const createSyllabusFromVersion = async (syllabusData: any) => {
  const response = await axiosClient.post("/syllabuses/create-with-dto", syllabusData);
  return response.data;
};

// Tạo phiên bản syllabus mới
export const createSyllabusVersion = async (syllabusData: any) => {
  const response = await axiosClient.post("/syllabuses/create-version", syllabusData);
  return response.data;
};

// Cập nhật syllabus
export const updateSyllabus = async (syllabusId: number, syllabusData: any) => {
  const response = await axiosClient.put(`/syllabuses/${syllabusId}`, syllabusData);
  return response.data;
};

// Gửi syllabus cho HoD duyệt
export const submitSyllabusForReview = async (
  syllabusId: number,
  comment: string,
  returnToDraft: boolean = false
) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/submit-for-review`, {
    syllabusId,
    comment,
    returnToDraft,
  });
  return response.data;
};

// Xoa syllabus
export const deleteSyllabus = async (syllabusId: number) => {
  const response = await axiosClient.delete(`/syllabuses/${syllabusId}`);
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

export const getSyllabusById = async (syllabusId: number): Promise<Syllabus> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}`);
  return response.data;
};

// Get syllabus detail for Principal (returns flat structure)
export const getPrincipalSyllabusDetail = async (syllabusId: number): Promise<PrincipalSyllabusDetail> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}`);
  return response.data;
};

export const searchSyllabuses = async (query: string): Promise<Syllabus[]> => {
  // backend expects 'keyword' param name according to docs
  const response = await axiosClient.get(`/syllabuses/search`, {
    params: { keyword: query }
  });
  return response.data;
};

export const getSyllabusDetail = async (syllabusId: number): Promise<SyllabusDetailResponse> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/detail`);
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

// Course Subscriptions API
export const followCourse = async (courseId: number) => {
  const response = await axiosClient.post(`/courses/${courseId}/follow`);
  return response.data;
};

export const unfollowCourse = async (courseId: number) => {
  const response = await axiosClient.delete(`/courses/${courseId}/follow`);
  return response.data;
};

export const getFollowedCourses = async () => {
  const response = await axiosClient.get("/courses/following");
  return response.data;
};

// Dashboard Stats API for AA
export const getPendingApprovalsCount = async () => {
  try {
    const response = await axiosClient.get("/syllabuses/by-status/PENDING_APPROVAL");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return 0;
  }
};

export const getTotalPrograms = async () => {
  try {
    const response = await axiosClient.get("/programs");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return 0;
  }
};

export const getTotalPLOs = async () => {
  try {
    const response = await axiosClient.get("/plos");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching PLOs:", error);
    return 0;
  }
};

export const getApprovedCount = async () => {
  try {
    const response = await axiosClient.get("/syllabuses/by-status/APPROVED");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching approved syllabuses:", error);
    return 0;
  }
};

export const getRejectedCount = async () => {
  try {
    const response = await axiosClient.get("/syllabuses/by-status/REJECTED");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching rejected syllabuses:", error);
    return 0;
  }
};

export const getUnreadNotificationsCount = async () => {
  try {
    const response = await axiosClient.get("/notifications/unread");
    return (Array.isArray(response.data) ? response.data.length : 0);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return 0;
  }
};

// Reports API
export interface CreateReportRequest {
  title: string;
  description: string;
}

export interface ReportResponse {
  reportId: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  reporterId: number;
  reporterName: string;
  reporterEmail: string;
}

export const createReport = async (request: CreateReportRequest): Promise<ReportResponse> => {
  const response = await axiosClient.post("/reports", request);
  return response.data;
};

export const getMyReports = async (page: number = 0, size: number = 10) => {
  const response = await axiosClient.get("/reports/my-reports", {
    params: { page, size }
  });
  return response.data;
};

// AA-specific API calls
export const getSyllabusesByStatus = async (status: string): Promise<Syllabus[]> => {
  try {
    const response = await axiosClient.get(`/syllabuses/by-status/${status}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching syllabuses by status ${status}:`, error);
    return [];
  }
};

export const getPLOs = async () => {
  try {
    const response = await axiosClient.get("/plos");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching PLOs:", error);
    return [];
  }
};

export const approveSyllabusAA = async (syllabusId: number, comment: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/aa-approve`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

export const rejectSyllabusAA = async (syllabusId: number, comment: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/aa-reject`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

// Principal-specific API calls
export const getPrincipalPendingSyllabuses = async (): Promise<Syllabus[]> => {
  try {
    // Get syllabuses that are APPROVED (waiting for final principal approval)
    const response = await axiosClient.get(`/syllabuses/by-status/APPROVED`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching principal pending syllabuses:', error);
    return [];
  }
};

export const principalApproveSyllabus = async (syllabusId: number, comment: string = '') => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/principal-approve`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

export const principalRejectSyllabus = async (syllabusId: number, comment: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/principal-reject`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

// Lecturer API - Submit for review
export const submitForReview = async (syllabusId: number, comment: string = '') => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/submit-for-review`, {
    syllabusId,
    comment
  });
  return response.data;
};

// Academic Affairs specific API calls
export const aaApproveSyllabus = async (syllabusId: number, comment: string = '') => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/aa-approve`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

export const aaRejectSyllabus = async (syllabusId: number, comment: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/aa-reject`, {
    syllabusId,
    comment,
    returnToDraft: false
  });
  return response.data;
};

// Dashboard statistics for Principal
export const getPrincipalDashboardStats = async () => {
  try {
    const [
      pendingSyllabuses,
      allPrograms,
      allSyllabuses,
      notificationStats
    ] = await Promise.all([
      getPrincipalPendingSyllabuses(),
      getPrograms(),
      getAllSyllabuses(),
      getNotificationStats().catch(() => ({ totalUnread: 0, pendingApprovals: 0 }))
    ]);

    // Count active syllabuses (APPROVED or PUBLISHED)
    const activeSyllabuses = Array.isArray(allSyllabuses) 
      ? allSyllabuses.filter((s: Syllabus) => 
          s.currentStatus === 'APPROVED' || s.currentStatus === 'PUBLISHED'
        ).length 
      : 0;

    return {
      pendingApprovals: Array.isArray(pendingSyllabuses) ? pendingSyllabuses.length : 0,
      totalPrograms: Array.isArray(allPrograms) ? allPrograms.length : 0,
      activeSyllabuses,
      systemHealth: 98.5, // Mock data - can be removed or hidden
    };
  } catch (error) {
    console.error('Error fetching principal dashboard stats:', error);
    return {
      pendingApprovals: 0,
      totalPrograms: 0,
      activeSyllabuses: 0,
      systemHealth: 98.5,
    };
  }
};

// AI Service API
export const summarizeDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await aiAxiosClient.post('/summarize-async', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.summary || response.data;
};

export const uploadPdfForOCR = async (file: File): Promise<{ task_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await aiAxiosClient.post('/upload-ocr-async', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAITaskStatus = async (taskId: string): Promise<any> => {
  const response = await aiAxiosClient.get(`/task-status/${taskId}`);
  return response.data;
};

export default axiosClient;
