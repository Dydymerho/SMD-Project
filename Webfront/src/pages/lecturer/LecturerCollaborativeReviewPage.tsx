import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { 
  Users, Home, MessageSquare, CheckCircle, Clock, Bell, User, Loader, AlertCircle, Eye, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAllSyllabuses, getReviewCommentCount } from '../../services/workflowService';
import NotificationMenu from '../../components/NotificationMenu';
import '../dashboard/DashboardPage.css';

interface CommentAuthor {
  username?: string;
  fullName?: string;
  email?: string;
}

interface Comment {
  id?: string;
  author?: CommentAuthor;
  content?: string;
  createdAt?: string;
}

interface CollaborativeReview {
  id: string;
  courseCode: string;
  courseName: string;
  dueDate: string;
  status: 'active' | 'completed' | 'pending' | 'finalized';
  participantCount: number;
  feedbackCount: number;
  lecturer: string;
  lecturerEmail?: string;
  myCommentCount?: number;
  isFinalized?: boolean;
}

const LecturerCollaborativeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [reviews, setReviews] = useState<CollaborativeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('active');
  const notificationCount = 0;

  useEffect(() => {
    loadReviews();
  }, []);

  const mapStatus = (status?: string): CollaborativeReview['status'] => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('approve') || normalized.includes('complete')) return 'completed';
    if (normalized.includes('pending')) return 'pending';
    return 'active';
  };

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAllSyllabuses();
      const list = Array.isArray(result.data) ? result.data : [];

      // Filter syllabuses that are in collaborative review status
      const collaborativeList = list.filter((item: any) => {
        const status = (item.currentStatus || '').toLowerCase();
        return status.includes('review') || status.includes('collab') || status.includes('feedback');
      });

      const mapped = await Promise.all(collaborativeList.map(async (item: any) => {
        const syllabusId = item.syllabusId || item.id;
        const feedbackCount = syllabusId ? await getReviewCommentCount(syllabusId) : 0;

        // Count my comments
        let myCommentCount = 0;
        try {
          if (syllabusId) {
            const commentsResponse = await axiosClient.get(
              `/syllabuses/${syllabusId}/comments/all`
            );
            const allComments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
            myCommentCount = allComments.filter(
              c => c.author?.username === user?.username
            ).length;
          }
        } catch (err) {
          console.log('Could not fetch my comments:', err);
        }

        return {
          id: (syllabusId || '').toString(),
          courseCode: item.courseCode || item.course?.courseCode || 'N/A',
          courseName: item.courseName || item.course?.courseName || 'Giáo trình không tên',
          dueDate: item.updatedAt || item.createdAt || new Date().toISOString(),
          status: mapStatus(item.currentStatus),
          participantCount: item.participantCount || 0,
          feedbackCount,
          lecturer: item.lecturerName || item.lecturer?.fullName || item.createdBy?.fullName || 'Chưa rõ',
          lecturerEmail: item.lecturer?.email || item.createdBy?.email || '',
          myCommentCount,
          isFinalized: mapStatus(item.currentStatus) === 'completed'
        } as CollaborativeReview;
      }));

      setReviews(mapped);
    } catch (err) {
      console.error('Error loading collaborative reviews:', err);
      setError('Không thể tải danh sách thảo luận');
    } finally {
      setLoading(false);
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
            className="nav-item active"
            onClick={(e) => { e.preventDefault(); navigate('/lecturer/collaborative-reviews'); }}
          >
            <span className="icon"><Users size={20} /></span>
            Thảo luận Hợp tác
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
            <h1>Thảo luận Hợp tác</h1>
            <p>Tham gia thảo luận và góp ý về giáo trình</p>
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

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải danh sách thảo luận...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffebee', borderRadius: '12px', boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)', marginBottom: '24px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f44336', opacity: 0.8 }} />
              <h3 style={{ color: '#f44336', marginBottom: '8px' }}>Lỗi tải dữ liệu</h3>
              <p style={{ color: '#d32f2f', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={loadReviews}
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

          {!loading && !error && (
            <>
              {/* Header with Filter */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/collaborative-review/${review.id}`)}
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
                        <Eye size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        Xem Chi tiết
                      </button>
                      <button
                        onClick={() => navigate(`/collaborative-review/${review.id}`)}
                        style={{
                          padding: '10px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '13px',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#388e3c';
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#4caf50';
                        }}
                      >
                        <Send size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        Góp ý
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
                  <p>Bạn chưa được mời tham gia thảo luận hợp tác nào</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LecturerCollaborativeReviewPage;
