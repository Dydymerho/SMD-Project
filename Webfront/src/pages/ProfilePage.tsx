import React from 'react';
import Navbar from '../components/Navbar';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
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
                <span className="info-value">Nguyễn Văn A</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mã sinh viên:</span>
                <span className="info-value">SV001</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">student@example.com</span>
              </div>
            </div>
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
