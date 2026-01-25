import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, FolderOpen, MessageSquare, Search, GitCompare, Bell, User,
  Plus, ArrowLeft, MessageCircle, AlertCircle, Send, ThumbsUp, Reply, X
} from 'lucide-react';
import NotificationMenu from '../components/NotificationMenu';
import './dashboard/DashboardPage.css';

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
}

interface Report {
  id: string;
  author: string;
  type: string;
  content: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
}

const SyllabusReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'reports'>('comments');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'TS. Trần Văn B',
      authorRole: 'Giảng viên',
      content: 'CLO4 cần bổ sung thêm về kỹ năng phân tích hệ thống. Nội dung hiện tại chưa rõ ràng về mục tiêu cuối cùng.',
      createdAt: '20/01/2026 14:30',
      likes: 3,
      replies: 1
    },
    {
      id: '2',
      author: 'ThS. Lê Thị C',
      authorRole: 'Giảng viên',
      content: 'Trọng số đánh giá giữa kỳ và cuối kỳ nên điều chỉnh để phù hợp hơn với tính chất môn học.',
      createdAt: '19/01/2026 09:15',
      likes: 5,
      replies: 2
    },
  ]);

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      author: 'TS. Nguyễn Văn D',
      type: 'Sai sót nội dung',
      content: 'Module 3 có lỗi chính tả tại trang 15, đoạn 2',
      status: 'pending',
      createdAt: '21/01/2026 10:00'
    },
  ]);

  useEffect(() => {
    if (id) {
      loadReviewData();
    }
  }, [id]);

  const loadReviewData = async () => {
    try {
      // TODO: Call API to get comments and reports
      setLoading(false);
    } catch (error) {
      console.error('Error loading review data:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      alert('Vui lòng nhập nội dung nhận xét');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // TODO: Call API
      const newComment: Comment = {
        id: Date.now().toString(),
        author: user?.name || 'Bạn',
        authorRole: 'Giảng viên',
        content: commentContent,
        createdAt: new Date().toLocaleString('vi-VN'),
        likes: 0,
        replies: 0
      };
      
      setComments([newComment, ...comments]);
      setShowCommentModal(false);
      setCommentContent('');
      alert('✅ Đã thêm nhận xét thành công!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('❌ Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Đang xử lý', className: 'status-badge pending' },
      resolved: { text: 'Đã giải quyết', className: 'status-badge active' },
      rejected: { text: 'Từ chối', className: 'status-badge inactive' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
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
        </aside>
        <main className="main-content">
          <p>Đang tải...</p>
        </main>
      </div>
    );
  }

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
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            <span className="icon"><FolderOpen size={20} /></span>
            Giáo trình của tôi
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }}>
            <span className="icon"><Plus size={20} /></span>
            Tạo giáo trình mới
          </a>
          <a href="#" className="nav-item active">
            <span className="icon"><MessageSquare size={20} /></span>
            Cộng tác Review
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            <span className="icon"><Search size={20} /></span>
            Tra cứu & Theo dõi
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
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

      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1>Review & Nhận xét</h1>
            <p>Xem và đóng góp ý kiến cho giáo trình</p>
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
              gap: '8px'
            }}>
              <ArrowLeft size={20} />
              Quay lại Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs-container" style={{ marginBottom: '20px' }}>
            <button 
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'comments' ? '#008f81' : 'white',
                color: activeTab === 'comments' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                marginRight: '4px'
              }}
            >
              <MessageCircle size={18} style={{ marginRight: '8px', display: 'inline' }} />
              Nhận xét ({comments.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'reports' ? '#008f81' : 'white',
                color: activeTab === 'reports' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <AlertCircle size={18} style={{ marginRight: '8px', display: 'inline' }} />
              Báo cáo ({reports.length})
            </button>
          </div>

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowCommentModal(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={18} />
                  Thêm nhận xét mới
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ color: '#008f81' }}>{comment.author}</strong>
                        <span style={{ color: '#999', fontSize: '13px', marginLeft: '8px' }}>
                          ({comment.authorRole})
                        </span>
                      </div>
                      <span style={{ color: '#999', fontSize: '13px' }}>{comment.createdAt}</span>
                    </div>
                    <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
                      {comment.content}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ThumbsUp size={16} />
                        {comment.likes}
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Reply size={16} />
                        Trả lời ({comment.replies})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Người báo cáo</th>
                      <th>Loại vấn đề</th>
                      <th>Nội dung</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const badge = getReportStatusBadge(report.status);
                      return (
                        <tr key={report.id}>
                          <td><strong>{report.author}</strong></td>
                          <td>{report.type}</td>
                          <td style={{ maxWidth: '300px' }}>{report.content}</td>
                          <td>
                            <span className={badge.className}>{badge.text}</span>
                          </td>
                          <td>{report.createdAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                    <MessageSquare size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nội dung nhận xét</label>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ ý kiến, góp ý của bạn..."
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
                  <button onClick={() => setShowCommentModal(false)} className="btn-secondary">
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

export default SyllabusReviewPage;
