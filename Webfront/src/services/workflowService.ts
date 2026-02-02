import axiosClient from '../api/axiosClient';

export interface Proposal {
  id?: string;
  syllabusId?: number;
  type?: 'program' | 'plo_change' | 'syllabus' | 'strategic';
  title?: string;
  courseCode?: string;
  courseName?: string;
  department?: string;
  submittedBy?: string;
  submissionDate?: string;
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  rationale?: string;
  expectedOutcome?: string;
  affectedPrograms?: string[];
  budget?: number;
  timeline?: string;
  version?: number;
  approvalHistory?: ApprovalHistory[];
  lecturerName?: string;
  currentStatus?: string;
  academicYear?: string;
}

export interface ApprovalHistory {
  level: string;
  approver: string;
  date: string;
  status: string;
  notes?: string;
}

export interface WorkflowRequest {
  syllabusId: number;
  actionType: string;
  notes?: string;
  rejectionReason?: string;
}

// HoD Dashboard Stats API
export const getHoDDashboardStats = async (departmentId?: number) => {
  try {
    // Use existing /syllabuses/by-status endpoints
    const [pendingReview, pendingApproval, approved] = await Promise.all([
      axiosClient.get('/syllabuses/by-status/PENDING_REVIEW'),
      axiosClient.get('/syllabuses/by-status/PENDING_APPROVAL'),
      axiosClient.get('/syllabuses/by-status/APPROVED')
    ]);
    
    return {
      pendingApprovals: pendingReview.data?.length || 0,
      collaborativeReviewActive: 0, // Not available from backend yet
      totalSyllabusInDept: (pendingReview.data?.length || 0) + (pendingApproval.data?.length || 0) + (approved.data?.length || 0),
      recentNotifications: 0 // Not available from backend yet
    };
  } catch (error) {
    console.error('Error fetching HoD dashboard stats:', error);
    return {
      pendingApprovals: 0,
      collaborativeReviewActive: 0,
      totalSyllabusInDept: 0,
      recentNotifications: 0
    };
  }
};

// Syllabus APIs
export const fetchAllSyllabuses = async () => {
  try {
    const response = await axiosClient.get('/syllabuses');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching syllabuses:', error);
    return { data: [] };
  }
};

