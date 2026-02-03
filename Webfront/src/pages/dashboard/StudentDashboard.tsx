import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Search, User, Loader2, Star, X, Heart, MessageSquare, Download, Bell, Sparkles, Hash, BookOpen, Building2 } from 'lucide-react';
import { getAllSyllabuses, searchSyllabuses, getDepartments, getNotificationStats, getSyllabusDetail, getSyllabusById, SyllabusDetailResponse, followCourse, unfollowCourse, createReport, getCourseRelationsByCourseId, getCLOsBySyllabusId, getCLOPLOMappingsBySyllabusId, CourseRelationResponse, CLOResponse, CLOPLOMappingResponse, downloadSyllabusPDF, getSyllabusPDFInfo, getNotifications, getFollowedCourses } from '../../services/api';
import NotificationMenu from '../../components/NotificationMenu';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

interface Course {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  department?: {
    departmentId: number;
    deptName: string; 
  };
}

interface Syllabus {
  syllabusId: number;
  course: Course;
  program: {
    programId?: number;
    programName: string;
  };
  lecturer: {
    fullName: string;
    email?: string;
    userId?: number;
  };
  academicYear?: string;
  versionNo?: number;
  currentStatus?: string;
  versionNotes?: string;
  createdAt?: string;
  publishedAt?: string;
  aiSummary?: string;
  deptName?: string;
}

