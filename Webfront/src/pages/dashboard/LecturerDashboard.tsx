import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, FileText, BookOpen, Bell, User, Clock, CheckCircle, 
  Edit, Eye, Plus, FolderOpen, GitCompare, MessageSquare, AlertCircle, 
  Filter, Download, Upload, Star, Trash2, Send, X, MessageCircle
} from 'lucide-react';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Syllabus {
  id: string;
  name: string;
  semester?: string;
  status?: string;
  lastUpdated?: string;
  version: string;
  instructor?: string;
  submittedDate?: string;
  approvedDate?: string;
  comments?: number;
  following?: boolean;
  collaborators?: number;
}

const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-syllabi' | 'collaborative' | 'search' | 'management'>('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentSyllabusId, setCurrentSyllabusId] = useState<string>('');
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('content_error');
  const [commentContent, setCommentContent] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lecturer specific stats
  const stats = {
    totalSyllabi: 8,
    inProgress: 2,
    pendingApproval: 3,
    approved: 5,
    collaborative: 4,
    followed: 6,
  };

  // Function 1 & 2: My Syllabi (Create & Update)
  const mySyllabi: Syllabus[] = [
    {
      id: 'CS101',
      name: 'Nhập môn Công nghệ thông tin',
      semester: 'HK I 2023-2024',
      status: 'Đã duyệt',
      lastUpdated: '15/12/2025',
      version: 'v2.1',
      comments: 3,
      following: true,
    },
    {
      id: 'CS201',
      name: 'Kỹ thuật lập trình',
      semester: 'HK II 2023-2024',
      status: 'Chờ duyệt',
      lastUpdated: '20/01/2026',
      version: 'v1.0',
      comments: 1,
      following: false,
    },
    {
      id: 'CS301',
      name: 'Cấu trúc dữ liệu và giải thuật',
      semester: 'HK I 2024-2025',
      status: 'Đang soạn',
      lastUpdated: '25/01/2026',
      version: 'v0.5',
      comments: 0,
      following: false,
    },
  ];

  // Function 4: Collaborative Review
  const collaborativeSyllabi: Syllabus[] = [
    {
      id: 'CS102',
      name: 'Lập trình hướng đối tượng',
      instructor: 'TS. Trần Văn B',
      submittedDate: '18/01/2026',
      version: 'v1.2',
      comments: 5,
      status: 'Đang cộng tác',
      collaborators: 3,
    },
    {
      id: 'CS202',
      name: 'Cơ sở dữ liệu',
      instructor: 'ThS. Lê Thị C',
      submittedDate: '22/01/2026',
      version: 'v2.0',
      comments: 2,
      status: 'Đang cộng tác',
      collaborators: 5,
    },
  ];

  // Function 3: Search & Follow
  const searchResults: Syllabus[] = [
    {
      id: 'CS103',
      name: 'Mạng máy tính',
      semester: 'HK I 2024-2025',
      status: 'Hoạt động',
      lastUpdated: '10/01/2026',
      version: 'v3.0',
      instructor: 'PGS.TS Nguyễn Văn D',
      following: true,
    },
    {
      id: 'CS203',
      name: 'Hệ điều hành',
      semester: 'HK II 2023-2024',
      status: 'Hoạt động',
      lastUpdated: '05/01/2026',
      version: 'v1.8',
      instructor: 'TS. Phạm Thị E',
      following: false,
    },
  ];

  const handleViewDetails = (id: string) => {
    navigate(`/subject/${id}`);
  };

  const handleToggleFollow = (id: string) => {
    console.log('Toggle follow:', id);
  };

  const handleAddComment = (id: string) => {
    setCurrentSyllabusId(id);
    setShowCommentModal(true);
  };

  const handleReportError = (id: string) => {
    setCurrentSyllabusId(id);
    setShowReportModal(true);
  };

  const handleCompareVersions = (id: string) => {
    navigate(`/syllabus/compare/${id}`);
  };

  const handleSubmitReport = async () => {
    if (!reportContent.trim()) {
      alert('Vui lòng nhập nội dung báo cáo');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit report
      console.log('Report submitted:', { currentSyllabusId, reportType, reportContent });
      alert('✅ Đã gửi báo cáo thành công!');
      setShowReportModal(false);
      setReportContent('');
      setReportType('content_error');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('❌ Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      alert('Vui lòng nhập nội dung nhận xét');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit comment
      console.log('Comment submitted:', { currentSyllabusId, commentContent });
      alert('✅ Đã thêm nhận xét thành công!');
      setShowCommentModal(false);
      setCommentContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('❌ Có lỗi xảy ra khi thêm nhận xét');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToHoD = async () => {
    if (!submitNote.trim()) {
      alert('Vui lòng nhập ghi chú cho trưởng khoa');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit syllabus to HoD
      // PUT /api/v1/syllabuses/${currentSyllabusId}/submit
      console.log('Submitting to HoD:', { currentSyllabusId, submitNote });
      
      alert('✅ Đã gửi giáo trình cho Trưởng khoa duyệt thành công!');
      setShowSubmitModal(false);
      setSubmitNote('');
      
      // TODO: Refresh syllabus list to update status
      window.location.reload();
    } catch (error) {
      console.error('Error submitting to HoD:', error);
      alert('❌ Có lỗi xảy ra khi gửi giáo trình');
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
            className={`nav-item ${activeTab === 'collaborative' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('collaborative'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Cộng tác Review
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
              {activeTab === 'search' && 'Tra cứu & Theo dõi'}
              {activeTab === 'management' && 'Quản lý nâng cao'}
            </h1>
            <p>
              {activeTab === 'overview' && 'Dashboard tổng quan hoạt động và thống kê'}
              {activeTab === 'my-syllabi' && 'Tạo mới, cập nhật và quản lý giáo trình'}
              {activeTab === 'collaborative' && 'Review và đóng góp ý kiến cho giáo trình đồng nghiệp'}
              {activeTab === 'search' && 'Tìm kiếm và theo dõi giáo trình để nhận thông báo'}
              {activeTab === 'management' && 'So sánh phiên bản, CLO-PLO mapping, module tree'}
            </p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <Bell size={24} />
                <span className="badge">5</span>
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
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã MH</th>
                      <th>Tên môn học</th>
                      <th>Trạng thái</th>
                      <th>Cập nhật</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySyllabi.slice(0, 3).map((syllabus) => (
                      <tr key={syllabus.id}>
                        <td>{syllabus.id}</td>
                        <td>{syllabus.name}</td>
                        <td>
                          <span className={`status-badge ${
                            syllabus.status === 'Đã duyệt' ? 'active' : 
                            syllabus.status === 'Chờ duyệt' ? 'pending' : 'draft'
                          }`}>
                            {syllabus.status}
                          </span>
                        </td>
                        <td>{syllabus.lastUpdated}</td>
                        <td>
                          <button className="icon-btn" onClick={() => handleViewDetails(syllabus.id)}>
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  {mySyllabi.map((syllabus) => (
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
                            onClick={() => handleViewDetails(syllabus.id)} 
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
                          {syllabus.status === 'Đang soạn' && (
                            <>
                              <button 
                                className="icon-btn success" 
                                onClick={() => {
                                  setCurrentSyllabusId(syllabus.id);
                                  setShowSubmitModal(true);
                                }} 
                                title="Gửi Trưởng khoa duyệt"
                              >
                                <Send size={18} />
                              </button>
                              <button 
                                className="icon-btn danger" 
                                onClick={() => {}} 
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
                            onClick={() => navigate(`/syllabus/review/${syllabus.id}`)} 
                            title="Xem tất cả Review"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="icon-btn primary" 
                            onClick={() => handleAddComment(syllabus.id)} 
                            title="Thêm góp ý"
                          >
                            <MessageSquare size={18} />
                          </button>
                          <button 
                            className="icon-btn warning" 
                            onClick={() => handleReportError(syllabus.id)} 
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
            </div>

            <div className="collaboration-info">
              <AlertCircle size={20} />
              <p>Giai đoạn cộng tác cho phép bạn review, góp ý và báo lỗi. Bạn có thể chỉnh sửa hoặc xóa góp ý của mình.</p>
            </div>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="filter-btn">
                  <Filter size={18} />
                  Lọc
                </button>
              </div>
            </div>

            <div className="table-container">
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
                        <button className="icon-btn" onClick={() => handleViewDetails(syllabus.id)}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <label>Mã giáo trình: <strong>{currentSyllabusId}</strong></label>
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
    </div>
  );
};

export default LecturerDashboard;