export const fetchSyllabusByDepartment = async (departmentId: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses?departmentId=${departmentId}`);
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching syllabuses by department:', error);
    return { data: [] };
  }
};

export const fetchSyllabusById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const getSyllabusById = fetchSyllabusById;

export const getSyllabusDetailForReview = async (syllabusId: number) => {
  try {
    // use detail endpoint to retrieve full syllabus structure (CLOs, modules, assessments, etc.)
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/detail`);
    const data = response.data || {};
    
    console.log('API response data:', data);
    console.log('All keys in API response:', Object.keys(data));
    console.log('data.currentStatus:', data.currentStatus);
    console.log('data.status:', data.status);
    console.log('data.state:', data.state);
    console.log('data.workflowStatus:', data.workflowStatus);
    console.log('data.syllabusStatus:', data.syllabusStatus);
    console.log('data.reviewStatus:', data.reviewStatus);

    const course = data.course || {};

    // Normalize CLOs (backend may use various field names)
    const clos = (() => {
      if (Array.isArray(data.clos)) return data.clos;
      if (Array.isArray(data.cclos)) return data.cclos;
      if (Array.isArray(data.courseOutcomes)) return data.courseOutcomes;
      if (Array.isArray(data.courseLearningOutcomes)) return data.courseLearningOutcomes;
      if (Array.isArray(data.learningOutcomes)) return data.learningOutcomes;
      if (Array.isArray(data.outcomes)) return data.outcomes;
      if (Array.isArray(data.objectives)) return data.objectives;
      if (Array.isArray(data.goals)) return data.goals;
      // Try from nested structures
      if (data.courseInfo?.clos && Array.isArray(data.courseInfo.clos)) return data.courseInfo.clos;
      if (data.syllabus?.clos && Array.isArray(data.syllabus.clos)) return data.syllabus.clos;
      if (course?.clos && Array.isArray(course.clos)) return course.clos;
      return [];
    })();

    // Normalize modules/contents
    const modules = (() => {
      if (Array.isArray(data.modules)) return data.modules;
      if (Array.isArray(data.courseOutline)) return data.courseOutline;
      if (Array.isArray(data.weeklyPlans)) return data.weeklyPlans;
      if (Array.isArray(data.sessions)) return data.sessions;
      if (Array.isArray(data.contents)) return data.contents;
      return [];
    })();

    // Normalize assessments
    const assessments = (() => {
      if (Array.isArray(data.assessments)) return data.assessments;
      if (Array.isArray(data.assessmentMethods)) return data.assessmentMethods;
      if (Array.isArray(data.evaluation)) return data.evaluation;
      return [];
    })();

    // Normalize changes/history
    const changes = Array.isArray(data.changes) ? data.changes : data.changeLog || [];

    return {
      id: String(data.syllabusId || data.id),
      courseCode: course.courseCode || data.courseCode || 'N/A',
      courseName: course.courseName || data.courseName || 'Giáo trình không tên',
      credits: course.credits || data.credits || 0,
      lecturer: {
        name: data.lecturerName || data.lecturer?.fullName || data.createdBy?.fullName || 'Chưa rõ',
        email: data.lecturer?.email || data.createdBy?.email || 'N/A'
      },
      version: data.version || 1,
      submissionDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      academicYear: data.academicYear || 'Chưa xác định',
      description: data.description || data.content || data.summary || 'Chưa có mô tả',
      currentStatus: data.currentStatus || data.status || 'DRAFT',
      rejectionReason: data.rejectionReason || data.rejectionNote || undefined,
      clos,
      modules: modules.map((m: any, idx: number) => ({
        moduleNo: m.moduleNo || m.module || m.week || m.order || idx + 1,
        moduleName: m.moduleName || m.title || m.topic || m.name || `Module ${idx + 1}`,
        topics: Array.isArray(m.topics) ? m.topics : (m.topic ? [m.topic] : (m.contents || m.details || [])),
        hours: m.hours || m.duration || m.totalHours || 0,
      })),
      assessments: assessments.map((a: any, idx: number) => {
        const criteria = a.criteria || a.criteriaDescription || a.rubric || '';
        const baseDesc = a.description || a.detail || '';
        const mergedDesc = criteria
          ? `${baseDesc ? baseDesc + ' | ' : ''} ${criteria}`
          : baseDesc;
        return {
          type: a.type || a.method || a.name || `Hình thức ${idx + 1}`,
          percentage: a.percentage || a.weight || a.weightPercent || 0,
          description: mergedDesc
        };
      }),
      changes
    };
  } catch (error) {
    console.error('Error fetching syllabus detail for review:', error);
    throw error;
  }
};

export const searchSyllabuses = async (keyword: string) => {
  try {
    const response = await axiosClient.get(`/syllabuses/search?keyword=${keyword}`);
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error searching syllabuses:', error);
    return { data: [] };
  }
};

// Workflow & Approval APIs
export const getPendingSyllabusesForHoD = async (departmentId?: number) => {
  try {
    // Use existing endpoint - backend auto-filters by user's department
    // Try /syllabuses endpoint first to get all syllabuses, then filter in frontend
    const response = await axiosClient.get('/syllabuses');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching pending syllabuses for HoD:', error);
    return { data: [] };
  }
};

export const getPendingSyllabusesForAA = async () => {
  try {
    const response = await axiosClient.get('/syllabuses/by-status/PENDING_APPROVAL');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching pending syllabuses for AA:', error);
    return { data: [] };
  }
};

export const getPendingProposalsForPrincipal = async () => {
  try {
    // Principal reviews APPROVED syllabuses for final signature
    const response = await axiosClient.get('/syllabuses/by-status/APPROVED');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching pending proposals for Principal:', error);
    return { data: [] };
  }
};

export const getSyllabusWorkflowHistory = async (syllabusId: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/workflow-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow history:', error);
    return { approvalHistory: [] };
  }
};

