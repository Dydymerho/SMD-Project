import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, FileText, Users, Search, Bell, CheckCircle, 
  XCircle, MessageSquare, GitCompare, AlertCircle,
  Eye, Clock, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface DashboardStats {
  pendingApprovals: number;
  collaborativeReviewActive: number;
  totalSyllabusInDept: number;
  recentNotifications: number;
}

const HoDDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'collaborative' | 'analysis'>('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApprovals: 5,
    collaborativeReviewActive: 2,
    totalSyllabusInDept: 45,
    recentNotifications: 3,
  });

  useEffect(() => {
    // Fetch HoD statistics
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Call API to fetch HoD statistics
      // const response = await getDashboardStats();
      // setStats(response);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
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
          {/* Statistics Cards */}
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
        </div>
      </main>
    </div>
  );
};

export default HoDDashboard;
