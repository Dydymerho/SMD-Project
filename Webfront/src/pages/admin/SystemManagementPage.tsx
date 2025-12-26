import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SystemManagementPage.css';

interface UserData {
  id: string;
  name: string;
  role: string;
  status: string;
  createdDate: string;
}

const SystemManagementPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Demo data
  const stats = {
    totalUsers: 123,
    activeToday: 1234,
    dataUsage: '12 GB',
    totalSyllabi: 120,
  };

  const users: UserData[] = [
    {
      id: '001',
      name: 'Nguyễn Văn A',
      role: 'Giảng viên',
      status: 'Hoạt động',
      createdDate: '15/12/2025',
    },
    {
      id: '002',
      name: 'Nguyễn Văn B',
      role: 'Sinh viên',
      status: 'Đã khóa',
      createdDate: '15/12/2025',
    },
  ];

  return (
    <div className="system-management-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📚</div>
          <h2>SMD System</h2>
          <p>Hệ thống quản lý & tra cứu Giáo trình</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="icon">🏠</span>
            Tổng quan
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📚</span>
            Báo cáo
          </a>
          <a href="#" className="nav-item">
            <span className="icon">👥</span>
            Quản lý người dùng
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📖</span>
            Quản lý giáo trình
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Thu gọn
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Quản trị hệ thống</h1>
            <p>Quản lý người dùng và cấu hình hệ thống</p>
          </div>
          <div className="header-right">
            <div className="notification-icon">
              🔔
              <span className="badge">2</span>
            </div>
            <div className="user-menu">
              <span className="user-icon">👤</span>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Admin'}</div>
                <div className="user-role">Quản trị hệ thống</div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-label">Người dùng</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-label">Hoạt động hôm nay</div>
              <div className="stat-value">{stats.activeToday}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-info">
              <div className="stat-label">Lưu trữ</div>
              <div className="stat-value">{stats.dataUsage}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-label">Tổng số giáo trình</div>
              <div className="stat-value">{stats.totalSyllabi}</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="content-section">
          <div className="section-header">
            <h2>Quản lý người dùng</h2>
            <button className="add-button">+ Thêm người dùng</button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã người dùng</th>
                  <th>Tên người dùng</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-badge ${user.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.createdDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemManagementPage;
