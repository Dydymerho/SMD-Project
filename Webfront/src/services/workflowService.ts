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

export const getSyllabusDetailForReview = async (syllabusId: number) => {
  try {
    // use detail endpoint to retrieve full syllabus structure (CLOs, modules, assessments, etc.)
    const response = await axiosClient.get(`/syllabuses/${syllabusId}/detail`);
    const data = response.data || {};
    
    console.log('API response data:', data);
    console.log('All keys in API response:', Object.keys(data));
    console.log('data.currentStatus:', data.currentStatus);
    console.log('data.status:', data.status);
    console.log('data.sessionPlans:', data.sessionPlans);
    console.log('data.assessments:', data.assessments);
    console.log('data.aiSummary:', data.aiSummary);

    // Fetch CLOs from separate endpoint if not in main response
    let closData: any[] = [];

    try {
      closData = await getSyllabusClos(syllabusId);
      console.log('CLOs from separate API:', closData);
    } catch (e) {
      console.error('Error fetching CLOs:', e);
    }

    const course = data.course || {};

    // Normalize CLOs (backend may use various field names)
    const clos = (() => {
      let closArray: any[] = [];
      
      // First try from separate API data
      if (closData && closData.length > 0) closArray = closData;
      // Then try from main response
      else if (Array.isArray(data.clos)) closArray = data.clos;
      else if (Array.isArray(data.cclos)) closArray = data.cclos;
      else if (Array.isArray(data.courseOutcomes)) closArray = data.courseOutcomes;
      else if (Array.isArray(data.courseLearningOutcomes)) closArray = data.courseLearningOutcomes;
      else if (Array.isArray(data.learningOutcomes)) closArray = data.learningOutcomes;
      else if (Array.isArray(data.outcomes)) closArray = data.outcomes;
      else if (Array.isArray(data.objectives)) closArray = data.objectives;
      else if (Array.isArray(data.goals)) closArray = data.goals;
      // Try from nested structures
      else if (data.courseInfo?.clos && Array.isArray(data.courseInfo.clos)) closArray = data.courseInfo.clos;
      else if (data.syllabus?.clos && Array.isArray(data.syllabus.clos)) closArray = data.syllabus.clos;
      else if (course?.clos && Array.isArray(course.clos)) closArray = course.clos;
      
      // Normalize to strings
      return closArray.map((clo: any) => {
        if (typeof clo === 'string') return clo;
        if (typeof clo === 'object') return clo.description || clo.name || clo.text || JSON.stringify(clo);
        return String(clo);
      });
    })();
    
    console.log('Normalized CLOs:', clos);

    // Normalize modules/contents (prefer sessionPlans)
    const modules = (() => {
      let modulesArray: any[] = [];
      
      // Prefer sessionPlans from response
      if (Array.isArray(data.sessionPlans)) modulesArray = data.sessionPlans;
      else if (Array.isArray(data.modules)) modulesArray = data.modules;
      else if (Array.isArray(data.courseOutline)) modulesArray = data.courseOutline;
      else if (Array.isArray(data.weeklyPlans)) modulesArray = data.weeklyPlans;
      else if (Array.isArray(data.sessions)) modulesArray = data.sessions;
      else if (Array.isArray(data.contents)) modulesArray = data.contents;
      
      return modulesArray.map((m: any, idx: number) => ({
        moduleNo: m.sessionId || m.weekNo || m.moduleNo || m.week || m.order || idx + 1,
        moduleName: m.topic || m.title || m.moduleName || m.name || `Session ${idx + 1}`,
        // Handle topics - could be array, string, or nested object
        topics: Array.isArray(m.topics) 
          ? m.topics.map((t: any) => typeof t === 'string' ? t : (t.name || t.title || JSON.stringify(t)))
          : (typeof m.topic === 'string' ? [m.topic] : (m.contents || m.details || m.items || m.topics || [])),
        hours: m.hours || m.duration || m.totalHours || 0,
      }));
    })();
    
    console.log('Normalized modules/sessions:', modules);

    // Normalize assessments
    const assessments = (() => {
      let assessmentArray: any[] = [];
      
      if (Array.isArray(data.assessments)) assessmentArray = data.assessments;
      else if (Array.isArray(data.assessmentMethods)) assessmentArray = data.assessmentMethods;
      else if (Array.isArray(data.evaluation)) assessmentArray = data.evaluation;
      
      return assessmentArray.map((a: any, idx: number) => {
        const criteria = a.criteria || a.criteriaDescription || a.rubric || '';
        const baseDesc = a.description || a.detail || a.content || '';
        const mergedDesc = criteria
          ? `${baseDesc ? baseDesc + ' | ' : ''} ${criteria}`
          : baseDesc;
        return {
          type: a.type || a.method || a.name || `Hình thức ${idx + 1}`,
          percentage: a.percentage || a.weight || a.weightPercent || 0,
          description: mergedDesc || 'Chưa có mô tả'
        };
      });
    })();
    
    console.log('Normalized assessments:', assessments);

    // Normalize changes/history
    const changes = Array.isArray(data.changes) ? data.changes : data.changeLog || [];

    const result = {
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
      description: data.description || data.overview || data.content || data.summary || 'Chưa có mô tả',
      aiSummary: data.aiSummary || data.aiSumary || null,
      currentStatus: data.currentStatus || data.status || 'DRAFT',
      rejectionReason: data.rejectionReason || data.rejectionNote || undefined,
      clos,
      modules,
      assessments,
      changes
    };

    console.log('Final result to return:', result);
    console.log('clos count:', clos.length);
    console.log('modules count:', modules.length);
    console.log('assessments count:', assessments.length);
    console.log('aiSummary:', result.aiSummary);
    
    return result;
  } catch (error) {
    console.error('Error fetching syllabus detail for review:', error);
    throw error;
  }
};

// Get CLOs for a syllabus
export const getSyllabusClos = async (syllabusId: number) => {
  try {
    // Try multiple endpoints to get CLOs
    const endpoints = [
      `/syllabuses/${syllabusId}/clos`,
      `/clos?syllabusId=${syllabusId}`,
      `/syllabuses/${syllabusId}/course-learning-outcomes`,
      `/syllabuses/${syllabusId}/outcomes`,
      `/course-outcomes?syllabusId=${syllabusId}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axiosClient.get(endpoint);
        let data = response.data || {};
        
        // Handle different response formats
        let closArray: any[] = [];
        
        if (Array.isArray(data)) {
          closArray = data;
        } else if (Array.isArray(data.data)) {
          closArray = data.data;
        } else if (Array.isArray(data.clos)) {
          closArray = data.clos;
        }
        
        // Filter by syllabusId if needed (in case endpoint returns all CLOs)
        closArray = closArray.filter((clo: any) => {
          const cloSyllabusId = clo.syllabusId || clo.syllabusID || clo.syllabusId || null;
          return !cloSyllabusId || cloSyllabusId === syllabusId;
        });
        
        if (closArray.length > 0) {
          console.log(`CLOs loaded from ${endpoint}:`, closArray);
          return closArray;
        }
      } catch (e) {
        // Try next endpoint
        console.log(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }
    
    console.log('No CLOs endpoint found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching syllabus CLOs:', error);
    return [];
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
