import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotificationStats } from '../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleViewProfile = () => {
    setIsUserMenuOpen(false);
    navigate('/profile');
  };

  const handleChangePassword = () => {
    setIsUserMenuOpen(false);
    navigate('/change-password');
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
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className="user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                title="Tùy chọn người dùng"
              >
                <User size={20} />
                <span className="user-name-navbar">{user.name}</span>
                <ChevronDown size={18} className={`chevron-icon ${isUserMenuOpen ? 'open' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={handleViewProfile}
                  >
                    <User size={16} />
                    <span>Xem hồ sơ</span>
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={handleChangePassword}
                  >
                    <LogOut size={16} />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
