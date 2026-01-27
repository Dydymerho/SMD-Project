import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotificationStats } from '../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await getNotificationStats();
      console.log('Notification stats:', stats);
      setUnreadCount(stats?.unreadCount || 0);
    } catch (error) {
      console.error('Lỗi lấy thống kê thông báo:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Hệ thống quản lý giáo trình
        </Link>
        <div className="navbar-menu">
          <Link
            to="/"
            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Trang chủ
          </Link>
          <Link
            to="/search"
            className={`navbar-item ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Tìm kiếm
          </Link>
          <Link
            to="/profile"
            className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Hồ sơ
          </Link>
        </div>
        <div className="navbar-right">
          <div className="notification-badge">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          {user && (
            <div className="user-info-navbar">
              <User size={20} />
              <span className="user-name-navbar">{user.name}</span>
            </div>
          )}
          <button 
            className="logout-navbar-btn"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
