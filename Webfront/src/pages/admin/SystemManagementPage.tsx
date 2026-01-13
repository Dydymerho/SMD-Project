import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SystemManagementPage.css';
import NotificationMenu from '../../components/NotificationMenu';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Giảng viên',
    status: 'Hoạt động',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const password = formData.password;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough && !hasSpecialChar) {
      setPasswordError('Mật khẩu phải dài ít nhất 8 ký tự hoặc chứa ít nhất 1 ký tự đặc biệt.');
      return;
    }

    setPasswordError('');
    console.log('Dữ liệu hợp lệ, đang gửi...', formData);
    setIsModalOpen(false);

    setFormData({
      name: '', username: '', email: '', password: '', 
      role: 'Giảng viên', status: 'ACTIVE'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordError('');
  };

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
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                🔔
                <span className="badge">2</span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
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
            <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Thêm người dùng</button>
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
          {/* Modal Popup */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Thêm người dùng mới</h3>
                  <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="user-form">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input type="text" name="name" placeholder="Nhập họ tên người dùng" value={formData.name}
                      onChange={handleInputChange}required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên đăng nhập (username)</label>
                      <input 
                        type="text" 
                        name="username"
                        placeholder="vana_nguyen" 
                        value={formData.username}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="example@school.edu.vn" 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu tạm thời</label>
                    <input 
                      type="password" 
                      name="password"
                      placeholder="••••••••" 
                      className={passwordError ? 'input-error' : ''}
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                    {passwordError && <span className="error-message">{passwordError}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Vai trò</label>
                      <select name="role" value={formData.role} onChange={handleInputChange}>
                        <option value="Giảng viên">Giảng viên</option>
                        <option value="Sinh viên">Sinh viên</option>
                        <option value="Quản trị viên">Quản trị viên</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Đã khóa">Khóa tài khoản</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
                    <button type="submit" className="submit-btn">Tạo người dùng</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SystemManagementPage;
