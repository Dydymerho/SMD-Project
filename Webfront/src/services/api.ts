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
  description?: string;
  lecturerName: string;
  credit: number;
  academicYear: string;
  type: string;
  target: string[];
  sessionPlans: SessionPlanResponse[];
  assessments: AssessmentResponse[];
  materials: MaterialResponse[];
}

// Course Relations API
export interface CourseRelationResponse {
  relationId: number;
  targetCourseId: number;
  targetCourseCode: string;
  targetCourseName: string;
  credits?: number;
  deptName?: string;
  relationType: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT';
}

// Raw API response structure for course relations
interface CourseRelationRawResponse {
  relationId: number;
  relatedCourse: {
    courseId: number;
    courseCode: string;
    courseName: string;
    credits: number;
    department?: {
      departmentId: number;
      deptName: string;
    };
    courseType?: string | null;
  };
  relationType: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT';
}

// Course Relation Create Request
export interface CreateCourseRelationRequest {
  sourceCourseId: number;
  targetCourseId: number;
  relationType: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT';
}

// Available Prerequisites Response
export interface AvailablePrerequisiteResponse {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  deptName?: string;
}

// CLO (Course Learning Outcomes) API
export interface CLOResponse {
  cloId: number;
  syllabusId: number;
  cloCode: string;
  cloDescription: string;
}

// PLO (Program Learning Outcomes) API
export interface PLOResponse {
  ploId: number;
  programId: number;
  ploCode: string;
  ploDescription: string;
}

// CLO-PLO Mapping
export interface CLOPLOMappingResponse {
  mappingId: number;
  cloId: number;
  cloCode: string;
  cloDescription: string;
  ploId: number;
  ploCode: string;
  ploDescription: string;
  mappingLevel: 'LOW' | 'MEDIUM' | 'HIGH';
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

// Course Relations API
export const getCourseRelations = async (courseId: number): Promise<CourseRelationResponse[]> => {
  const response = await axiosClient.get<CourseRelationRawResponse[]>(`/courses/${courseId}/relations`);
  
  // Transform raw response to frontend format
  return response.data.map(item => ({
    relationId: item.relationId,
    targetCourseId: item.relatedCourse.courseId,
    targetCourseCode: item.relatedCourse.courseCode,
    targetCourseName: item.relatedCourse.courseName,
    credits: item.relatedCourse.credits,
    deptName: item.relatedCourse.department?.deptName,
    relationType: item.relationType
  }));
};

export const getAllCourseRelations = async (): Promise<{
  courseId: number;
  courseCode: string;
  courseName: string;
  relations: CourseRelationResponse[];
}[]> => {
  const courses = await getCourses();
  const relationsPromises = courses.map(async (course: any) => {
    try {
      const relations = await getCourseRelations(course.courseId);
      return {
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        relations
      };
    } catch (error) {
      return {
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        relations: []
      };
    }
  });
  
  const allRelations = await Promise.all(relationsPromises);
  return allRelations.filter(item => item.relations.length > 0);
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

// Course Relations API - Get relationship tree for a course
export const getCourseRelationsByCourseId = async (courseId: number): Promise<CourseRelationResponse[]> => {
  const response = await axiosClient.get(`/courses/${courseId}/relations`);
  let data: CourseRelationRawResponse[] = [];
  
  // Handle different response formats
  if (Array.isArray(response.data)) {
    data = response.data;
  } else if (response.data && Array.isArray(response.data.relations)) {
    data = response.data.relations;
  }
  
  // Transform raw response to CourseRelationResponse format
  return data.map((item) => ({
    relationId: item.relationId,
    targetCourseId: item.relatedCourse.courseId,
    targetCourseCode: item.relatedCourse.courseCode,
    targetCourseName: item.relatedCourse.courseName,
    credits: item.relatedCourse.credits,
    deptName: item.relatedCourse.department?.deptName,
    relationType: item.relationType
  }));
};

// Create a new course relation
export const createCourseRelation = async (request: CreateCourseRelationRequest): Promise<CourseRelationResponse> => {
  const token = localStorage.getItem('token');
  const response = await axiosClient.post('/v1/course-relations', {
    courseId: request.sourceCourseId,
    relatedCourseId: request.targetCourseId,
    relationType: request.relationType
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  } as any);
  
  // Transform response if needed
  const item = response.data;
  return {
    relationId: item.relationId,
    targetCourseId: item.relatedCourse?.courseId || item.relatedCourseId || item.targetCourseId,
    targetCourseCode: item.relatedCourse?.courseCode || item.relatedCourseCode || item.targetCourseCode,
    targetCourseName: item.relatedCourse?.courseName || item.relatedCourseName || item.targetCourseName,
    credits: item.relatedCourse?.credits || item.credits,
    deptName: item.relatedCourse?.department?.deptName || item.deptName,
    relationType: item.relationType
  };
};

// Delete a course relation
export const deleteCourseRelation = async (relationId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axiosClient.delete(`/v1/course-relations/${relationId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  } as any);
};

// Get available prerequisites for a course
export const getAvailablePrerequisites = async (courseId: number): Promise<AvailablePrerequisiteResponse[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosClient.get(`/v1/course-relations/available-prerequisites/${courseId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    } as any);
    
    console.log('Raw API response:', response.data);
    
    // Handle different response formats
    let data = response.data;
    
    // If response is wrapped in an object, unwrap it
    if (data && !Array.isArray(data) && typeof data === 'object') {
      if (Array.isArray(data.courses)) {
        data = data.courses;
      } else if (Array.isArray(data.data)) {
        data = data.data;
      } else if (Array.isArray(data.availableCourses)) {
        data = data.availableCourses;
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(data)) {
      console.warn('API response is not an array:', data);
      return [];
    }
    
    console.log('Processed data:', data);
    
    // Transform to expected format
    return data.map((course: any) => ({
      courseId: course.relatedCourseId || course.courseId,
      courseCode: course.relatedCourseCode || course.courseCode,
      courseName: course.relatedCourseName || course.courseName,
      credits: course.relatedCourseCredits || course.credits,
      deptName: course.relatedCourseDeptName || course.department?.deptName || course.deptName
    }));
  } catch (error) {
    console.error('Error fetching available prerequisites:', error);
    throw error;
  }
};

// Check if adding a relation would create circular dependency
export const checkCircularDependency = async (
  sourceCourseId: number,
  targetCourseId: number,
  relationType: 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT'
): Promise<{ circular: boolean; message?: string }> => {
  const token = localStorage.getItem('token');
  const response = await axiosClient.get('/v1/course-relations/check-circular', {
    params: { sourceCourseId, targetCourseId, relationType },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  } as any);
  return response.data;
};

// CLO API - Get CLOs by Syllabus ID
export const getCLOsBySyllabusId = async (syllabusId: number): Promise<CLOResponse[]> => {
  const response = await axiosClient.get(`/clos/syllabus/${syllabusId}`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.clos)) {
    return response.data.clos;
  }
  return [];
};

// PLO API - Get PLOs by Program ID
export const getPLOsByProgramId = async (programId: number): Promise<PLOResponse[]> => {
  const response = await axiosClient.get(`/plos/program/${programId}`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.plos)) {
    return response.data.plos;
  }
  return [];
};

