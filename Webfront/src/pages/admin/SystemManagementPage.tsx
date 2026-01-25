import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, ShieldAlert, Database, FileType, Filter, ShieldCheck, Lock, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SystemManagementPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import axiosClient from '../../api/axiosClient';

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  roles: string[];
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
  const [users, setUsers] = useState<UserData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, totalSyllabi: 0, dataUsage: '0 GB' });
  const [loading, setLoading] = useState(true);


  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [paramModalType, setParamModalType] = useState<'department' | 'course'>('department');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/users');
      const mappedData = response.data.map((u: any) => ({
            id: u.userId.toString(),
            name: u.fullName,
            username: u.username,
            email: u.email,
            roles: u.roles, 
            status: u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa',
            createdDate: u.createdAt || 'N/A'
        }));

      setUsers(mappedData);
    } catch (error) {
        console.error("Không thể lấy danh sách người dùng:", error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchSystemData();
}, []);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: [] as string[],
    status: 'Hoạt động',
  });

  const trafficData = [
    { hour: '00:00', users: 120 }, { hour: '04:00', users: 80 },
    { hour: '08:00', users: 450 }, { hour: '12:00', users: 980 },
    { hour: '16:00', users: 1200 }, { hour: '20:00', users: 600 },
    { hour: '23:59', users: 300 },
  ];

  const SYSTEM_ROLES = [
    'Admin System',
    'Lecturer',
    'Head of Department',
    'Principal',
    'Academic Affairs (AA)',
    'Student'
  ];

  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, name: 'Giảng viên soạn thảo', role: 'Lecturer', order: 1 },
    { id: 2, name: 'Trưởng bộ môn duyệt', role: 'Head of Department', order: 2 },
    { id: 3, name: 'Phòng đào tạo kiểm tra', role: 'Academic Affairs', order: 3 },
  ]);

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
      roles: ['Giảng viên'], status: 'ACTIVE'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordError('');
  };

  const handleRoleToggle = (role: string, target: 'form' | 'edit') => {
    if (target === 'form') {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.includes(role) 
          ? prev.roles.filter(r => r !== role) 
          : [...prev.roles, role]
      }));
    } else if (currentUser) {
      setCurrentUser(prev => prev ? ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }) : null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = filterRole === 'All' || u.roles.includes(filterRole);
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchRole && matchStatus;
  });

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (type: 'role' | 'status', value: string) => {
    if (type === 'role') setFilterRole(value);
    if (type === 'status') setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newSteps = [...workflowSteps];
    const draggedItem = newSteps[draggedItemIndex];
    newSteps.splice(draggedItemIndex, 1);
    newSteps.splice(index, 0, draggedItem);
    const updatedSteps = newSteps.map((step, idx) => ({
      ...step,
      order: idx + 1
    }));
    setDraggedItemIndex(index);
    setWorkflowSteps(updatedSteps);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    console.log("Quy trình mới đã được lưu:", workflowSteps);
  };

  const openParamModal = (type: 'department' | 'course') => {
    setParamModalType(type);
    setIsParamModalOpen(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (e.target === e.currentTarget) {
    setIsModalOpen(false);
    setIsAssignRoleOpen(false);
  }
};
  if (loading) return <div className="loading-spinner">Đang tải dữ liệu hệ thống...</div>;
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
            Đăng xuất
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
                  {currentItems.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">{u.name?.charAt(0) || 'U'}</div>
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-muted">{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="roles-list-tags">
                          {/* Mapping dựa trên mảng roles của UserRoleResponse */}
                          {u.roles.map(r => <span key={r} className="role-tag">{r}</span>)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${u.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div className="users-management-container">
            <div className="section-header-main">
              <h2>Quản lý người dùng hệ thống</h2>
            </div>

            {/* 1. Bộ lọc nâng cao */}
            <div className="filter-bar">
              <div className="filter-left-group">
                <div className="filter-group">
                  <Filter size={18} />
                  <select value={filterRole} onChange={(e) => handleFilterChange('role', e.target.value)}>
                    <option value="All">Tất cả vai trò</option>
                    <option value="Admin System">Quản trị viên</option>
                    <option value="Lecturer">Giảng viên</option>
                    <option value="Head of Department">Trưởng khoa (HoD)</option>
                    <option value="Academic Affair (AA)">Phòng đào tạo (AA)</option>
                    <option value="Student">Sinh viên</option>
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Đã khóa">Đã khóa</option>
                  </select>
                </div>

                {/* 2. Tính năng hàng loạt (Chỉ hiện khi có người dùng được chọn) */}
                {selectedUserIds.length > 0 && (
                  <div className="bulk-actions">
                    <span>Đang chọn {selectedUserIds.length} người dùng:</span>
                    <button className="bulk-btn lock"><Lock size={14}/> Khóa tài khoản</button>
                    <button className="bulk-btn reset"><RotateCcw size={14}/> Reset mật khẩu</button>
                  </div>
                )}
              </div>
              <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Thêm người dùng</button>
            </div>

            <div className="content-section">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedUserIds.length === users.length} 
                          onChange={toggleSelectAll} 
                        />
                      </th>
                      <th>Mã số</th>
                      <th>Người dùng</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((u) => (
                      <tr key={u.id} className={selectedUserIds.includes(u.id) ? 'row-selected' : ''}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedUserIds.includes(u.id)} 
                            onChange={() => toggleSelectUser(u.id)} 
                          />
                        </td>
                        <td>{u.id}</td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">{u.name.charAt(0)}</div>
                            <div>
                              <div className="font-bold">{u.name}</div>
                              <div className="text-muted">{u.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="roles-list-tags">
                            {u.roles.map(r => <span key={r} className="role-tag">{r}</span>)}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${u.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button className="edit-role-btn" onClick={() => { setCurrentUser(u); setIsAssignRoleOpen(true); }}>
                            <ShieldCheck size={16} /> Sửa vai trò
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-wrapper">
                  <span className="pagination-info">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} trên {filteredUsers.length} người dùng
                  </span>
                  <div className="pagination-btns">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Trước
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        className={currentPage === i + 1 ? 'active' : ''}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'syllabi' && (
          <div className="syllabi-management-container">
            <div className="section-header-main">
              <h2>Cấu hình & Quản lý giáo trình</h2>
            </div>

            <div className="syllabi-status-grid">
              <div className="status-mini-card draft">
                <span className="dot"></span>
                <div className="info">
                  <div className="label">Bản nháp</div>
                  <div className="count">45</div>
                </div>
              </div>
              <div className="status-mini-card pending">
                <span className="dot"></span>
                <div className="info">
                  <div className="label">Chờ phê duyệt</div>
                  <div className="count">12</div>
                </div>
              </div>
              <div className="status-mini-card completed">
                <span className="dot"></span>
                <div className="info">
                  <div className="label">Đã hoàn tất</div>
                  <div className="count">128</div>
                </div>
              </div>
            </div>

            <div className="management-flex-layout">
              <div className="content-section workflow-config">
                <div className="section-header">
                  <h3><RotateCcw size={18} /> Cấu hình luồng phê duyệt</h3>
                  <button className="text-btn">Chỉnh sửa</button>
                </div>
                <div className="workflow-steps-vertical">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className={`workflow-step-item ${draggedItemIndex === index ? 'dragging' : ''}`}
                    draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}>
                      <div className="drag-handle">⠿</div>
                      <div className="step-number">{step.order}</div>
                      <div className="step-content">
                        <div className="step-name">{step.name}</div>
                        <div className="step-role-badge">{step.role}</div>
                      </div>
                      {index < workflowSteps.length - 1 && <div className="step-connector"></div>}
                    </div>
                  ))}
                </div>
                <button className="add-param-link" onClick={() => openParamModal('department')}>+ Thêm bước phê duyệt</button>
              </div>
              <div className="content-section parameters-config">
                <div className="section-header">
                  <h3><Database size={18} /> Danh mục hệ thống</h3>
                </div>
                <div className="parameter-tabs">
                  <div className="parameter-card">
                    <h4>Khoa & Viện</h4>
                    <ul className="parameter-list">
                      <li>Khoa Công nghệ thông tin <span className="count">12 giảng viên</span></li>
                      <li>Khoa Kinh tế số <span className="count">8 giảng viên</span></li>
                      <li>Viện Đào tạo Quốc tế <span className="count">5 giảng viên</span></li>
                    </ul>
                    <button className="add-param-link" onClick={() => openParamModal('department')}>+ Thêm khoa mới</button>
                  </div>
                  
                  <div className="parameter-card">
                    <h4>Học phần (Courses)</h4>
                    <div className="search-mini">
                      <input type="text" placeholder="Tìm mã học phần..." />
                    </div>
                    <ul className="parameter-list scrollable">
                      <li>IT001 - Lập trình C++</li>
                      <li>IT002 - Cấu trúc dữ liệu</li>
                      <li>EC005 - Kinh tế vĩ mô</li>
                    </ul>
                    <button className="add-param-link">+ Thêm học phần</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chỉnh sửa vai trò */}
        {isAssignRoleOpen && currentUser && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content role-edit-modal">
              <div className="modal-header">
                <h3>Chỉnh sửa vai trò: {currentUser.name}</h3>
                <button className="close-btn" onClick={() => setIsAssignRoleOpen(false)}><X /></button>
              </div>
              <div className="modal-body">
                <p className="description">Tick chọn để thêm hoặc bớt các vai trò cho tài khoản này.</p>
                <div className="roles-grid-selection">
                  {SYSTEM_ROLES.map(role => (
                    <label key={role} className="checkbox-item card-style">
                      <input 
                        type="checkbox" 
                        checked={currentUser.roles.includes(role)}
                        onChange={() => handleRoleToggle(role, 'edit')}
                      />
                      <div className="role-name-info">{role}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsAssignRoleOpen(false)}>Hủy</button>
                <button className="submit-btn">Lưu thay đổi</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal Create User */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
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
                      type="text" name="username" placeholder="vana_nguyen" value={formData.username} 
                      onChange={handleInputChange} required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" name="email" placeholder="example@school.edu.vn" 
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
                <div className="form-group full-width">
                  <label>Vai trò</label>
                  <div className="roles-grid-selection">
                    {SYSTEM_ROLES.map(role => (
                      <label key={role} className="checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={formData.roles.includes(role)}
                          onChange={() => handleRoleToggle(role, 'form')}
                        />
                        <span>{role}</span>
                      </label>
                  ))}
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
        {isParamModalOpen && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsParamModalOpen(false)}>
            <div className="modal-content param-modal">
              <div className="modal-header">
                <h3>{paramModalType === 'department' ? 'Thêm Khoa/Viện mới' : 'Thêm Học phần mới'}</h3>
                <button className="close-btn" onClick={() => setIsParamModalOpen(false)}>&times;</button>
              </div>
              <div className="param-modal-body">
                <form onSubmit={(e) => { e.preventDefault(); setIsParamModalOpen(false); }}>
                  <div className="form-group">
                    <label>{paramModalType === 'department' ? 'Tên Khoa/Viện' : 'Tên học phần'}</label>
                    <input type="text" placeholder="Nhập tên..." required />
                  </div>
                  {paramModalType === 'course' && (
                    <div className="form-group">
                      <label>Mã học phần</label>
                      <input type="text" placeholder="Ví dụ: IT001" required />
                    </div>
                  )}
                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setIsParamModalOpen(false)}>Hủy</button>
                    <button type="submit" className="submit-btn">Xác nhận thêm</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemManagementPage;
