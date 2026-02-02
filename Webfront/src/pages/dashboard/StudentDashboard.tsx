import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronLeft, Loader2, Home, Star, X, Heart, MessageSquare } from 'lucide-react';
import { getCourses, searchSyllabuses, getDepartments, getNotificationStats, getSyllabusDetail, getSyllabusById, SyllabusDetailResponse, followCourse, unfollowCourse, createReport } from '../../services/api';
import NotificationMenu from '../../components/NotificationMenu';
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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
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
  const [activeViewTool, setActiveViewTool] = useState<'info' | 'clos' | 'sessions' | 'assessments' | 'materials'>('info');
  const [subscribedSyllabi, setSubscribedSyllabi] = useState<Set<number>>(new Set());
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  
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

      // Áp dụng filter department nếu có chọn
      let filteredData = normalizedData;
      if (selectedMajor) {
        filteredData = normalizedData.filter(s => 
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

      const newSubscribed = new Set(subscribedSyllabi);
      
      if (newSubscribed.has(syllabusId)) {
        // Unfollow course
        await unfollowCourse(courseId);
        newSubscribed.delete(syllabusId);
        console.log('✅ Đã hủy follow môn học:', courseId);
      } else {
        // Follow course
        await followCourse(courseId);
        newSubscribed.add(syllabusId);
        console.log('✅ Đã follow môn học:', courseId);
      }
      
      setSubscribedSyllabi(newSubscribed);
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

  // Fetch syllabus detail when modal opens
  useEffect(() => {
    if (detailModalOpen && selectedSyllabus) {
      const fetchDetail = async () => {
        try {
          setLoadingDetail(true);
          const detail = await getSyllabusDetail(selectedSyllabus.syllabusId);
          setDetailData(detail);
        } catch (error) {
          console.error('Lỗi lấy chi tiết giáo trình:', error);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    }
  }, [detailModalOpen, selectedSyllabus]);
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
        setUnreadNotificationCount(stats?.unreadCount || 0);
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

  // Fetch all courses and programs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const coursesData = await getCourses();

        const mappedCourses = coursesData.map((item: any) => ({
          courseId: item.courseId,
          courseName: item.courseName,
          courseCode: item.courseCode,
          credits: item.credits,
          department: item.department ? {
            departmentId: item.department.departmentId,
            deptName: item.department.deptName
          } : undefined
        }));

        setAllCourses(mappedCourses);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
      }
    };
    fetchAllData();
  }, []);

  return (
    <div className="smd-container">
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
                CLOs
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
                                <span style={{ fontSize: '18px' }}>✨</span>
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
                      <h3>Mục tiêu học phần (CLOs)</h3>
                      {detailData?.target && detailData.target.length > 0 ? (
                        <ul className="clos-list">
                          {detailData.target.map((clo, idx) => (
                            <li key={idx}>{clo}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>Chưa có dữ liệu</p>
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
                className={`action-btn subscribe-btn-large ${subscribedSyllabi.has(selectedSyllabus.syllabusId) ? 'active' : ''}`}
                onClick={() => handleSubscribe(selectedSyllabus.syllabusId)}
              >
                <Heart size={18} fill={subscribedSyllabi.has(selectedSyllabus.syllabusId) ? 'currentColor' : 'none'} />
                {subscribedSyllabi.has(selectedSyllabus.syllabusId) ? 'Đã Follow' : 'Follow'}
              </button>
              <button 
                className="action-btn feedback-btn-large"
                onClick={() => setFeedbackModal(true)}
              >
                <MessageSquare size={18} />
                Báo cáo lỗi
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📚</div>
          <h2>SMD System</h2>
          <p>Hệ thống quản lý & tra cứu</p>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => setActiveTab('home')}
          >
            <span className="icon"><Home size={20} /></span>
            <span>Trang chủ</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} 
            onClick={() => setActiveTab('search')}
          >
            <span className="icon"><Search size={20} /></span>
            <span>Tra cứu giáo trình</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <ChevronLeft size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="smd-main">
        <header className="smd-header">
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                🔔
                <span className="badge">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
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
                <h1>Chào mừng trở lại, {user?.name ? user.name.split(' ').slice(-1)[0] : 'Bạn'}! 👋</h1>
                <p>Khám phá các giáo trình được đề xuất dành riêng cho bạn</p>
              </div>

              <div className="recommendation-section">
                <div className="section-header">
                  <Star size={20} color="#f1c40f" fill="#f1c40f" />
                  <h2>Khóa học được đề xuất</h2>
                </div>
                <div className="course-grid">
                  {allCourses.map((course) => (
                    <div key={course.courseId} className="course-card">
                      <div className="course-card-header">
                        <span className="course-code">{course.courseCode}</span>
                        <h3 className="course-title">{course.courseName}</h3>
                      </div>
                      <div className="course-card-body">
                        <p><strong>Số tín chỉ:</strong> {course.credits} Tín chỉ</p>
                        <p><strong>Viện:</strong> {course.department?.deptName || 'Đang cập nhật'}</p>
                      </div>
                      <button 
                        className="view-detail-btn" 
                        onClick={() => {
                          const tempSyllabus: Syllabus = {
                            syllabusId: course.courseId,
                            course: course,
                            program: { programName: '' },
                            lecturer: { fullName: 'Chưa xác định' },
                            versionNotes: '',
                            academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
                            versionNo: 1,
                            currentStatus: 'PUBLISHED'
                          };
                          setSelectedSyllabus(tempSyllabus);
                          setDetailModalOpen(true);
                          setActiveViewTool('info');
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
                        className={`action-btn subscribe-btn ${subscribedSyllabi.has(s.syllabusId) ? 'active' : ''}`}
                        onClick={() => handleSubscribe(s.syllabusId)}
                        title="Follow để nhận thông báo"
                      >
                        <Heart size={16} fill={subscribedSyllabi.has(s.syllabusId) ? 'currentColor' : 'none'} />
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
      </main>
    </div>
  );
};

export default StudentDashboard;