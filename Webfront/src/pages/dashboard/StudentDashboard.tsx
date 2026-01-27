import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronLeft, Loader2, Home, Star, X, Heart, MessageSquare, Zap, TreesIcon } from 'lucide-react';
import { getCourses, searchSyllabuses, getDepartments, getNotificationStats } from '../../services/api';
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
  };
  academicYear: string;
  versionNo: number;
  currentStatus: string;
  versionNotes: string;
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
  const [courses, setCourses] = useState<Course[]>([]);
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
  const [activeViewTool, setActiveViewTool] = useState<'summary' | 'tree' | 'map'>('summary');
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
    setLoading(true);
    try {
      const data = await searchSyllabuses(searchQuery) as Syllabus[];
      setSyllabi(data);
      setSearched(true);
      setActiveTab('search');
    } catch (error) {
      console.error('Lỗi tìm kiếm giáo trình:', error);
      setSyllabi([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (syllabusId: number) => {
    const newSubscribed = new Set(subscribedSyllabi);
    if (newSubscribed.has(syllabusId)) {
      newSubscribed.delete(syllabusId);
    } else {
      newSubscribed.add(syllabusId);
    }
    setSubscribedSyllabi(newSubscribed);
    // TODO: Call API to save subscription
  };

  const handleOpenDetail = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setDetailModalOpen(true);
    setActiveViewTool('summary');
  };

  const handleSendFeedback = () => {
    if (feedbackContent.trim() && selectedSyllabus) {
      console.log('Feedback gửi:', {
        syllabusId: selectedSyllabus.syllabusId,
        content: feedbackContent
      });
      // TODO: Call API to submit feedback
      setFeedbackContent('');
      setFeedbackModal(false);
    }
  };
  useEffect(() => {
    if (searchQuery === '' && searched) {
      setSearched(false);
      setCourses([]);
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
                <p className="modal-subtitle">{selectedSyllabus.course?.courseCode} - {selectedSyllabus.lecturer?.fullName}</p>
              </div>
              <button className="modal-close" onClick={() => setDetailModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`modal-tab ${activeViewTool === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('summary')}
              >
                <Zap size={18} />
                AI Summary
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'tree' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('tree')}
              >
                <TreesIcon size={18} />
                Sơ đồ môn học
              </button>
              <button 
                className={`modal-tab ${activeViewTool === 'map' ? 'active' : ''}`}
                onClick={() => setActiveViewTool('map')}
              >
                <Search size={18} />
                Output Map
              </button>
            </div>

            <div className="modal-body">
              {activeViewTool === 'summary' && (
                <div className="view-tool-content">
                  <h3>AI Tóm tắt giáo trình</h3>
                  <div className="summary-content">
                    <p><strong>Năm học:</strong> {selectedSyllabus.academicYear}</p>
                    <p><strong>Phiên bản:</strong> {selectedSyllabus.versionNo}</p>
                    <p><strong>Trạng thái:</strong> {selectedSyllabus.currentStatus}</p>
                    <div className="summary-text">
                      <p>Giáo trình này cung cấp các kiến thức cơ bản về môn học này. Học viên sẽ học được các khái niệm, kỹ năng cần thiết và cách ứng dụng trong thực tế.</p>
                      <p>Nội dung được chia thành các chương chính giúp học viên tiếp thu dễ dàng hơn.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeViewTool === 'tree' && (
                <div className="view-tool-content">
                  <h3>Sơ đồ Prerequisite & Tiếp theo</h3>
                  <div className="tree-content">
                    <div className="tree-item">
                      <div className="tree-node previous">← Môn học tiên quyết</div>
                      <div className="tree-node current">Môn hiện tại</div>
                      <div className="tree-node next">Môn học tiếp theo →</div>
                    </div>
                  </div>
                </div>
              )}

              {activeViewTool === 'map' && (
                <div className="view-tool-content">
                  <h3>Output Standard Map</h3>
                  <div className="map-content">
                    <div className="map-item">
                      <strong>Mục tiêu học tập:</strong>
                      <ul>
                        <li>Nắm vững các khái niệm cơ bản</li>
                        <li>Phát triển kỹ năng thực hành</li>
                        <li>Áp dụng vào các tình huống thực tế</li>
                        <li>Phát triển tư duy phản biện</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                        <span>{course.courseCode}</span>
                        <h3>{course.courseName}</h3>
                      </div>
                      <div className="course-card-body">
                        <p><strong>Số tín chỉ:</strong> {course.credits} Tín chỉ</p>
                        <p><strong>Viện:</strong> {course.department?.deptName || 'Đang cập nhật'}</p>
                      </div>
                      <button className="view-detail-btn" onClick={() => setDetailModalOpen(true)}>Xem ngay</button>
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
                {!loading && searched && courses.length === 0 && (
                  <p className="status-text">Không tìm thấy môn học nào phù hợp với "{searchQuery}"</p>
                )}
                {!searched && !loading && (
                  <p className="status-text">Nhập tên môn học để bắt đầu tra cứu</p>
                )}
              </div>

              <div className="course-grid">
                {syllabi.length > 0 ? syllabi.map((s) => (
                  <div key={s.syllabusId} className="course-card">
                    <div className="course-card-header">
                      <span>{s.course?.courseCode}</span>
                      <h3>{s.course?.courseName}</h3>
                    </div>
                    <div className="course-card-body">
                      <p><strong>Giảng viên:</strong> {s.lecturer?.fullName}</p>
                      <p><strong>Phiên bản:</strong> {s.versionNo}</p>
                      <p><strong>Năm học:</strong> {s.academicYear}</p>
                    </div>
                    <div className="course-card-actions">
                      <button 
                        className="view-detail-btn"
                        onClick={() => handleOpenDetail(s)}
                      >
                        Xem giáo trình
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