// CLO-PLO Mappings API - Get mappings by Syllabus ID
export const getCLOPLOMappingsBySyllabusId = async (syllabusId: number): Promise<CLOPLOMappingResponse[]> => {
  const response = await axiosClient.get(`/clo-plo-mappings/syllabus/${syllabusId}`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.mappings)) {
    return response.data.mappings;
  }
  return [];
};

// PDF API - Get PDF information
export interface SyllabusPDFInfo {
  syllabusId: number;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  uploadedAt?: string;
  message?: string;
}

export const getSyllabusPDFInfo = async (syllabusId: number): Promise<SyllabusPDFInfo> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/pdf-info`);
  return response.data;
};

// PDF API - Download PDF document
export const downloadSyllabusPDF = async (syllabusId: number): Promise<Blob> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/download-pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

// Admin API
export interface BulkUserImportError {
  rowNumber: number;
  fullName?: string;
  email?: string;
  roleCode?: string;
  departmentCode?: string;
  errorMessage: string;
}

export interface BulkUserImportResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  message?: string;
  errors?: BulkUserImportError[];
}

export const getUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

export const downloadBulkUserImportTemplate = async (): Promise<Blob> => {
  const token = localStorage.getItem('token');
  const config = {
    responseType: 'blob' as const,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    skipAuthRedirect: true
  };
  const response = await (axiosClient.get as any)("/users/bulk-import/template", config);
  return response.data;
};

export const bulkImportUsers = async (file: File): Promise<BulkUserImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    skipAuthRedirect: true
  };
  const response = await (axiosClient.post as any)("/users/bulk-import", formData, config);
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
      allSyllabuses
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
export const summarizeDocument = async (file: File, syllabusId?: number): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  if (syllabusId) {
    formData.append('syllabusId', String(syllabusId));
  }

  const response = await axiosClient.post('/ai/summarize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadPdfForOCR = async (file: File): Promise<{ taskId: string; status?: string; message?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post('ai/summarize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const raw = response.data || {};
  const taskId = String(raw.taskId ?? raw.aiTaskId ?? raw.id ?? '');

  return {
    taskId,
    status: raw.status,
    message: raw.message,
  };
};

export const getAITaskStatus = async (taskId: string | number): Promise<any> => {
  const response = await axiosClient.get(`ai/tasks/${taskId}`);
  return response.data;
};

export default aiAxiosClient;
