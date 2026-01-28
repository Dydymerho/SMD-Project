import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, BarChart3, TrendingUp, Users, FileText, 
  AlertCircle, Home, Bell, User, Award, Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import { 
  getPrincipalDashboardStats, 
  getUnreadNotifications,
  Syllabus 
} from '../../services/api';

const PrincipalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats data
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalPrograms: 0,
    activeSyllabuses: 0,
    systemHealth: 98.5,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await getPrincipalDashboardStats();
        setStats(dashboardStats);

        // Fetch recent notifications as activities
        const notifications = await getUnreadNotifications();
        const notificationCount = Array.isArray(notifications) ? notifications.length : 0;
        setNotificationCount(notificationCount);

        // Map notifications to activities format
        const activities = Array.isArray(notifications) 
          ? notifications.slice(0, 5).map((notif: any) => ({
              id: notif.notificationId,
              type: notif.type === 'APPROVAL_REQUIRED' ? 'approval' : 'system',
              text: notif.message,
              time: formatTime(notif.createdAt),
              urgent: notif.type === 'APPROVAL_REQUIRED',
            }))
          : [];
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return '1 ngày trước';
    return `${diffDays} ngày trước`;
  };

  const quickActions = [
    {
      title: 'Phê duyệt Cuối cùng',
      description: 'Xét duyệt chương trình & đề xuất chiến lược',
      icon: <CheckCircle size={32} />,
      color: '#2196f3',
      action: () => navigate('/principal/final-approval'),
      badge: stats.pendingApprovals,
    },
    {
      title: 'Tổng quan Hệ thống',
      description: 'Xem báo cáo, KPI và trạng thái hoạt động',
      icon: <BarChart3 size={32} />,
      color: '#ff9800',
      action: () => navigate('/principal/system-oversight'),
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🎓</div>
          <h2>SMD System</h2>
          <p>Principal</p>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/principal/dashboard'); }}>
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/principal/final-approval'); }}>
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Cuối cùng
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/principal/system-oversight'); }}>
            <span className="icon"><BarChart3 size={20} /></span>
            Tổng quan Hệ thống
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">Đăng xuất</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1>Principal Dashboard</h1>
            <p>Quản lý chiến lược và giám sát toàn hệ thống</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer' }}>
                <Bell size={24} />
                <span className="badge">{notificationCount}</span>
              </div>
              {isNotificationOpen && <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
            </div>
            {user && (
              <div className="user-info">
                <User size={20} />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <div className="content-section">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f0f0f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
          {/* Stats Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Chờ Phê duyệt</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 700 }}>{stats.pendingApprovals}</h2>
                </div>
                <Award size={40} style={{ opacity: 0.8 }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Đề xuất cần quyết định</p>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Chương trình Đào tạo</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 700 }}>{stats.totalPrograms}</h2>
                </div>
                <Target size={40} style={{ opacity: 0.8 }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Đang hoạt động</p>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Giáo trình Hoạt động</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 700 }}>{stats.activeSyllabuses}</h2>
                </div>
                <FileText size={40} style={{ opacity: 0.8 }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Đã được phê duyệt</p>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Sức khỏe Hệ thống</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 700 }}>{stats.systemHealth}%</h2>
                </div>
                <TrendingUp size={40} style={{ opacity: 0.8 }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Hoạt động tốt</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Chức năng Chính</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  style={{
                    background: 'white',
                    padding: '28px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid transparent',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = action.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {action.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: '#f44336',
                      color: 'white',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}>
                      {action.badge}
                    </div>
                  )}
                  <div style={{ color: action.color, marginBottom: '16px' }}>
                    {action.icon}
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#333' }}>
                    {action.title}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Hoạt động Gần đây</h3>
            {recentActivities.length > 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: activity.type === 'approval' ? '#e3f2fd' : activity.type === 'system' ? '#f3e5f5' : '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {activity.type === 'approval' && <CheckCircle size={20} color="#2196f3" />}
                    {activity.type === 'system' && <Users size={20} color="#9c27b0" />}
                    {activity.type === 'report' && <BarChart3 size={20} color="#ff9800" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', color: '#333', fontSize: '14px', fontWeight: 500 }}>
                      {activity.text}
                      {activity.urgent && (
                        <span style={{
                          marginLeft: '8px',
                          background: '#ffebee',
                          color: '#c62828',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          Urgent
                        </span>
                      )}
                    </p>
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{activity.time}</p>
                  </div>
                  {activity.urgent && <AlertCircle size={20} color="#f44336" />}
                </div>
              ))}
            </div>
            ) : (
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                textAlign: 'center',
                color: '#999'
              }}>
                <AlertCircle size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                <p>Không có hoạt động gần đây</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PrincipalDashboard;
