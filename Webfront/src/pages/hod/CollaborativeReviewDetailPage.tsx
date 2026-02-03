import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Home, Users, Search, Bell, User, FileText,
  MessageSquare, Send, CheckCircle, Clock, UserCheck, AlertCircle,
  Trash2, Download, Eye, Mail, Check, X, Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import axiosClient from '../../api/axiosClient';
import { fetchSyllabusById } from '../../services/workflowService';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
    fullName: string;
    email?: string;
  };
}

interface CollaborativeReviewDetail {
  syllabusId: number;
  syllabusTitle: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  lecturerEmail?: string;
  status: string;
  createdDate: string;
  deadline: string;
  description: string;
  comments: Comment[];
}

const fetchAllComments = async (syllabusId: number) => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/comments/all`);
  return Array.isArray(response.data) ? response.data : [];
};

const postComment = async (syllabusId: number, content: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/comments`, {
    content,
    type: 'REVIEW'
  });
  return response.data;
};

const removeComment = async (syllabusId: number, commentId: number) => {
  await axiosClient.delete(`/syllabuses/${syllabusId}/comments/${commentId}`);
  return true;
};

const CollaborativeReviewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [review, setReview] = useState<CollaborativeReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [compiledSummary, setCompiledSummary] = useState('');
  const notificationCount = 0;

  useEffect(() => {
    loadReviewDetail();
  }, [id]);

  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      if (!id) return;

      // Get syllabus details
      const syllabusData = await fetchSyllabusById(parseInt(id));
      
      // Get all comments for collaborative review
      const commentsData = await fetchAllComments(parseInt(id));

      // Get lecturer name and email from response (already extracted from Lecturer entity)
      const lecturerName = syllabusData?.lecturerName || 'Chưa rõ';
      const lecturerEmail = syllabusData?.lecturerEmail || '';

      // Get course info (already extracted from Course entity)
      const syllabusTitle = syllabusData?.courseName || 'Chưa rõ';
      const courseCode = syllabusData?.courseCode || 'N/A';
      const courseName = syllabusData?.courseName || 'Chưa rõ';

      setReview({
        syllabusId: syllabusData.syllabusId,
        syllabusTitle: syllabusTitle,
        courseCode: courseCode,
        courseName: courseName,
        lecturer: lecturerName,
        lecturerEmail: lecturerEmail,
        status: syllabusData.currentStatus || 'PENDING_REVIEW',
        createdDate: syllabusData.createdAt || new Date().toISOString(),
        deadline: syllabusData.updatedAt || new Date().toISOString(),
        description: 'Xin mời các thầy cô góp ý về nội dung giáo trình.',
        comments: commentsData
      });
    } catch (error) {
      console.error('Error loading review:', error);
      showError('Không thể tải chi tiết thảo luận');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      showError('Vui lòng nhập nội dung góp ý');
      return;
    }

    if (!review) return;

    setIsSubmitting(true);
    try {
      await postComment(review.syllabusId, newComment);
      success('Đã gửi góp ý thành công!');
      setNewComment('');
      // Reload comments
      await loadReviewDetail();
    } catch (error) {
      console.error('Error posting comment:', error);
      showError('Có lỗi xảy ra khi gửi góp ý');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!review) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;

    try {
      await removeComment(review.syllabusId, commentId);
      success('Đã xóa góp ý');
      // Reload comments
      await loadReviewDetail();
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError('Không thể xóa góp ý');
    }
  };

  const handleCompleteReview = () => {
    if (!review) return;

    const summary = `TÓM TẮT PHIÊN THẢO LUẬN HỢP TÁC
Giáo trình: ${review.courseCode} - ${review.syllabusTitle}
Giảng viên: ${review.lecturer}
Thời gian: ${new Date(review.createdDate).toLocaleDateString()} đến ${new Date(review.deadline).toLocaleDateString()}

THỐNG KÊ:
- Tổng số góp ý: ${review.comments.length}

CÁC GÓP Ý:
${review.comments
  .map((c, idx) => `${idx + 1}. ${c.author?.fullName || c.author?.username || 'Ẩn danh'}: ${c.content}`)
  .join('\n\n')}

KẾT LUẬN:
[Trưởng khoa vui lòng bổ sung kết luận và đề xuất]`;

    setCompiledSummary(summary);
    setShowCompleteModal(true);
  };

  const confirmCompleteReview = () => {
    success('Đã hoàn thành phiên thảo luận và chuyển vào quy trình phê duyệt!');
    setTimeout(() => {
      setShowCompleteModal(false);
      navigate('/hod/syllabus-review');
    }, 1500);
  };

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
            onClick={() => navigate('/hod/collaborative-review')}
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
            Quay lại danh sách
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
          <p>Trưởng Bộ môn</p>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-review'); }}
          >
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Giáo trình
          </a>
          <a 
            href="#" 
            className="nav-item active" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/collaborative-review'); }}
          >
            <span className="icon"><Users size={20} /></span>
            Quản lý Thảo luận
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-analysis'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tìm kiếm & Phân tích
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
            <h1>Chi tiết Thảo luận Hợp tác</h1>
            <p>Xem và quản lý góp ý từ các giảng viên</p>
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
            onClick={() => navigate('/hod/collaborative-review')}
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
            Quay lại danh sách
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
                  onClick={() => navigate(`/syllabuses/${review.syllabusId}`)}
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
                          onClick={() => handleDeleteComment(comment.commentId)}
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
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Thêm góp ý của bạn</h4>
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
                onClick={handlePostComment}
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCompleteReview}
              style={{
                padding: '12px 24px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={18} />
              Hoàn thành thảo luận
            </button>
          </div>
        </div>

        {/* Complete Modal */}
        {showCompleteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowCompleteModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '700px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>Hoàn thành Thảo luận Hợp tác</h2>
              <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                Xem lại tóm tắt và xác nhận hoàn thành phiên thảo luận. Sau khi xác nhận, giáo trình sẽ được chuyển vào quy trình phê duyệt chính thức.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Tóm tắt phiên thảo luận
                </label>
                <textarea
                  value={compiledSummary}
                  onChange={(e) => setCompiledSummary(e.target.value)}
                  rows={15}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    lineHeight: 1.6
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  <X size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Hủy
                </button>
                <button
                  onClick={confirmCompleteReview}
                  style={{
                    padding: '10px 20px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Check size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Xác nhận hoàn thành
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborativeReviewDetailPage;
