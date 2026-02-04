import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, FileText, BookOpen, Bell, User, Clock, CheckCircle, 
  Edit, Eye, Plus, FolderOpen, GitCompare, MessageSquare, AlertCircle, 
  Filter, Download, Upload, Star, Trash2, Send, X, MessageCircle, Loader, Users
} from 'lucide-react';
import './DashboardPage.css';
import Toast, { useToast } from '../../components/Toast';
import NotificationMenu from '../../components/NotificationMenu';
import { 
  getAllSyllabuses,
  searchSyllabuses,
  createReport,
  getNotifications,
  followCourse,
  unfollowCourse,
  submitSyllabusForReview,
  createSyllabusVersion,
  deleteSyllabus,
} from '../../services/api';
import { getCollaborativeReviewsForLecturer, getReviewCommentCount } from '../../services/workflowService';
import axiosClient from '../../api/axiosClient';

interface Syllabus {
  syllabusId: number;
  courseId: number;
  id: string; // courseCode for routing
  name: string;
  semester?: string;
  status?: string;
  lastUpdated?: string;
  version: string;
  instructor?: string;
  lecturerEmail?: string;
  deptName?: string;
  programName?: string;
  credit?: number;
  aiSummary?: string;
  submittedDate?: string;
  approvedDate?: string;
  comments?: number;
  following?: boolean;
  collaborators?: number;
}

interface APISyllabus {
  syllabusId: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  lecturerId: number;
  lecturerName: string;
  lecturerEmail: string;
  deptName: string;
  academicYear: string;
  versionNo: number;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  isLatestVersion: boolean;
  previousVersionId: number | null;
  versionNotes: string | null;
  pdfFileName: string | null;
  pdfUploadedAt: string | null;
  programId: number;
  programName: string;
  aiSumary: string | null;
  credit: number;
}

