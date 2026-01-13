import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, ShieldAlert, Database, FileType } from 'lucide-react';
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

interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  detail: string;
}

const SystemManagementPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
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

  const trafficData = [
    { hour: '00:00', users: 120 }, { hour: '04:00', users: 80 },
    { hour: '08:00', users: 450 }, { hour: '12:00', users: 980 },
    { hour: '16:00', users: 1200 }, { hour: '20:00', users: 600 },
    { hour: '23:59', users: 300 },
  ];

  const auditLogs: AuditLog[] = [
    { id: 'L1', time: '2026-01-13 14:20', user: 'Admin_Hùng', action: 'Thay đổi quyền', detail: 'Nâng quyền HoD cho User Nguyễn Văn A' },
    { id: 'L2', time: '2026-01-13 15:05', user: 'Hệ thống', action: 'Cập nhật Workflow', detail: 'Kích hoạt luồng phê duyệt 3 bước mới' },
    { id: 'L3', time: '2026-01-13 16:30', user: 'Admin_Hùng', action: 'Khóa tài khoản', detail: 'Khóa tài khoản sinh viên 002 do vi phạm' },
  ];

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
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="icon">🏠</span>
            Tổng quan
          </div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="icon">📚</span>
            Báo cáo
          </div>
          <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span className="icon">👥</span>
            Quản lý người dùng
          </div>
          <div className={`nav-item ${activeTab === 'syllabi' ? 'active' : ''}`} onClick={() => setActiveTab('syllabi')}>
            <span className="icon">📖</span>
            Quản lý giáo trình
          </div>
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
        {activeTab === 'overview' && (
          <>
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
          </>
        )}

        {activeTab === 'reports' && (
          <div className="reports-container">
            <div className="reports-action-bar">
              <h2>Báo cáo hệ thống chuyên sâu</h2>
              <div className="export-btns">
                <button className="export-btn pdf"><Download size={16}/> Xuất PDF</button>
                <button className="export-btn excel"><FileText size={16}/> Xuất Excel</button>
              </div>
            </div>

            <div className="content-section chart-section">
              <div className="section-header">
                <h3><ShieldAlert size={20} /> Lưu lượng truy cập hệ thống (24h)</h3>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#764ba2" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="resource-report-grid">
              <div className="stat-card resource">
                <div className="stat-icon"><Database color="#667eea"/></div>
                <div className="stat-info">
                  <div className="stat-label">Dung lượng giáo trình</div>
                  <div className="stat-value">8.4 GB <small>/ 12GB</small></div>
                  <div className="progress-bar"><div className="fill" style={{width: '70%'}}></div></div>
                </div>
              </div>
              <div className="stat-card resource">
                <div className="stat-icon"><FileType color="#ff4444"/></div>
                <div className="stat-info">
                  <div className="stat-label">Tệp PDF đã số hóa</div>
                  <div className="stat-value">450 <small>tệp</small></div>
                </div>
              </div>
              <div className="stat-card resource">
                <div className="stat-icon"><FileType color="#2196f3"/></div>
                <div className="stat-info">
                  <div className="stat-label">Tệp Docx đã số hóa</div>
                  <div className="stat-value">320 <small>tệp</small></div>
                </div>
              </div>
            </div>

            <div className="content-section">
              <div className="section-header">
                <h3>📜 Nhật ký hoạt động hệ thống (Audit Logs)</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Người thực hiện</th>
                      <th>Hành động</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{whiteSpace: 'nowrap'}}>{log.time}</td>
                        <td className="font-bold">{log.user}</td>
                        <td><span className="log-action-tag">{log.action}</span></td>
                        <td>{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
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
        )}
      </main>
    </div>
  );
};

export default SystemManagementPage;
