import React from 'react';
import Navbar from '../components/Navbar';
import './ProfilePage.css';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>👤</span>
          </div>
          <h1>Hồ sơ người dùng</h1>
        </div>

        <div className="profile-content">
          <section className="profile-section">
            <h2>Thông tin cá nhân</h2>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">{user?.name || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Username:</span>
                <span className="info-value">{user?.username || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vai trò:</span>
                <span className="info-value">{user?.role || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{user?.id || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Quản lý tài khoản</h2>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Đăng xuất
            </button>
          </section>

          <section className="profile-section">
            <h2>Môn học đã đăng ký</h2>
            <p>Chức năng đang được phát triển...</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
