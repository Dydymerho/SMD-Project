import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, FileText, Users, Search, Bell, CheckCircle, 
  XCircle, MessageSquare, GitCompare, AlertCircle,
  Eye, Clock, User, Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHoDDashboardStats, getPendingSyllabusesForHoD } from '../../services/workflowService';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface DashboardStats {
  pendingApprovals: number;
  collaborativeReviewActive: number;
  totalSyllabusInDept: number;
  recentNotifications: number;
}

interface PendingSyllabus {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  submissionDate: string;
  version: number;
  currentStatus?: string;
}

const HoDDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'collaborative' | 'analysis'>('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSyllabuses, setPendingSyllabuses] = useState<PendingSyllabus[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApprovals: 0,
    collaborativeReviewActive: 0,
    totalSyllabusInDept: 0,
    recentNotifications: 0,
  });

  useEffect(() => {
    // Fetch HoD statistics
    fetchStats();
    fetchPendingSyllabuses();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHoDDashboardStats();
      setStats(result);
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
      setError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSyllabuses = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const result = await getPendingSyllabusesForHoD();
      const data = Array.isArray(result.data) ? result.data : [];

      const pendingReview = data
        .filter((item: any) => (item.currentStatus || item.status || '').toUpperCase() === 'PENDING_REVIEW')
        .map((item: any) => ({
          id: (item.syllabusId || item.id || '').toString(),
          courseCode: item.courseCode || item.course?.courseCode || 'N/A',
          courseName: item.courseName || item.course?.courseName || 'Giáo trình không tên',
          lecturer: item.lecturerName || item.lecturer?.fullName || item.createdBy?.fullName || 'Chưa rõ',
          submissionDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          version: item.version || 1,
          currentStatus: item.currentStatus
        }));

      setPendingSyllabuses(pendingReview);
    } catch (err) {
      console.error('Lỗi tải giáo trình chờ duyệt:', err);
      setPendingError('Không thể tải danh sách giáo trình chờ duyệt.');
      setPendingSyllabuses([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'review' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-review'); }}
          >
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Giáo trình
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'collaborative' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/hod/collaborative-review'); }}
          >
            <span className="icon"><Users size={20} /></span>
            Quản lý Thảo luận
          </a>
          <a 
            href="#" 
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`} 
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
            <h1>Bảng điều khiển Trưởng Bộ môn</h1>
            <p>Dashboard tổng quan hoạt động và thống kê</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                {stats.recentNotifications > 0 && (
                  <span className="badge">{stats.recentNotifications}</span>
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

        {/* Dashboard Content */}
        <div className="content-section" style={{ padding: '40px' }}>
          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải thống kê...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffebee', borderRadius: '12px', boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)', marginBottom: '24px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f44336', opacity: 0.8 }} />
              <h3 style={{ color: '#f44336', marginBottom: '8px' }}>Lỗi tải dữ liệu</h3>
              <p style={{ color: '#d32f2f', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={fetchStats}
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

          {/* Statistics Cards */}
          {!loading && !error && (
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div className="stat-card" style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #ff9800'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#999', margin: '0 0 8px 0' }}>Chờ Phê duyệt</p>
                  <h3 style={{ color: '#333', margin: 0, fontSize: '28px' }}>
                    {stats.pendingApprovals}
                  </h3>
                </div>
                <FileText size={32} color="#ff9800" style={{ opacity: 0.5 }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #2196f3'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#999', margin: '0 0 8px 0' }}>Thảo luận Đang diễn ra</p>
                  <h3 style={{ color: '#333', margin: 0, fontSize: '28px' }}>
                    {stats.collaborativeReviewActive}
                  </h3>
                </div>
                <Users size={32} color="#2196f3" style={{ opacity: 0.5 }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #4caf50'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#999', margin: '0 0 8px 0' }}>Tổng Giáo trình Bộ môn</p>
                  <h3 style={{ color: '#333', margin: 0, fontSize: '28px' }}>
                    {stats.totalSyllabusInDept}
                  </h3>
                </div>
                <Search size={32} color="#4caf50" style={{ opacity: 0.5 }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #f44336'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#999', margin: '0 0 8px 0' }}>Thông báo Mới</p>
                  <h3 style={{ color: '#333', margin: 0, fontSize: '28px' }}>
                    {stats.recentNotifications}
                  </h3>
                </div>
                <Bell size={32} color="#f44336" style={{ opacity: 0.5 }} />
              </div>
            </div>
          </div>
          )}

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#333', marginTop: 0 }}>Hành động nhanh</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <button
                onClick={() => navigate('/hod/syllabus-review')}
                style={{
                  padding: '16px 24px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f57c00';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ff9800';
                }}
              >
                <FileText size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Phê duyệt Giáo trình
              </button>

              <button
                onClick={() => navigate('/hod/collaborative-review')}
                style={{
                  padding: '16px 24px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1976d2';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2196f3';
                }}
              >
                <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Quản lý Thảo luận
              </button>

              <button
                onClick={() => navigate('/hod/syllabus-analysis')}
                style={{
                  padding: '16px 24px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#388e3c';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#4caf50';
                }}
              >
                <Search size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Tìm kiếm & Phân tích
              </button>
            </div>
          </div>

          {/* Pending Syllabuses Table */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#333', margin: 0 }}>Giáo trình chờ phê duyệt</h2>
              <button
                onClick={() => navigate('/hod/syllabus-review')}
                style={{
                  padding: '8px 14px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Xem tất cả
              </button>
            </div>

            {pendingLoading && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Loader size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#666', margin: 0 }}>Đang tải danh sách...</p>
              </div>
            )}

            {pendingError && !pendingLoading && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#f44336' }}>
                <p style={{ margin: 0 }}>{pendingError}</p>
              </div>
            )}

            {!pendingLoading && !pendingError && pendingSyllabuses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
                <p style={{ margin: 0 }}>Không có giáo trình đang chờ phê duyệt.</p>
              </div>
            )}

            {!pendingLoading && !pendingError && pendingSyllabuses.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã môn học</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên môn học</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Giảng viên</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Ngày nộp</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Phiên bản</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSyllabuses.map((syllabus) => (
                      <tr key={syllabus.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px', color: '#007bff', fontWeight: 600 }}>{syllabus.courseCode}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{syllabus.courseName}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{syllabus.lecturer}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{syllabus.submissionDate}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>v{syllabus.version}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/hod/syllabus-review/${syllabus.id}`)}
                            style={{
                              padding: '6px 12px',
                              background: '#2196f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HoDDashboard;
