import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Home, FileText, Bell, User,
  MessageSquare, Send, Trash2, Eye, Loader, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import NotificationMenu from '../../components/NotificationMenu';
import { useCollaborativeReview } from '../../hooks/useCollaborativeReview';
import '../dashboard/DashboardPage.css';

const LecturerCollaborativeReviewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationCount = 0;

  // Use shared hook
  const {
    review,
    loading,
    newComment,
    setNewComment,
    isSubmitting,
    handlePostComment,
    handleDeleteComment
  } = useCollaborativeReview(id ? parseInt(id) : undefined);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const onPostComment = () => {
    handlePostComment(
      () => success('Đã gửi góp ý thành công!'),
      (msg) => showError(msg)
    );
  };

  const onDeleteComment = (commentId: number) => {
    handleDeleteComment(
      commentId,
      () => success('Đã xóa góp ý'),
      (msg) => showError(msg)
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} className="spin" style={{ color: '#1976d2', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải chi tiết thảo luận...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={48} style={{ color: '#f44336', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#f44336', margin: '0 0 8px 0' }}>Không tìm thấy thảo luận</h3>
          <p style={{ color: '#666', margin: '0 0 16px 0' }}>Thảo luận này không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => navigate('/lecturer/dashboard')}
            style={{
              padding: '8px 16px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Toast toasts={toasts} onRemove={removeToast} />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📋</div>
          <h2>SMD System</h2>
          <p>Giảng viên</p>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/lecturer/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/lecturer/dashboard'); }}
          >
            <span className="icon"><FileText size={20} /></span>
            Giáo trình của tôi
          </a>
          <a 
            href="#" 
            className="nav-item active" 
            onClick={(e) => { e.preventDefault(); navigate('/lecturer/dashboard'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Phiên Thảo luận
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
            <h1>Chi tiết Phiên Thảo luận</h1>
            <p>Xem và tham gia góp ý về giáo trình</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                {notificationCount > 0 && (
                  <span className="badge">{notificationCount}</span>
                )}
              </div>
              {isNotificationOpen && (
                <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
              )}
            </div>
            {user && (
              <div className="user-info">
                <User size={20} />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="content-section" style={{ padding: '40px' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/lecturer/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={20} />
            Quay lại Dashboard
          </button>

          {/* Syllabus Info Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  {review.courseCode} - {review.syllabusTitle}
                </h2>
                <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                  <strong>Giảng viên:</strong> {review.lecturer}
                </p>
                {review.lecturerEmail && (
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px' }}>
                    {review.lecturerEmail}
                  </p>
                )}
                <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                  <strong>Hạn cuối:</strong> {formatDate(review.deadline)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigate(`/subject/${review.syllabusId}`)}
                  style={{
                    padding: '10px 16px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Eye size={16} />
                  Xem Giáo trình
                </button>
              </div>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {review.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{
                background: '#e3f2fd',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <MessageSquare size={24} style={{ color: '#2196f3', margin: '0 auto 8px' }} />
                <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700, color: '#2196f3' }}>
                  {review.comments.length}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Tổng góp ý</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#333' }}>
              <MessageSquare size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Góp ý từ giảng viên ({review.comments.length})
            </h3>

            {/* Comment List */}
            <div style={{ marginBottom: '24px' }}>
              {review.comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>Chưa có góp ý nào</p>
                </div>
              ) : (
                review.comments.map((comment) => (
                  <div
                    key={comment.commentId}
                    style={{
                      background: '#f9f9f9',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      borderLeft: '4px solid #2196f3'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>
                          {comment.author?.fullName || comment.author?.username || 'Ẩn danh'}
                          {comment.author?.username === user?.username && (
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#2196f3' }}>(Bạn)</span>
                          )}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {comment.author?.username === user?.username && (
                        <button
                          onClick={() => onDeleteComment(comment.commentId)}
                          style={{
                            padding: '6px',
                            background: '#ffebee',
                            color: '#f44336',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Gửi góp ý của bạn</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập góp ý, nhận xét về giáo trình..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={onPostComment}
                disabled={!newComment.trim() || isSubmitting}
                style={{
                  padding: '10px 20px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (!newComment.trim() || isSubmitting) ? 0.6 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Gửi góp ý
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LecturerCollaborativeReviewDetailPage;
