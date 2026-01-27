import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Home, MessageSquare, CheckCircle, Clock, Search, Bell, User 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface CollaborativeReview {
  id: string;
  courseCode: string;
  courseName: string;
  dueDate: string;
  status: 'active' | 'completed' | 'pending' | 'finalized';
  participantCount: number;
  feedbackCount: number;
  lecturer: string;
  isFinalized?: boolean;
}

const CollaborativeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReview, setNewReview] = useState({
    syllabusId: '',
    description: '',
    deadline: '',
    participants: [] as string[]
  });
  const [reviews, setReviews] = useState<CollaborativeReview[]>([
    {
      id: '1',
      courseCode: 'CS101',
      courseName: 'Lập trình cơ bản',
      dueDate: '2024-02-15',
      status: 'active',
      participantCount: 8,
      feedbackCount: 5,
      lecturer: 'Nguyễn Văn A',
    },
    {
      id: '2',
      courseCode: 'CS102',
      courseName: 'Cấu trúc dữ liệu',
      dueDate: '2024-02-20',
      status: 'pending',
      participantCount: 6,
      feedbackCount: 2,
      lecturer: 'Trần Thị B',
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('active');

  const handleCreateReview = async () => {
    if (!newReview.syllabusId || !newReview.deadline) {
      alert('Vui lòng chọn giáo trình và nhập hạn cuối');
      return;
    }

    try {
      // TODO: Call API to create collaborative review
      // await createCollaborativeReview(newReview);
      alert('✅ Đã tạo phiên thảo luận thành công!');
      setShowCreateModal(false);
      setNewReview({ syllabusId: '', description: '', deadline: '', participants: [] });
      // Reload reviews
    } catch (error) {
      console.error('Error creating review:', error);
      alert('❌ Có lỗi xảy ra khi tạo phiên thảo luận');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="dashboard-page">
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
            <h1>Quản lý Thảo luận Hợp tác</h1>
            <p>Giám sát phản hồi từ các giảng viên bộ môn</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                <span className="badge">2</span>
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

        {/* Header with Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="filter-tabs">
            {(['all', 'active', 'pending', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '10px 16px',
                  background: filter === status ? '#007bff' : '#f5f5f5',
                  color: filter === status ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  marginRight: '8px'
                }}
              >
                {status === 'all' && `Tất cả (${reviews.length})`}
                {status === 'active' && `Đang diễn ra (${reviews.filter(r => r.status === 'active').length})`}
                {status === 'pending' && `Chưa bắt đầu (${reviews.filter(r => r.status === 'pending').length})`}
                {status === 'completed' && `Hoàn thành (${reviews.filter(r => r.status === 'completed').length})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s'
            }}
          >
            + Tạo phiên thảo luận mới
          </button>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredReviews.map(review => (
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
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                  Giảng viên: {review.lecturer}
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

              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                  Hạn cuối:
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 500 }}>
                  {review.dueDate}
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
                      ✅ Đã hoàn tất & chuyển phê duyệt
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => navigate(`/hod/collaborative-review/${review.id}`)}
                  style={{
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
                  <MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Xem Phản hồi
                </button>
                <button
                  style={{
                    padding: '10px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px',
                    transition: 'all 0.3s',
                    opacity: review.status === 'completed' ? 1 : 0.6,
                    pointerEvents: review.status === 'completed' ? 'auto' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (review.status === 'completed') {
                      (e.currentTarget as HTMLButtonElement).style.background = '#388e3c';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (review.status === 'completed') {
                      (e.currentTarget as HTMLButtonElement).style.background = '#4caf50';
                    }
                  }}
                >
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Hoàn thành
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Không có thảo luận nào</h3>
            <p>Không có thảo luận hợp tác trong danh mục này</p>
          </div>
        )}
        </div>

        {/* Create Review Modal */}
        {showCreateModal && (
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
            onClick={() => setShowCreateModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>Tạo phiên thảo luận mới</h2>
              <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                Khởi tạo phiên thảo luận hợp tác để thu thập góp ý từ các giảng viên
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Chọn giáo trình <span style={{ color: '#f44336' }}>*</span>
                </label>
                <select
                  value={newReview.syllabusId}
                  onChange={(e) => setNewReview({ ...newReview, syllabusId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Chọn giáo trình --</option>
                  <option value="1">CS101 - Lập trình cơ bản (v2)</option>
                  <option value="2">CS102 - Cấu trúc dữ liệu (v1)</option>
                  <option value="3">CS201 - Thuật toán nâng cao (v1)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Mô tả phiên thảo luận
                </label>
                <textarea
                  value={newReview.description}
                  onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                  placeholder="Mô tả mục đích, yêu cầu chú ý đặc biệt..."
                  rows={4}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Hạn cuối phản hồi <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input
                  type="date"
                  value={newReview.deadline}
                  onChange={(e) => setNewReview({ ...newReview, deadline: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  Hủy
                </button>
                <button
                  onClick={handleCreateReview}
                  disabled={!newReview.syllabusId || !newReview.deadline}
                  style={{
                    padding: '10px 20px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: (!newReview.syllabusId || !newReview.deadline) ? 0.6 : 1
                  }}
                >
                  Tạo phiên thảo luận
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborativeReviewPage;