export const approveSyllabus = async (syllabusId: number, notes?: string) => {
  try {
    const response = await axiosClient.post(`/syllabuses/${syllabusId}/hod-approve`, {
      comment: notes || '',
      syllabusId: syllabusId
    });
    return response.data;
  } catch (error) {
    console.error('Error approving syllabus:', error);
    throw error;
  }
};

export const rejectSyllabus = async (syllabusId: number, rejectionReason: string) => {
  try {
    const response = await axiosClient.post(`/syllabuses/${syllabusId}/hod-reject`, {
      comment: rejectionReason,
      syllabusId: syllabusId
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting syllabus:', error);
    throw error;
  }
};

// Program APIs
export const fetchAllPrograms = async () => {
  try {
    const response = await axiosClient.get('/programs');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching programs:', error);
    return { data: [] };
  }
};

// Department APIs
export const fetchAllDepartments = async () => {
  try {
    const response = await axiosClient.get('/departments');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { data: [] };
  }
};

// Statistics APIs
export const getApprovalStats = async () => {
  try {
    const response = await axiosClient.get('/statistics/approvals');
    return response.data;
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    return {
      totalPending: 0,
      pendingLevel1: 0,
      pendingLevel2: 0,
      pendingFinal: 0,
      completionRate: 0
    };
  }
};

export const getDepartmentStats = async () => {
  try {
    const response = await axiosClient.get('/statistics/departments');
    return { 
      data: Array.isArray(response.data) ? response.data : response.data?.data || [] 
    };
  } catch (error) {
    console.error('Error fetching department stats:', error);
    return { data: [] };
  }
};

// Review Comments APIs
export const getReviewComments = async (syllabusId: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/comments/recent`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching recent comments:', error);
    return [];
  }
};

export const getReviewCommentCount = async (syllabusId: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/comments/count`);
    return typeof response.data === 'number' ? response.data : 0;
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }
};

// Create Collaborative Review (tạo comment để collaborative review)
export const createCollaborativeReview = async (syllabusId: number, description: string, deadline?: string, participants?: string[]) => {
  try {
    // Collaborative review được implement bằng cách tạo comments
    const response = await axiosClient.post(`/syllabuses/${syllabusId}/comments`, {
      content: description,
      type: 'COLLABORATIVE_REVIEW'
    });
    return response.data;
  } catch (error) {
    console.error('Error creating collaborative review:', error);
    throw error;
  }
};

// Get all comments for a syllabus (for collaborative review)
export const getAllComments = async (syllabusId: number) => {
  try {
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/comments/all`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
};

// Add comment to syllabus
export const addComment = async (syllabusId: number, content: string) => {
  try {
    const response = await axiosClient.post(`/syllabuses/${syllabusId}/comments`, {
      content,
      type: 'REVIEW'
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Delete comment
export const deleteComment = async (syllabusId: number, commentId: number) => {
  try {
    await axiosClient.delete(`/syllabuses/${syllabusId}/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get users by role (for selecting participants)
export const getUsersByRole = async (role: string) => {
  try {
    const response = await axiosClient.get(`/users`, {
      params: { role }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};

// Get collaborative reviews for Lecturer
export const getCollaborativeReviewsForLecturer = async () => {
  try {
    // Fetch all syllabuses
    const response = await axiosClient.get('/syllabuses');
    const syllabuses = Array.isArray(response.data) ? response.data : response.data?.data || [];
    
    // Filter syllabuses that are available for collaborative review:
    // Only show syllabuses in PENDING_REVIEW or PENDING_APPROVAL status
    // These are the ones that HoD has opened for collaborative review
    const collaborativeReviews = syllabuses.filter((s: any) => {
      const status = s.currentStatus || '';
      return status === 'PENDING_REVIEW' || status === 'PENDING_APPROVAL';
    });
    
    return { data: collaborativeReviews };
  } catch (error) {
    console.error('Error fetching collaborative reviews for lecturer:', error);
    return { data: [] };
  }
};