const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-syllabi' | 'collaborative' | 'discussion-sessions' | 'search' | 'management'>('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Data states
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [searchResults, setSearchResults] = useState<Syllabus[]>([]);
  const [collaborativeSyllabi, setCollaborativeSyllabi] = useState<Syllabus[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
    // Discussion sessions state
    const [discussionReviews, setDiscussionReviews] = useState<any[]>([]);
    const [discussionLoading, setDiscussionLoading] = useState(false);
    const [discussionError, setDiscussionError] = useState<string | null>(null);
    const [discussionFilter, setDiscussionFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('active');
  
  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentSyllabus, setCurrentSyllabus] = useState<Syllabus | null>(null);
  const [currentSyllabusCode, setCurrentSyllabusCode] = useState<string>('');
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('content_error');
  const [commentContent, setCommentContent] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lecturer specific stats - will be calculated from API data
  const [stats, setStats] = useState({
    totalSyllabi: 0,
    inProgress: 0,
    pendingApproval: 0,
    approved: 0,
    collaborative: 0,
    followed: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchSyllabuses();
    if (activeTab === 'discussion-sessions') {
      loadDiscussionReviews();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim().length > 0) {
      handleSearchSyllabuses(searchQuery);
    } else if (activeTab === 'search') {
      setSearchResults([]);
    }
    // eslint-disable-next-line
  }, [searchQuery, activeTab]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(0, 100);
        if (data.content) {
          const unread = data.content.filter((n: any) => !n.isRead).length;
          setUnreadNotificationCount(unread);
        }
      } catch (error) {
        console.error('Lỗi lấy thông báo:', error);
      }
    };
    fetchNotifications();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load discussion reviews
  const loadDiscussionReviews = async () => {
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const result = await getAllSyllabuses();
      const list = Array.isArray(result) ? result : (Array.isArray(result.data) ? result.data : []);

      // Map all syllabuses and filter those with comments (active collaborative reviews)
      const mapped = await Promise.all(list.map(async (item: any) => {
        const syllabusId = item.syllabusId || item.id;
        const feedbackCount = syllabusId ? await getReviewCommentCount(syllabusId) : 0;

        // Skip syllabuses with no comments (no collaborative review)
        if (feedbackCount === 0) return null;

        // Count my comments
        let myCommentCount = 0;
        let allComments: any[] = [];
        try {
          if (syllabusId) {
            const commentsResponse = await axiosClient.get(
              `/syllabuses/${syllabusId}/comments/all`
            );
            allComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
            myCommentCount = allComments.filter(
              c => c.author?.username === user?.username
            ).length;
          }
        } catch (err) {
          console.log('Could not fetch comments:', err);
        }

        // Count unique participants
        const uniqueParticipants = new Set(allComments.map(c => c.author?.username).filter(Boolean));

        // Determine status
        let status: 'active' | 'pending' | 'completed' = 'active';
        if (item.currentStatus?.toLowerCase().includes('approved')) {
          status = 'completed';
        } else if (feedbackCount === 0) {
          status = 'pending';
        }

        return {
          id: (syllabusId || '').toString(),
          courseCode: item.courseCode || item.course?.courseCode || 'N/A',
          courseName: item.courseName || item.course?.courseName || 'Giáo trình không tên',
          dueDate: item.updatedAt || item.createdAt || new Date().toISOString(),
          status,
          participantCount: uniqueParticipants.size,
          feedbackCount,
          lecturer: item.lecturerName || item.lecturer?.fullName || item.createdBy?.fullName || 'Chưa rõ',
          lecturerEmail: item.lecturer?.email || item.createdBy?.email || '',
          myCommentCount,
          isFinalized: status === 'completed'
        };
      }));

      // Filter out null values (syllabuses without comments)
      const filteredReviews = mapped.filter(Boolean);
      setDiscussionReviews(filteredReviews);
    } catch (err) {
      console.error('Error loading discussion reviews:', err);
      setDiscussionError('Không thể tải danh sách thảo luận');
    } finally {
      setDiscussionLoading(false);
    }
  };

  const fetchSyllabuses = async () => {
    try {
      setLoadingData(true);
      const data = await getAllSyllabuses();
      console.log('API getAllSyllabuses raw data:', data);
      const converted = (data as unknown as APISyllabus[]).map((s: APISyllabus) => ({
          syllabusId: s.syllabusId,
          courseId: s.courseId,
          id: s.courseCode,
          name: s.courseName,
          semester: s.academicYear,
          status: mapStatus(s.currentStatus),
          lastUpdated: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : 'N/A',
          version: s.versionNo ? `v${s.versionNo}` : 'v1.0',
          instructor: s.lecturerName,
          lecturerEmail: s.lecturerEmail,
          deptName: s.deptName,
          programName: s.programName,
          credit: s.credit,
          aiSummary: s.aiSumary || undefined,
          following: false,
          comments: 0,
      }));
      setSyllabuses(converted);
      
      // Load collaborative reviews for lecturer
      try {
        const collaborativeData = await getCollaborativeReviewsForLecturer();
        console.log('Collaborative data:', collaborativeData);
        const collaborativeList = Array.isArray(collaborativeData.data) ? collaborativeData.data : [];
        console.log('Collaborative list:', collaborativeList);
        
        // Map collaborative syllabi with comment counts
        const collaborativeConverted = await Promise.all(
          collaborativeList.map(async (s: APISyllabus) => {
            const commentCount = await getReviewCommentCount(s.syllabusId);
            return {
              syllabusId: s.syllabusId,
              courseId: s.courseId,
              id: s.courseCode,
              name: s.courseName,
              submittedDate: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : 'N/A',
              version: s.versionNo ? `v${s.versionNo}` : 'v1.0',
              instructor: s.lecturerName,
              collaborators: 1,
              comments: commentCount,
            };
          })
        );
        
        console.log('Collaborative converted:', collaborativeConverted);
        setCollaborativeSyllabi(collaborativeConverted);
      } catch (err) {
        console.log('Could not fetch collaborative reviews:', err);
        setCollaborativeSyllabi([]);
      }
    } catch (error) {
      setSyllabuses([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSearchSyllabuses = async (query: string) => {
    setLoadingData(true);
    try {
      const data = await searchSyllabuses(query);
        const converted = (data as unknown as APISyllabus[]).map((s: APISyllabus) => ({
          syllabusId: s.syllabusId,
          courseId: s.courseId,
          id: s.courseCode,
          name: s.courseName,
          semester: s.academicYear,
          status: mapStatus(s.currentStatus),
          lastUpdated: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : 'N/A',
          version: s.versionNo ? `v${s.versionNo}` : 'v1.0',
          instructor: s.lecturerName,
          lecturerEmail: s.lecturerEmail,
          deptName: s.deptName,
          programName: s.programName,
          credit: s.credit,
          aiSummary: s.aiSumary || undefined,
          following: false,
          comments: 0,
        }));
      setSearchResults(converted);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoadingData(false);
    }
  };

  const mapStatus = (status?: string): string => {
    if (!status) return 'Đang soạn';
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Đang soạn',
      'PENDING_REVIEW': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'PUBLISHED': 'Công bố',
    };
    return statusMap[status] || 'Đang soạn';
  };

  const handleViewDetails = (syllabusId: number) => {
    navigate(`/subject/${syllabusId}`);
  };

  const handleToggleFollow = async (id: string) => {
    const target = syllabuses.find((s) => s.id === id);
    if (!target || !target.courseId) return;

    const nextFollow = !target.following;
    setSyllabuses((prev) => prev.map((s) => s.id === id ? { ...s, following: nextFollow } : s));
    setSearchResults((prev) => prev.map((s) => s.id === id ? { ...s, following: nextFollow } : s));
    try {
      if (nextFollow) {
        await followCourse(target.courseId);
      } else {
        await unfollowCourse(target.courseId);
      }
    } catch (error) {
      console.error('Toggle follow failed:', error);
      // revert on error
      setSyllabuses((prev) => prev.map((s) => s.id === id ? { ...s, following: !nextFollow } : s));
      setSearchResults((prev) => prev.map((s) => s.id === id ? { ...s, following: !nextFollow } : s));
      showError('Không thể cập nhật trạng thái theo dõi');
    }
  };

  const handleAddComment = (id: string) => {
    setCurrentSyllabusCode(id);
    setShowCommentModal(true);
  };

  const handleReportError = (id: string) => {
    setCurrentSyllabusCode(id);
    setShowReportModal(true);
  };

  const handleCompareVersions = (id: string) => {
    navigate(`/syllabus/compare/${id}`);
  };

  const handleCreateNewVersion = async (syllabus: Syllabus) => {
    try {
      setIsSubmitting(true);
      const response = await createSyllabusVersion({
        sourceSyllabusId: syllabus.syllabusId,
        versionNotes: `New version from v${syllabus.version}`,
        copyMaterials: true,
        copySessionPlans: true,
        copyAssessments: true,
        copyCLOs: true
      });
      const newId = (response as any)?.syllabusId || (response as any)?.id;
      success(' Đã tạo phiên bản mới để chỉnh sửa');
      fetchSyllabuses();
      if (newId) {
        navigate(`/syllabus/edit/${newId}`);
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      showError(' Không thể tạo phiên bản mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSyllabus = async (syllabus: Syllabus) => {
    if (!window.confirm(`Xóa syllabus ${syllabus.id}?`)) return;
    try {
      setIsSubmitting(true);
      await deleteSyllabus(syllabus.syllabusId);
      success(' Đã xóa syllabus');
      fetchSyllabuses();
    } catch (error) {
      console.error('Delete syllabus failed:', error);
      showError(' Không thể xóa syllabus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportContent.trim()) {
      showError('Vui lòng nhập nội dung báo cáo');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createReport({
        title: `[${reportType.toUpperCase()}] ${currentSyllabusCode || 'SYLLABUS'}`,
        description: reportContent
      });
      success('Đã gửi báo cáo thành công!');
      setShowReportModal(false);
      setReportContent('');
      setReportType('content_error');
    } catch (error) {
      console.error('Error submitting report:', error);
      showError('Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      showError('Vui lòng nhập nội dung nhận xét');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit comment
      // POST /api/v1/syllabuses/{id}/comments
      console.log('Comment submitted:', { syllabusCode: currentSyllabusCode, commentContent });
      success(' Đã thêm nhận xét thành công!');
      setShowCommentModal(false);
      setCommentContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      showError(' Có lỗi xảy ra khi thêm nhận xét');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToHoD = async () => {
    if (!submitNote.trim()) {
      showError('Vui lòng nhập ghi chú cho trưởng khoa');
      return;
    }
    if (!currentSyllabus) {
      showError('Không tìm thấy giáo trình cần gửi');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitSyllabusForReview(currentSyllabus.syllabusId, submitNote, false);
      success(' Đã gửi giáo trình cho Trưởng khoa duyệt thành công!');
      setShowSubmitModal(false);
      setSubmitNote('');
      fetchSyllabuses();
    } catch (error) {
      console.error('Error submitting to HoD:', error);
      showError(' Có lỗi xảy ra khi gửi giáo trình');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"></div>
          <h2>SMD System</h2>
          <p>Giảng viên</p>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'my-syllabi' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('my-syllabi'); }}
          >
            <span className="icon"><FolderOpen size={20} /></span>
            Giáo trình của tôi
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'discussion-sessions' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('discussion-sessions'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Phiên Thảo luận
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tra cứu & Theo dõi
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'management' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('management'); }}
          >
            <span className="icon"><GitCompare size={20} /></span>
            Quản lý nâng cao
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>
              {activeTab === 'overview' && 'Tổng quan'}
              {activeTab === 'my-syllabi' && 'Giáo trình của tôi'}
              {activeTab === 'collaborative' && 'Cộng tác & Review'}
                            {activeTab === 'discussion-sessions' && 'Phiên Thảo luận'}
              {activeTab === 'search' && 'Tra cứu & Theo dõi'}
              {activeTab === 'management' && 'Quản lý nâng cao'}
            </h1>
            <p>
              {activeTab === 'overview' && 'Dashboard tổng quan hoạt động và thống kê'}
              {activeTab === 'my-syllabi' && 'Tạo mới, cập nhật và quản lý giáo trình'}
              {activeTab === 'collaborative' && 'Review và đóng góp ý kiến cho giáo trình đồng nghiệp'}
                            {activeTab === 'discussion-sessions' && 'Tham gia thảo luận và góp ý về giáo trình'}
              {activeTab === 'search' && 'Tìm kiếm và theo dõi giáo trình để nhận thông báo'}
              {activeTab === 'management' && 'So sánh phiên bản, CLO-PLO mapping, module tree'}
            </p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <Bell size={24} />
                <span className="badge">{unreadNotificationCount}</span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            <div className="user-menu">
              <span className="user-icon"><User size={24} /></span>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Giảng viên'}</div>
                <div className="user-role">Lecturer</div>
              </div>
            </div>
          </div>
        </header>
        {/* Action Bar */}
        {user?.role === 'LECTURER' && (activeTab === 'my-syllabi' || activeTab === 'overview') && (
          <div className="action-bar">
            <button 
              className="btn-create-syllabus"
              onClick={() => navigate('/syllabus/create')}
            >
              <Plus size={20} />
              <span>Tạo giáo trình mới</span>
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setActiveTab('search')}
            >
              <Search size={20} />
              <span>Tra cứu giáo trình</span>
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Hoạt động nhanh</h2>
            </div>
            
            <div className="quick-actions">
              <div className="quick-action-card" onClick={() => navigate('/syllabus/create')}>
                <Plus size={32} />
                <h3>Tạo giáo trình mới</h3>
                <p>Soạn thảo, đính kèm CLO, PLO, modules và nộp HoD</p>
              </div>
              <div className="quick-action-card" onClick={() => setActiveTab('my-syllabi')}>
                <Edit size={32} />
                <h3>Cập nhật giáo trình</h3>
                <p>Chỉnh sửa nội dung và nộp lại cho HoD</p>
              </div>
              <div className="quick-action-card" onClick={() => setActiveTab('collaborative')}>
                <MessageSquare size={32} />
                <h3>Cộng tác Review</h3>
                <p>Review, góp ý và báo lỗi giáo trình đồng nghiệp</p>
              </div>
              <div className="quick-action-card" onClick={() => setActiveTab('management')}>
                <GitCompare size={32} />
                <h3>So sánh & Quản lý</h3>
                <p>So sánh phiên bản, xem CLO-PLO mapping</p>
              </div>
            </div>

            <div className="recent-syllabi">
              <h3>Giáo trình gần đây</h3>
              <div className="table-container">
                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : syllabuses.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã MH</th>
                        <th>Tên môn học</th>
                        <th>Giảng viên</th>
                        <th>Học kỳ</th>
                        <th>Trạng thái</th>
                        <th>Phiên bản</th>
                        <th>Cập nhật</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabuses.slice(0, 5).map((syllabus) => (
                        <tr key={syllabus.id}>
                          <td>{syllabus.id}</td>
                          <td>{syllabus.name}</td>
                          <td>{syllabus.instructor || 'N/A'}</td>
                          <td>{syllabus.semester || ''}</td>
                          <td>
                            <span className={`status-badge ${
                              syllabus.status === 'Đã duyệt' ? 'active' : 
                              syllabus.status === 'Chờ duyệt' ? 'pending' : 'draft'
                            }`}>
                              {syllabus.status}
                            </span>
                          </td>
                          <td>{syllabus.version}</td>
                          <td>{syllabus.lastUpdated}</td>
                          <td>
                            <button className="icon-btn" onClick={() => handleViewDetails(syllabus.syllabusId)}>
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    <p>Chưa có giáo trình nào. <a href="#" onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }} style={{ color: '#3b82f6' }}>Tạo giáo trình mới</a></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SYLLABI - Function 1, 2, 3 */}
        {activeTab === 'my-syllabi' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Quản lý giáo trình của tôi</h2>
              <div className="header-actions">
                <button className="btn-filter">
                  <Filter size={18} />
                  Lọc theo trạng thái
                </button>
              </div>
            </div>

            <div className="table-container">
              {loadingData ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : syllabuses.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã MH</th>
                      <th>Tên môn học</th>
                      <th>Học kỳ</th>
                      <th>Trạng thái</th>
                      <th>Phiên bản</th>
                      <th>Cập nhật</th>
                      <th>Theo dõi</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syllabuses.map((syllabus) => (
                      <tr key={syllabus.id}>
                        <td><strong>{syllabus.id}</strong></td>
                        <td>{syllabus.name}</td>
                        <td>{syllabus.semester}</td>
                        <td>
                          <span className={`status-badge ${
                            syllabus.status === 'Đã duyệt' ? 'active' : 
                            syllabus.status === 'Chờ duyệt' ? 'pending' : 'draft'
                          }`}>
                            {syllabus.status}
                          </span>
                        </td>
                        <td>{syllabus.version}</td>
                        <td>{syllabus.lastUpdated}</td>
                        <td>
                          <button 
                            className={`btn-follow ${syllabus.following ? 'following' : ''}`}
                            onClick={() => handleToggleFollow(syllabus.id)}
                            title={syllabus.following ? 'Đang theo dõi' : 'Theo dõi'}
                          >
                            <Star size={16} fill={syllabus.following ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="icon-btn" 
                              onClick={() => handleViewDetails(syllabus.syllabusId)} 
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="icon-btn" 
                              onClick={() => navigate(`/syllabus/edit/${syllabus.id}`)} 
                              title="Cập nhật"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="icon-btn" 
                              onClick={() => handleCompareVersions(syllabus.id)} 
                              title="So sánh phiên bản"
                            >
                              <GitCompare size={18} />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => handleCreateNewVersion(syllabus)}
                              title="Tạo phiên bản mới để chỉnh sửa"
                            >
                              <Upload size={18} />
                            </button>
                            {syllabus.status === 'Đang soạn' && (
                              <>
                                <button 
                                  className="icon-btn success" 
                                  onClick={() => {
                                    setCurrentSyllabus(syllabus);
                                    setCurrentSyllabusCode(syllabus.id);
                                    setShowSubmitModal(true);
                                  }} 
                                  title="Gửi Trưởng khoa duyệt"
                                >
                                  <Send size={18} />
                                </button>
                                <button 
                                  className="icon-btn danger" 
                                  onClick={() => handleDeleteSyllabus(syllabus)} 
                                  title="Xóa bản nháp"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  <p>Chưa có giáo trình nào. <a href="#" onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }} style={{ color: '#3b82f6' }}>Tạo giáo trình mới</a></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COLLABORATIVE - Function 4 */}
        {activeTab === 'collaborative' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Giáo trình đang cộng tác</h2>
              <p className="section-description">Review, góp ý và báo lỗi trong giai đoạn cộng tác</p>
            </div>

            <div className="table-container">
              {loadingData ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : collaborativeSyllabi.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã MH</th>
                      <th>Tên môn học</th>
                      <th>Giảng viên chính</th>
                      <th>Ngày gửi</th>
                      <th>Phiên bản</th>
                      <th>Người tham gia</th>
                      <th>Góp ý của tôi</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborativeSyllabi.map((syllabus) => (
                      <tr key={syllabus.id}>
                        <td><strong>{syllabus.id}</strong></td>
                        <td>{syllabus.name}</td>
                        <td>{syllabus.instructor}</td>
                        <td>{syllabus.submittedDate}</td>
                        <td>{syllabus.version}</td>
                        <td>
                          <span className="collaborator-badge">
                            <User size={14} />
                            {syllabus.collaborators}
                          </span>
                        </td>
                        <td>
                          <span className="comment-badge">
                            <MessageSquare size={14} />
                            {syllabus.comments}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="icon-btn" 
                              onClick={() => navigate(`/collaborative-review/${syllabus.syllabusId}`)} 
                              title="Xem tất cả Review"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="icon-btn primary" 
                              onClick={() => handleAddComment(String(syllabus.syllabusId))} 
                              title="Thêm góp ý"
                            >
                              <MessageSquare size={18} />
                            </button>
                            <button 
                              className="icon-btn warning" 
                              onClick={() => handleReportError(String(syllabus.syllabusId))} 
                              title="Báo lỗi"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  <p>Không có giáo trình nào đang cộng tác</p>
                </div>
              )}
            </div>

            {collaborativeSyllabi.length > 0 && (
              <div className="collaboration-info">
                <AlertCircle size={20} />
                <p>Giai đoạn cộng tác cho phép bạn review, góp ý và báo lỗi. Bạn có thể chỉnh sửa hoặc xóa góp ý của mình.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3.5: DISCUSSION SESSIONS */}
        {activeTab === 'discussion-sessions' && (
          <div className="content-section" style={{ padding: '40px' }}>
            {/* Loading State */}
            {discussionLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải danh sách thảo luận...</p>
              </div>
            )}

            {/* Error State */}
            {discussionError && !discussionLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffebee', borderRadius: '12px', boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)', marginBottom: '24px' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f44336', opacity: 0.8 }} />
                <h3 style={{ color: '#f44336', marginBottom: '8px' }}>Lỗi tải dữ liệu</h3>
                <p style={{ color: '#d32f2f', marginBottom: '16px' }}>{discussionError}</p>
                <button
                  onClick={loadDiscussionReviews}
                  style={{
                    padding: '8px 16px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Thử lại
                </button>
              </div>
            )}

            {!discussionLoading && !discussionError && (
              <>
                {/* Header with Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div className="filter-tabs">
                    {(['all', 'active', 'pending', 'completed'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setDiscussionFilter(status)}
                        style={{
                          padding: '10px 16px',
                          background: discussionFilter === status ? '#007bff' : '#f5f5f5',
                          color: discussionFilter === status ? 'white' : '#666',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.3s',
                          marginRight: '8px'
                        }}
                      >
                        {status === 'all' && `Tất cả (${discussionReviews.length})`}
                        {status === 'active' && `Đang diễn ra (${discussionReviews.filter((r: any) => r.status === 'active').length})`}
                        {status === 'pending' && `Chưa bắt đầu (${discussionReviews.filter((r: any) => r.status === 'pending').length})`}
                        {status === 'completed' && `Hoàn thành (${discussionReviews.filter((r: any) => r.status === 'completed').length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {discussionReviews
                    .filter((r: any) => discussionFilter === 'all' || r.status === discussionFilter)
                    .map((review: any) => (
                    <div
                      key={review.id}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        border: review.status === 'active' ? '2px solid #2196f3' : 'none',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                          {review.courseCode} - {review.courseName}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
                          👨‍🏫 Giảng viên chính: <strong>{review.lecturer}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <Users size={16} style={{ display: 'inline', color: '#2196f3' }} />
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                            {review.participantCount} Tham gia
                          </p>
                        </div>
                        <div style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <MessageSquare size={16} style={{ display: 'inline', color: '#ff9800' }} />
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                            {review.feedbackCount} Phản hồi
                          </p>
                        </div>
                      </div>

                      {/* My Comments Count */}
                      <div style={{
                        background: '#e8f5e9',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: '3px solid #4caf50'
                      }}>
                        <p style={{ margin: '0', fontSize: '13px', color: '#2e7d32', fontWeight: 600 }}>
                          ✏️ Góp ý của bạn: {review.myCommentCount || 0} ý kiến
                        </p>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                          Hạn cuối:
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 500 }}>
                          {new Date(review.dueDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        {review.isFinalized && (
                          <>
                            <CheckCircle size={14} color="#2e7d32" />
                            <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
                              ✅ Đã hoàn tất
                            </span>
                          </>
                        )}
                        {!review.isFinalized && review.status === 'active' && (
                          <>
                            <Clock size={14} color="#2196f3" />
                            <span style={{ fontSize: '12px', color: '#2196f3', fontWeight: 500 }}>
                              Đang diễn ra
                            </span>
                          </>
                        )}
                        {!review.isFinalized && review.status === 'pending' && (
                          <>
                            <Clock size={14} color="#ff9800" />
                            <span style={{ fontSize: '12px', color: '#ff9800', fontWeight: 500 }}>
                              Chưa bắt đầu
                            </span>
                          </>
                        )}
                        {!review.isFinalized && review.status === 'completed' && (
                          <>
                            <CheckCircle size={14} color="#4caf50" />
                            <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 500 }}>
                              Hoàn thành
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/collaborative-review/${review.id}`)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '13px',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#1976d2';
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#2196f3';
                        }}
                      >
                        <Eye size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        Xem Chi tiết
                      </button>
                    </div>
                  ))}
                </div>

                {discussionReviews.filter((r: any) => discussionFilter === 'all' || r.status === discussionFilter).length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#999',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3>Không có thảo luận nào</h3>
                    <p>Bạn chưa được mời tham gia thảo luận hợp tác nào</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: SEARCH & FOLLOW - Function 3, 5 */}
        {activeTab === 'search' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Tra cứu giáo trình</h2>
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên môn học, mã môn học, giảng viên..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      console.log('Searching for:', e.target.value);
                    }
                  }}
                />
                <button className="filter-btn">
                  <Filter size={18} />
                  Lọc
                </button>
              </div>
            </div>

            <div className="table-container">
              {searchResults.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã MH</th>
                      <th>Tên môn học</th>
                      <th>Giảng viên</th>
                      <th>Học kỳ</th>
                      <th>Phiên bản</th>
                      <th>Cập nhật</th>
                      <th>Theo dõi</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((syllabus) => (
                      <tr key={syllabus.id}>
                        <td><strong>{syllabus.id}</strong></td>
                        <td>{syllabus.name}</td>
                        <td>{syllabus.instructor}</td>
                        <td>{syllabus.semester}</td>
                        <td>{syllabus.version}</td>
                        <td>{syllabus.lastUpdated}</td>
                        <td>
                          <button 
                            className={`btn-follow ${syllabus.following ? 'following' : ''}`}
                            onClick={() => handleToggleFollow(syllabus.id)}
                            title={syllabus.following ? 'Bỏ theo dõi' : 'Theo dõi để nhận thông báo'}
                          >
                            <Star size={16} fill={syllabus.following ? 'currentColor' : 'none'} />
                            {syllabus.following ? 'Đang theo dõi' : 'Theo dõi'}
                          </button>
                        </td>
                        <td>
                          <button className="icon-btn" onClick={() => handleViewDetails(syllabus.syllabusId)}>
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  <p>{searchQuery ? 'Không tìm thấy giáo trình phù hợp' : 'Nhập từ khóa để tìm kiếm giáo trình'}</p>
                </div>
              )}
            </div>

            <div className="search-info">
              <Bell size={20} />
              <p>Theo dõi giáo trình để nhận thông báo khi có cập nhật mới, feedback hoặc phê duyệt</p>
            </div>
          </div>
        )}

        {/* TAB 5: MANAGEMENT - Function 3 Advanced */}
        {activeTab === 'management' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Quản lý nâng cao</h2>
              <p className="section-description">So sánh phiên bản, CLO-PLO mapping, module relationship tree</p>
            </div>

            <div className="management-tools">
              <div className="tool-card">
                <GitCompare size={40} />
                <h3>So sánh phiên bản</h3>
                <p>Xem thay đổi giữa các phiên bản giáo trình</p>
                <button className="btn-tool">Mở công cụ</button>
              </div>
              <div className="tool-card">
                <BookOpen size={40} />
                <h3>CLO - PLO Mapping</h3>
                <p>Xem ma trận ánh xạ CLO-PLO và trọng số</p>
                <button className="btn-tool">Xem mapping</button>
              </div>
              <div className="tool-card">
                <FileText size={40} />
                <h3>Module Relationship Tree</h3>
                <p>Xem cây quan hệ giữa các module học</p>
                <button className="btn-tool">Xem tree</button>
              </div>
              <div className="tool-card">
                <Download size={40} />
                <h3>Xuất báo cáo</h3>
                <p>Tải xuống giáo trình và metadata</p>
                <button className="btn-tool">Xuất file</button>
              </div>
            </div>

            <div className="version-history">
              <h3>Lịch sử phiên bản</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Giáo trình</th>
                      <th>Phiên bản</th>
                      <th>Ngày tạo</th>
                      <th>Thay đổi</th>
                      <th>Trạng thái</th>
                      <th>So sánh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CS101 - Nhập môn CNTT</td>
                      <td>v2.1</td>
                      <td>15/12/2025</td>
                      <td>Cập nhật module 3, thêm CLO4</td>
                      <td><span className="status-badge active">Đã duyệt</span></td>
                      <td>
                        <button className="icon-btn">
                          <GitCompare size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>CS101 - Nhập môn CNTT</td>
                      <td>v2.0</td>
                      <td>01/11/2025</td>
                      <td>Điều chỉnh trọng số CLO-PLO</td>
                      <td><span className="status-badge active">Đã duyệt</span></td>
                      <td>
                        <button className="icon-btn">
                          <GitCompare size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={24} color="#ef4444" />
                Báo cáo vấn đề
              </h2>
              <button onClick={() => setShowReportModal(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Loại vấn đề</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="content_error">Sai sót nội dung</option>
                  <option value="outdated">Nội dung lỗi thời</option>
                  <option value="missing_info">Thiếu thông tin</option>
                  <option value="formatting">Lỗi định dạng</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung báo cáo</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  rows={6}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowReportModal(false)} 
                className="btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmitReport} 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={18} />
                {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageCircle size={24} color="#3b82f6" />
                Thêm nhận xét
              </h2>
              <button onClick={() => setShowCommentModal(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nội dung nhận xét</label>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Chia sẻ ý kiến, góp ý của bạn về giáo trình này..."
                  rows={6}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowCommentModal(false)} 
                className="btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmitComment} 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={18} />
                {isSubmitting ? 'Đang gửi...' : 'Gửi nhận xét'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit to HoD Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={24} color="#008f81" />
                Gửi Trưởng khoa duyệt
              </h2>
              <button onClick={() => setShowSubmitModal(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="alert-info" style={{
                background: '#e0f2fe',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#075985',
                display: 'flex',
                alignItems: 'start',
                gap: '8px'
              }}>
                <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Lưu ý:</strong> Sau khi gửi, giáo trình sẽ chuyển sang trạng thái "Chờ duyệt" và bạn sẽ không thể chỉnh sửa cho đến khi được phê duyệt hoặc yêu cầu chỉnh sửa.
                </div>
              </div>
              <div className="form-group">
                <label>Mã giáo trình: <strong>{currentSyllabus?.id || ''}</strong></label>
              </div>
              <div className="form-group">
                <label>Ghi chú cho Trưởng khoa</label>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc thông tin cần lưu ý cho Trưởng khoa..."
                  rows={5}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => {
                setShowSubmitModal(false);
                setSubmitNote('');
              }} className="btn-secondary">
                Hủy
              </button>
              <button 
                onClick={handleSubmitToHoD} 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={18} />
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default LecturerDashboard;