interface Department {
  departmentId: number;
  deptName: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSyllabi, setAllSyllabi] = useState<Syllabus[]>([]);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Filter & Detail View States
  const [selectedMajor, setSelectedMajor] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [detailData, setDetailData] = useState<SyllabusDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeViewTool, setActiveViewTool] = useState<'info' | 'clos' | 'sessions' | 'assessments' | 'materials' | 'course-relations'>('info');
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  
  // API Data States - Course Relations
  const [courseRelations, setCourseRelations] = useState<CourseRelationResponse[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  
  // API Data States - CLOs and Mappings
  const [clos, setClos] = useState<CLOResponse[]>([]);
  const [mappings, setMappings] = useState<CLOPLOMappingResponse[]>([]);
  const [loadingCLOData, setLoadingCLOData] = useState(false);
  
  // API Data States - PDF
  const [hasPdf, setHasPdf] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // API Data States - Followed Courses
  const [followedCourseIds, setFollowedCourseIds] = useState<Set<number>>(new Set());
  
  // API Data States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const goToProfile = () => {
    navigate('../profile');
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let data: Syllabus[] = [];
      
      // Kiểm tra nếu input là số (ID)
      if (/^\d+$/.test(searchQuery.trim())) {
        try {
          const syllabusById = await getSyllabusById(parseInt(searchQuery.trim()));
          data = [syllabusById];
        } catch (error) {
          // Nếu không tìm được bằng ID, thử tìm bằng từ khóa
          data = await searchSyllabuses(searchQuery);
        }
      } else {
        // Tìm bằng từ khóa
        data = await searchSyllabuses(searchQuery);
      }
      
      // Chuẩn hóa dữ liệu
      const normalizedData: Syllabus[] = (data as any[]).map(s => {
        if (s.course && typeof s.course === 'object') {
          return s as Syllabus;
        }
        return {
          ...s,
          course: {
            courseId: s.courseId || 0,
            courseCode: s.courseCode || 'N/A',
            courseName: s.courseName || 'Không rõ tên môn',
            credits: s.credits || 0,
            department: s.department || {
              departmentId: 0,
              deptName: s.deptName || 'N/A'
            }
          },
          lecturer: s.lecturer || { fullName: s.lecturerName || 'Chưa cập nhật' },
          program: s.program || { programName: s.programName || '' }
        };
      });

      // Chỉ hiển thị syllabus có trạng thái PUBLISHED cho sinh viên
      let filteredData = normalizedData.filter(s => s.currentStatus === 'PUBLISHED');
      
      if (selectedMajor) {
        filteredData = filteredData.filter(s => 
          s.course?.department?.departmentId?.toString() === selectedMajor
        );
      }

      setSyllabi(filteredData);
      setSearched(true);
      setActiveTab('search');
    } catch (error) {
      console.error('Lỗi tìm kiếm giáo trình:', error);
      setSyllabi([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (syllabusId: number) => {
    try {
      const courseId = selectedSyllabus?.course?.courseId || syllabi.find(s => s.syllabusId === syllabusId)?.course?.courseId;
      
      if (!courseId) {
        console.error('Course ID not found');
        return;
      }

      const isFollowed = followedCourseIds.has(courseId);
      
      if (isFollowed) {
        // Unfollow course
        await unfollowCourse(courseId);
        setFollowedCourseIds(prev => {
          const updated = new Set(prev);
          updated.delete(courseId);
          return updated;
        });
        console.log('✅ Đã hủy follow môn học:', courseId);
      } else {
        // Follow course
        await followCourse(courseId);
        setFollowedCourseIds(prev => {
          const updated = new Set(prev);
          updated.add(courseId);
          return updated;
        });
        console.log('✅ Đã follow môn học:', courseId);
      }
    } catch (error) {
      console.error('Lỗi khi follow/unfollow môn học:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleOpenDetail = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setDetailModalOpen(true);
    setActiveViewTool('info');
  };

  const handleSendFeedback = async () => {
    if (feedbackContent.trim() && selectedSyllabus) {
      try {
        const reportData = {
          title: `Báo cáo lỗi: ${selectedSyllabus.course?.courseName} (${selectedSyllabus.course?.courseCode})`,
          description: feedbackContent.trim()
        };

        const response = await createReport(reportData);
        console.log('✅ Báo cáo đã được gửi thành công:', response);
        
        setFeedbackContent('');
        setFeedbackModal(false);
        alert('✅ Cảm ơn bạn đã gửi báo cáo! Chúng tôi sẽ xem xét và phản hồi sớm.');
      } catch (error) {
        console.error('Lỗi khi gửi báo cáo:', error);
        alert('❌ Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại!');
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedSyllabus) return;
    
    try {
      setLoadingPDF(true);
      const pdfBlob = await downloadSyllabusPDF(selectedSyllabus.syllabusId);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSyllabus.course?.courseCode}_${selectedSyllabus.course?.courseName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Tải PDF thành công!');
    } catch (error) {
      console.error('Lỗi khi tải PDF:', error);
      alert('❌ Có lỗi xảy ra khi tải PDF. Vui lòng thử lại!');
    } finally {
      setLoadingPDF(false);
    }
  };

  // Fetch syllabus detail when modal opens
  useEffect(() => {
    if (detailModalOpen && selectedSyllabus) {
      const fetchDetail = async () => {
        try {
          setLoadingDetail(true);
          const detail = await getSyllabusDetail(selectedSyllabus.syllabusId);
          setDetailData(detail);
          
          // Also fetch PDF info
          try {
            const pdfInfo = await getSyllabusPDFInfo(selectedSyllabus.syllabusId);
            console.log('PDF info fetched:', pdfInfo);
            // Check if PDF exists by checking fileName or filePath instead of hasPdf
            setHasPdf(Boolean(pdfInfo?.fileName || pdfInfo?.filePath));
          } catch (error) {
            console.log('Không thể lấy thông tin PDF:', error);
            setHasPdf(false);
          }
        } catch (error) {
          console.error('Lỗi lấy chi tiết giáo trình:', error);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    }
  }, [detailModalOpen, selectedSyllabus]);

  // Fetch course relations when detail modal opens and activeViewTool changes to 'course-relations'
  useEffect(() => {
    if (detailModalOpen && selectedSyllabus && activeViewTool === 'course-relations') {
      const fetchRelations = async () => {
        try {
          setLoadingRelations(true);
          const relations = await getCourseRelationsByCourseId(selectedSyllabus.course.courseId);
          console.log('Course relations fetched:', relations);
          setCourseRelations(Array.isArray(relations) ? relations : []);
        } catch (error) {
          console.error('Lỗi lấy mối quan hệ môn học:', error);
          setCourseRelations([]);
        } finally {
          setLoadingRelations(false);
        }
      };
      fetchRelations();
    }
  }, [detailModalOpen, selectedSyllabus, activeViewTool]);

  // Fetch CLOs and mappings when detail modal opens and activeViewTool changes to 'clos'
  useEffect(() => {
    if (detailModalOpen && selectedSyllabus && activeViewTool === 'clos') {
      const fetchCLOData = async () => {
        try {
          setLoadingCLOData(true);
          
          // Fetch CLOs by Syllabus ID
          const closData = await getCLOsBySyllabusId(selectedSyllabus.syllabusId);
          console.log('CLOs fetched:', closData);
          setClos(Array.isArray(closData) ? closData : []);
          
          // Fetch CLO-PLO Mappings by Syllabus ID
          const mappingsData = await getCLOPLOMappingsBySyllabusId(selectedSyllabus.syllabusId);
          console.log('CLO-PLO Mappings fetched:', mappingsData);
          setMappings(Array.isArray(mappingsData) ? mappingsData : []);
        } catch (error) {
          console.error('Lỗi lấy dữ liệu CLO:', error);
          setClos([]);
          setMappings([]);
        } finally {
          setLoadingCLOData(false);
        }
      };
      fetchCLOData();
    }
  }, [detailModalOpen, selectedSyllabus, activeViewTool]);
  useEffect(() => {
    if (searchQuery === '' && searched) {
      setSearched(false);
    }
  }, [searchQuery, searched]);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Lỗi lấy chuyên ngành:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch notification stats
  useEffect(() => {
    const fetchNotificationStats = async () => {
      try {
        const stats = await getNotificationStats();
        console.log('Notification stats:', stats);
        // Use stats to set unread notification count
        const unreadCount = stats?.unreadCount || 0;
        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('Lỗi lấy thống kê thông báo:', error);
        setUnreadNotificationCount(0);
      }
    };

    fetchNotificationStats();
    
    // Auto refresh mỗi 30 giây
    const interval = setInterval(fetchNotificationStats, 30000);
    
    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications on component mount (to show correct badge immediately)
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const data = await getNotifications(0, 100);
        console.log('Initial notifications:', data);
        let notificationsList = [];
        if (data.content) {
          notificationsList = Array.isArray(data.content) ? data.content : [];
        } else {
          notificationsList = Array.isArray(data) ? data : [];
        }
        
        // Calculate unread count from actual notifications
        const unreadCount = notificationsList.filter((n: any) => !n.isRead).length;
        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('Lỗi lấy thông báo ban đầu:', error);
        setUnreadNotificationCount(0);
      }
    };
    
    fetchInitialNotifications();
  }, []);

  // Fetch followed courses to initialize followed course IDs
  useEffect(() => {
    const fetchFollowedCourses = async () => {
      try {
        const followedCoursesData = await getFollowedCourses();
        console.log('Followed courses data:', followedCoursesData);

        const courseIds = new Set<number>();
        if (Array.isArray(followedCoursesData)) {
          followedCoursesData.forEach((course: any) => {
            if (course.courseId) {
              courseIds.add(course.courseId);
            }
          });
        }

        setFollowedCourseIds(courseIds);
        console.log('Followed course IDs:', Array.from(courseIds));
      } catch (error) {
        console.error('Lỗi lấy danh sách môn học đã follow:', error);
        setFollowedCourseIds(new Set());
      }
    };

    fetchFollowedCourses();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const syllabusesData = await getAllSyllabuses();

        const mappedSyllabi = syllabusesData.map((item: any) => {
          // Đảm bảo dữ liệu có cấu trúc đúng
          if (item.course && typeof item.course === 'object') {
            return item as Syllabus;
          }
          // Nếu không có cấu trúc course nested, xây dựng nó từ các trường flat
          return {
            syllabusId: item.syllabusId,
            course: {
              courseId: item.courseId || 0,
              courseName: item.courseName || 'N/A',
              courseCode: item.courseCode || 'N/A',
              credits: item.credits || 0,
              department: item.department ? {
                departmentId: item.department.departmentId,
                deptName: item.department.deptName
              } : undefined
            },
            program: item.program || { programName: item.programName || '' },
            lecturer: item.lecturer || { fullName: item.lecturerName || 'Chưa cập nhật' },
            academicYear: item.academicYear,
            versionNo: item.versionNo,
            currentStatus: item.currentStatus,
            versionNotes: item.versionNotes
          } as Syllabus;
        });

        // Chỉ hiển thị syllabus có trạng thái PUBLISHED cho sinh viên
        const publishedSyllabi = mappedSyllabi.filter((s: Syllabus) => s.currentStatus === 'PUBLISHED');
        setAllSyllabi(publishedSyllabi);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu giáo trình:', error);
      }
    };
    fetchAllData();
  }, []);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="smd-main">
        <header className="smd-header">
        <div className="header-right">
          <div className="notification-wrapper">
            <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
              <Bell size={20} />
              <span className="badge">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            </div>
            <NotificationMenu 
              isOpen={isNotificationOpen} 
              onClose={() => setIsNotificationOpen(false)}
              onUnreadCountChange={(count) => setUnreadNotificationCount(count)}
            />
          </div>
          <div className="user-profile" onClick={goToProfile} style={{ cursor: 'pointer' }}>
            <div className="user-info">
              <p className="user-name">
                {user?.name ? user.name : 'Đang tải...'}
              </p>
              <p className="user-role">
                {user?.role ? user.role : 'Sinh viên'}
              </p>
            </div>
            <div className="user-avatar">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      <section className="smd-content">
        {activeTab === 'home' ? (
          <div className="home-content">
            <div className="content-title">
              <h1>Chào mừng trở lại, {user?.name ? user.name.split(' ').slice(-1)[0] : 'Bạn'}!</h1>
              <p>Khám phá các giáo trình được đề xuất dành riêng cho bạn</p>
            </div>

            <div className="recommendation-section">
              <div className="section-header">
                <Star size={20} color="#f1c40f" fill="#f1c40f" />
                <h2>Giáo trình được đề xuất</h2>
              </div>
              <div className="course-grid">
                {allSyllabi.map((syllabus) => (
                  <div key={syllabus.syllabusId} className="course-card">
                    <div className="course-card-header">
                      <span className="course-code">{syllabus.course?.courseCode}</span>
                      <h3 className="course-title">{syllabus.course?.courseName}</h3>
                    </div>
                    <div className="course-card-body">
                      <p><strong>Giảng viên:</strong> {syllabus.lecturer?.fullName}</p>
                      <p><strong>Bộ môn:</strong> {syllabus.course?.department?.deptName || 'Đang cập nhật'}</p>
                      <p><strong>Năm học:</strong> {syllabus.academicYear || 'N/A'}</p>
                      <p><strong>Trạng thái:</strong> <span className={`status-badge status-${syllabus.currentStatus?.toLowerCase()}`}>{syllabus.currentStatus}</span></p>
                    </div>
                    <button 
                      className="view-detail-btn" 
                      onClick={() => {
                        handleOpenDetail(syllabus);
                      }}
                    >
                      Xem ngay
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-stats">
            </div>
          </div>
        ) : (
          <div className="search-content">
            <div className="content-title">
              <h1>Tra cứu giáo trình</h1>
              <p>Tìm kiếm và xem giáo trình các môn học</p>
            </div>

            <form className="search-filter-bar" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên hoặc mã môn học..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-select">
                <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} disabled={loadingDepartments}>
                  <option value="">Tất cả chuyên ngành</option>
                  {departments.map(dept => (
                    <option key={dept.departmentId} value={dept.departmentId}>{dept.deptName}</option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className="search-submit-btn" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Tìm kiếm'}
              </button>
            </form>

            <div className="results-status">
              {loading && <p className="status-text">Đang tải dữ liệu môn học...</p>}
              {!loading && searched && syllabi.length === 0 && (
                <p className="status-text no-results">❌ Không tìm thấy giáo trình phù hợp với "<strong>{searchQuery}</strong>"</p>
              )}
              {!searched && !loading && (
                <p className="status-text">Nhập tên môn học để bắt đầu tra cứu</p>
              )}
            </div>

            <div className="course-grid">
              {syllabi.length > 0 ? syllabi.map((s) => (
                <div key={s.syllabusId} className="course-card">
                  <div className="course-card-header">
                    <div className="course-code-name">
                      <span className="course-code">{s.course?.courseCode}</span>
                    </div>
                    <h3 className="course-title" title={s.course?.courseName}>{s.course?.courseName}</h3>
                  </div>
                  <div className="course-card-body">
                    <p><strong>Giảng viên:</strong> {s.lecturer?.fullName}</p>
                    <p><strong>Bộ môn:</strong> {s.course?.department?.deptName || 'N/A'}</p>
                    <p><strong>Trạng thái:</strong> <span className={`status-badge status-${s.currentStatus?.toLowerCase()}`}>{s.currentStatus}</span></p>
                  </div>
                  <div className="course-card-actions">
                    <button 
                      className="view-detail-btn"
                      onClick={() => handleOpenDetail(s)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`action-btn subscribe-btn ${s.course?.courseId && followedCourseIds.has(s.course.courseId) ? 'active' : ''}`}
                      onClick={() => handleSubscribe(s.syllabusId)}
                      title="Follow để nhận thông báo"
                    >
                      <Heart size={16} fill={s.course?.courseId && followedCourseIds.has(s.course.courseId) ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      className="action-btn feedback-btn"
                      onClick={() => {
                        setSelectedSyllabus(s);
                        setFeedbackModal(true);
                      }}
                      title="Gửi báo cáo lỗi"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  <p>Không tìm thấy giáo trình nào</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedSyllabus && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedSyllabus.course?.courseName}</h2>
                <p className="modal-subtitle">{selectedSyllabus.course?.courseCode} - {selectedSyllabus.course?.department?.deptName || 'N/A'}</p>
              </div>
              <button className="modal-close" onClick={() => setDetailModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`modal-tab ${activeViewTool === 'info' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('info')}
              >
                Thông tin
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'clos' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('clos')}
              >
                CLOs & Mappings
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'course-relations' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('course-relations')}
              >
                Cây môn học
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'sessions' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('sessions')}
              >
                Lịch giảng dạy
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'assessments' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('assessments')}
              >
                Đánh giá
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'materials' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('materials')}
              >
                Tài liệu
              </button>
            </div>

            <div className="modal-body">
              {loadingDetail ? (
                <div className="view-tool-content">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  {activeViewTool === 'info' && (
                    <div className="view-tool-content">
                      <h3>Thông tin chung</h3>
                      {detailData && (
                        <div className="info-section">
                          {detailData.aiSumary && (
                            <div className="ai-summary-box">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Sparkles size={18} color="#9c27b0" />
                                <h4 style={{ margin: 0, color: '#9c27b0' }}>Tóm tắt AI</h4>
                              </div>
                              <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>{detailData.aiSumary}</p>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="info-label">Mã môn:</span>
                            <span className="info-value">{detailData.courseCode}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Tên môn:</span>
                            <span className="info-value">{detailData.courseName}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Bộ môn:</span>
                            <span className="info-value">{detailData.deptName || 'N/A'}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Giảng viên:</span>
                            <span className="info-value">{detailData.lecturerName}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Tín chỉ:</span>
                            <span className="info-value">{detailData.credit}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Năm học:</span>
                            <span className="info-value">{detailData.academicYear}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Loại:</span>
                            <span className="info-value">{detailData.type}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeViewTool === 'clos' && (
                    <div className="view-tool-content">
                      <h3>Mục tiêu học phần (CLOs) & Ánh xạ</h3>
                      {loadingCLOData ? (
                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          <Loader2 size={20} style={{ display: 'inline-block', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                          Đang tải dữ liệu...
                        </p>
                      ) : (
                        <>
                          {/* CLOs Section */}
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px', fontWeight: 600 }}>Mục tiêu học phần (CLOs)</h4>
                            {clos && clos.length > 0 ? (
                              <div className="clos-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {clos.map((clo) => (
                                  <div key={clo.cloId} style={{
                                    padding: '12px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px',
                                    borderLeft: '4px solid #2196f3'
                                  }}>
                                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333', fontSize: '13px' }}>
                                      {clo.cloCode}
                                    </p>
                                    <p style={{ margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.4' }}>
                                      {clo.cloDescription}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: '#999', fontSize: '13px' }}>Chưa có dữ liệu CLO</p>
                            )}
                          </div>

                          {/* CLO-PLO Mappings Section */}
                          <div>
                            <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px', fontWeight: 600 }}>Ánh xạ CLO-PLO</h4>
                            {mappings && mappings.length > 0 ? (
                              <div className="mappings-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {mappings.map((mapping) => (
                                  <div key={mapping.mappingId} style={{
                                    padding: '12px',
                                    backgroundColor: '#fff9e6',
                                    borderRadius: '4px',
                                    border: '1px solid #ffe082'
                                  }}>
                                    <div style={{ marginBottom: '8px' }}>
                                      <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333', fontSize: '13px' }}>
                                        {mapping.cloCode} → {mapping.ploCode}
                                      </p>
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        backgroundColor: mapping.mappingLevel === 'HIGH' ? '#ff6b6b' : mapping.mappingLevel === 'MEDIUM' ? '#ffa94d' : '#74b9ff',
                                        color: 'white',
                                        borderRadius: '3px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        marginRight: '8px'
                                      }}>
                                        {mapping.mappingLevel === 'HIGH' ? 'Cao' : mapping.mappingLevel === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                      </span>
                                    </div>
                                    <p style={{ margin: '0 0 6px 0', color: '#666', fontSize: '12px' }}>
                                      <strong>CLO:</strong> {mapping.cloDescription}
                                    </p>
                                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                                      <strong>PLO:</strong> {mapping.ploDescription}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: '#999', fontSize: '13px' }}>Chưa có dữ liệu ánh xạ</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeViewTool === 'course-relations' && (
                    <div className="view-tool-content">
                      <h3>Cây quan hệ môn học</h3>
                      {loadingRelations ? (
                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          <Loader2 size={20} style={{ display: 'inline-block', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                          Đang tải dữ liệu quan hệ môn học...
                        </p>
                      ) : courseRelations && courseRelations.length > 0 ? (
                        <div className="course-relations-tree">
                          {/* Group relations by type */}
                          {['PREREQUISITE', 'COREQUISITE', 'EQUIVALENT'].map((relationType) => {
                            const typeRelations = courseRelations.filter(r => r.relationType === relationType);
                            if (typeRelations.length === 0) return null;
                            
                            const typeLabel = relationType === 'PREREQUISITE' ? 'Môn tiên quyết' : 
                                             relationType === 'COREQUISITE' ? 'Môn học song hành' : 
                                             'Môn tương đương';
                            const bgColor = relationType === 'PREREQUISITE' ? '#e3f2fd' : 
                                           relationType === 'COREQUISITE' ? '#f3e5f5' : 
                                           '#e8f5e9';
                            const borderColor = relationType === 'PREREQUISITE' ? '#2196f3' : 
                                               relationType === 'COREQUISITE' ? '#9c27b0' : 
                                               '#4caf50';
                            
                            return (
                              <div key={relationType} style={{ marginBottom: '20px' }}>
                                <h4 style={{ 
                                  margin: '0 0 12px 0', 
                                  color: borderColor, 
                                  fontSize: '14px', 
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: borderColor,
                                    borderRadius: '50%'
                                  }}></span>
                                  {typeLabel}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {typeRelations.map((relation) => (
                                    <div 
                                      key={relation.relationId}
                                      style={{
                                        padding: '12px',
                                        backgroundColor: bgColor,
                                        borderRadius: '4px',
                                        borderLeft: `4px solid ${borderColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <div style={{ flex: 1 }}>
                                        <p style={{ 
                                          margin: '0 0 4px 0', 
                                          fontWeight: 600, 
                                          color: '#333',
                                          fontSize: '13px'
                                        }}>
                                          {relation.targetCourseCode}
                                        </p>
                                        <p style={{ 
                                          margin: '0 0 6px 0', 
                                          color: '#666', 
                                          fontSize: '12px',
                                          lineHeight: '1.4'
                                        }}>
                                          {relation.targetCourseName}
                                        </p>
                                        <div style={{ 
                                          display: 'flex', 
                                          gap: '16px', 
                                          fontSize: '11px',
                                          color: '#888',
                                          flexWrap: 'wrap'
                                        }}>
                                          {relation.targetCourseId && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12} /> ID: {relation.targetCourseId}</span>
                                          )}
                                          {relation.credits !== undefined && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {relation.credits} tín chỉ</span>
                                          )}
                                          {relation.deptName && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={12} /> {relation.deptName}</span>
                                          )}
                                        </div>
                                      </div>
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        backgroundColor: borderColor,
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        marginLeft: '12px',
                                        flexShrink: 0
                                      }}>
                                        → {relationType === 'PREREQUISITE' ? 'Tiên quyết' : relationType === 'COREQUISITE' ? 'Song hành' : 'Tương đương'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          padding: '30px',
                          textAlign: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px'
                        }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 500, color: '#333' }}>
                            Không có mối quan hệ môn học
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                            Môn học này không có môn tiên quyết, song hành hoặc tương đương
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeViewTool === 'sessions' && (
                    <div className="view-tool-content">
                      <h3>Lịch giảng dạy</h3>
                      {detailData?.sessionPlans && detailData.sessionPlans.length > 0 ? (
                        <div className="sessions-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Tuần</th>
                                <th>Chủ đề</th>
                                <th>Phương pháp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailData.sessionPlans.map((session) => (
                                <tr key={session.sessionId}>
                                  <td>{session.weekNo}</td>
                                  <td>{session.topic}</td>
                                  <td>{session.teachingMethod}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>Chưa có dữ liệu</p>
                      )}
                    </div>
                  )}

                  {activeViewTool === 'assessments' && (
                    <div className="view-tool-content">
                      <h3>Phương pháp đánh giá</h3>
                      {detailData?.assessments && detailData.assessments.length > 0 ? (
                        <div className="assessments-list">
                          {detailData.assessments.map((assessment) => (
                            <div key={assessment.assessmentId} className="assessment-item">
                              <div className="assessment-header">
                                <h4>{assessment.name}</h4>
                                <span className="weight-badge">{assessment.weightPercent}%</span>
                              </div>
                              <p className="assessment-criteria">{assessment.criteria}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Chưa có dữ liệu</p>
                      )}
                    </div>
                  )}

                  {activeViewTool === 'materials' && (
                    <div className="view-tool-content">
                      <h3>Tài liệu tham khảo</h3>
                      {detailData?.materials && detailData.materials.length > 0 ? (
                        <div className="materials-list">
                          {detailData.materials.map((material) => (
                            <div key={material.materialId} className="material-item">
                              <div className="material-header">
                                <h4>{material.title}</h4>
                                <span className="material-type">{material.materialType}</span>
                              </div>
                              <p className="material-author">Tác giả: {material.author}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Chưa có dữ liệu</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className={`action-btn subscribe-btn-large ${selectedSyllabus.course?.courseId && followedCourseIds.has(selectedSyllabus.course.courseId) ? 'active' : ''}`}
                onClick={() => handleSubscribe(selectedSyllabus.syllabusId)}
              >
                <Heart size={18} fill={selectedSyllabus.course?.courseId && followedCourseIds.has(selectedSyllabus.course.courseId) ? 'currentColor' : 'none'} />
                {selectedSyllabus.course?.courseId && followedCourseIds.has(selectedSyllabus.course.courseId) ? 'Đã Follow' : 'Follow'}
              </button>
              
              <button 
                className="action-btn feedback-btn-large"
                onClick={() => setFeedbackModal(true)}
              >
                <MessageSquare size={18} />
                Báo cáo lỗi
              </button>

              <button 
                className="action-btn download-btn-large"
                onClick={handleDownloadPDF}
                disabled={loadingPDF || !hasPdf}
                title={!hasPdf ? 'Chưa có PDF' : undefined}
              >
                {loadingPDF ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    {hasPdf ? 'Tải PDF' : 'Chưa có PDF'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModal && selectedSyllabus && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(false)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Báo cáo lỗi / Phản hồi</h2>
              <button className="modal-close" onClick={() => setFeedbackModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p><strong>Giáo trình:</strong> {selectedSyllabus.course?.courseName}</p>
              <p style={{ marginBottom: '15px', color: '#666' }}>Vui lòng mô tả lỗi hoặc phản hồi của bạn chi tiết</p>
              
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Nhập nội dung phản hồi của bạn..."
                className="feedback-textarea"
                rows={6}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="action-btn cancel-btn"
                onClick={() => setFeedbackModal(false)}
              >
                Hủy
              </button>
              <button 
                className="action-btn submit-btn"
                onClick={handleSendFeedback}
                disabled={!feedbackContent.trim()}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;