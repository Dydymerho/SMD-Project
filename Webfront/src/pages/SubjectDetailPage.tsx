import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, FolderOpen, MessageSquare, Search, GitCompare, Bell, User,
  Plus, ArrowLeft, AlertCircle, MessageCircle, Send, X
} from 'lucide-react';
import NotificationMenu from '../components/NotificationMenu';
import { getCourseById } from '../services/api';
import './SubjectDetailPage.css';
import './dashboard/DashboardPage.css';

interface CourseDetail {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  syllabus?: string;
  prerequisites?: string[];
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Report & Comment modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('content_error');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourseDetail(id);
    }
  }, [id]);

  const loadCourseDetail = async (courseId: string) => {
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportContent.trim()) {
      alert('Vui lòng nhập nội dung báo cáo');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit report
      // await api.post(`/api/v1/syllabuses/${id}/reports`, {
      //   type: reportType,
      //   content: reportContent
      // });
      
      console.log('Report submitted:', { id, reportType, reportContent });
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
      // await api.post(`/api/v1/syllabuses/${id}/comments`, {
      //   content: commentContent
      // });
      
      console.log('Comment submitted:', { id, commentContent });
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo"></div>
            <h2>SMD System</h2>
            <p>Giảng viên</p>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              <span className="icon"><Home size={20} /></span>
              Tổng quan
            </a>
          </nav>
        </aside>
        <main className="main-content">
          <div className="detail-container">
            <p>Đang tải...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo"></div>
            <h2>SMD System</h2>
            <p>Giảng viên</p>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              <span className="icon"><Home size={20} /></span>
              Tổng quan
            </a>
          </nav>
        </aside>
        <main className="main-content">
          <div className="detail-container">
            <p>Không tìm thấy môn học</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar - Same as LecturerDashboard */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"></div>
          <h2>SMD System</h2>
          <p>Giảng viên</p>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><FolderOpen size={20} /></span>
            Giáo trình của tôi
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }}
          >
            <span className="icon"><Plus size={20} /></span>
            Tạo giáo trình mới
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Cộng tác Review
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tra cứu & Theo dõi
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
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
        {/* Header - Same as LecturerDashboard */}
        <header className="page-header">
          <div className="header-left">
            <h1>Chi tiết giáo trình</h1>
            <p>Xem thông tin đầy đủ về giáo trình và nội dung học phần</p>
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

        {/* Detail Content */}
        <div className="content-section" style={{ margin: '20px 40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-back" style={{ 
              background: 'white', 
              border: '1px solid #ddd', 
              padding: '10px 20px', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeft size={20} />
              Quay lại Dashboard
            </button>
          </div>

          <div className="detail-container">
            <div className="detail-header">
              <div className="detail-title">
                <h1>{course.name}</h1>
                <span className="detail-code">{course.code}</span>
              </div>
              <div className="detail-credits">
                <span>{course.credits} tín chỉ</span>
              </div>
            </div>

            <div className="detail-content">
              <section className="detail-section">
                <h2>Mô tả</h2>
                <p>{course.description}</p>
              </section>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <section className="detail-section">
                  <h2>Môn học tiên quyết</h2>
                  <ul>
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </section>
              )}

              {course.syllabus && (
                <section className="detail-section">
                  <h2>Đề cương</h2>
                  <div className="syllabus-content">
                    {course.syllabus}
                  </div>
                </section>
              )}

              {/* Action buttons */}
              <section className="detail-section">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => navigate(`/syllabus/review/${id}`)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <MessageSquare size={18} />
                    Xem tất cả Review
                  </button>
                  <button 
                    onClick={() => setShowCommentModal(true)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <MessageCircle size={18} />
                    Thêm nhận xét
                  </button>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ef4444', color: '#ef4444' }}
                  >
                    <AlertCircle size={18} />
                    Báo cáo vấn đề
                  </button>
                </div>
              </section>
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
};

export default CourseDetailPage;
