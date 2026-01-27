import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, FileText, CheckCircle, Settings, Search, Bell, 
  XCircle, AlertCircle, Clock, TrendingUp, User, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface DashboardStats {
  pendingLevel2Approvals: number;
  totalPrograms: number;
  totalPLOs: number;
  recentNotifications: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

const AADashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview'>('overview');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pendingLevel2Approvals: 8,
    totalPrograms: 12,
    totalPLOs: 45,
    recentNotifications: 5,
    approvedThisMonth: 23,
    rejectedThisMonth: 3,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Call API to fetch AA statistics
      // const response = await getAADashboardStats();
      // setStats(response);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🎓</div>
          <h2>SMD System</h2>
          <p>Academic Affairs</p>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item active" 
            onClick={(e) => { e.preventDefault(); navigate('/aa/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-approval'); }}
          >
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Level 2
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/aa/program-management'); }}
          >
            <span className="icon"><Settings size={20} /></span>
            Quản lý Chương trình
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-analysis'); }}
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
            <h1>Bảng điều khiển Academic Affairs</h1>
            <p>Quản lý và giám sát tiêu chuẩn học thuật toàn khoa</p>
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
                  <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '14px' }}>Chờ phê duyệt Level 2</p>
                  <h2 style={{ color: '#333', margin: 0, fontSize: '32px' }}>{stats.pendingLevel2Approvals}</h2>
                </div>
                <Clock size={40} color="#ff9800" style={{ opacity: 0.3 }} />
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
                  <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '14px' }}>Đã duyệt tháng này</p>
                  <h2 style={{ color: '#333', margin: 0, fontSize: '32px' }}>{stats.approvedThisMonth}</h2>
                </div>
                <CheckCircle size={40} color="#4caf50" style={{ opacity: 0.3 }} />
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
                  <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '14px' }}>Tổng số chương trình</p>
                  <h2 style={{ color: '#333', margin: 0, fontSize: '32px' }}>{stats.totalPrograms}</h2>
                </div>
                <Settings size={40} color="#2196f3" style={{ opacity: 0.3 }} />
              </div>
            </div>

            <div className="stat-card" style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #9c27b0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '14px' }}>Tổng số PLO</p>
                  <h2 style={{ color: '#333', margin: 0, fontSize: '32px' }}>{stats.totalPLOs}</h2>
                </div>
                <Award size={40} color="#9c27b0" style={{ opacity: 0.3 }} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Hành động nhanh</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <button
                onClick={() => navigate('/aa/syllabus-approval')}
                style={{
                  padding: '16px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle size={18} />
                Phê duyệt Level 2
              </button>
              <button
                onClick={() => navigate('/aa/program-management')}
                style={{
                  padding: '16px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <Settings size={18} />
                Quản lý Chương trình
              </button>
              <button
                onClick={() => navigate('/aa/syllabus-analysis')}
                style={{
                  padding: '16px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <Search size={18} />
                Tìm kiếm Giáo trình
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Hoạt động gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '16px',
                background: '#f9f9f9',
                borderRadius: '8px',
                borderLeft: '4px solid #4caf50'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>
                      Đã phê duyệt: CS301 - Trí tuệ nhân tạo
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      PLO mapping đã được xác minh • Bộ môn CNTT
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999' }}>2 giờ trước</span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f9f9f9',
                borderRadius: '8px',
                borderLeft: '4px solid #f44336'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>
                      Đã từ chối: MATH205 - Giải tích nâng cao
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      Rubrics không đạt tiêu chuẩn • Bộ môn Toán
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999' }}>5 giờ trước</span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f9f9f9',
                borderRadius: '8px',
                borderLeft: '4px solid #2196f3'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#333' }}>
                      Chương trình mới được tạo: Computer Science - AI Track
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      20 PLOs đã được thiết lập
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999' }}>1 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AADashboard;
