import { getUsers, getRecentAuditLogs, createUser, lockUser, unlockUser, assignRoleToUser, getUserRoles, removeRoleFromUser, getAllRoles, getNotificationStats, downloadBulkUserImportTemplate, bulkImportUsers, BulkUserImportResponse, getAllSyllabuses, getDepartments } from '../../services/api';
import React, { useEffect, useState } from 'react';
import { FileText, Download, ShieldAlert, Database, Filter, ShieldCheck, Lock, RotateCcw, X, BookOpen, Home, Users, Bell, User, BarChart3, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SystemManagementPage.css';
import NotificationMenu from '../../components/NotificationMenu';

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
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, totalDepartments: 0, totalSyllabi: 0 });
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [originalRoles, setOriginalRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [paramModalType, setParamModalType] = useState<'department' | 'course'>('department');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportResult, setBulkImportResult] = useState<BulkUserImportResponse | null>(null);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      console.log('Users Response:', data);
      const mappedData = data.map((u: any) => ({
        id: u.userId?.toString() || u.id?.toString() || '',
        name: u.fullName || u.name || '',
        username: u.username || '',
        email: u.email || '',
        roles: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : (u.roleName ? [u.roleName] : []),
        status: (u.status === 'ACTIVE' || u.status === 'Hoạt động') ? 'Hoạt động' : 'Đã khóa',
        createdDate: u.createdAt || u.createdDate || 'N/A'
        }));

      // Try to enrich each user with their full roles list from /roles/user/{id}
      const usersWithRoles = await Promise.all(mappedData.map(async (usr: UserData) => {
        try {
          const resp = await getUserRoles(usr.id);
          const rolesFromApi = resp && resp.roles ? resp.roles : usr.roles || [];
          return { ...usr, roles: rolesFromApi };
        } catch (err) {
          return usr; // fallback
        }
      }));

      console.log('Mapped Users with Roles:', usersWithRoles);
      setUsers(usersWithRoles);
      const totalUsers = usersWithRoles.length;
      const activeUsers = usersWithRoles.filter((u: UserData) => u.status === 'Hoạt động').length;

      // Fetch syllabuses to count total courses
      const syllabusesData = await getAllSyllabuses();
      const totalSyllabi = Array.isArray(syllabusesData) ? syllabusesData.length : 0;

      // Fetch departments to count total departments
      const departmentsData = await getDepartments();
      const totalDepartments = Array.isArray(departmentsData) ? departmentsData.length : 0;

      setStats({
        totalUsers: totalUsers,
        activeToday: activeUsers,
        totalDepartments: totalDepartments,
        totalSyllabi: totalSyllabi
      });
    } catch (error) {
        console.error("Không thể lấy danh sách người dùng:", error);
        setUsers([]);
        setStats({ totalUsers: 0, activeToday: 0, totalDepartments: 0, totalSyllabi: 0 });
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
  const init = async () => {
    try {
      const rolesResp = await getAllRoles();
      const roleNames = Array.isArray(rolesResp) ? rolesResp.map((r: any) => r.roleName || r) : [];
      setAvailableRoles(roleNames);
    } catch (err) {
      console.warn('Không thể tải danh sách roles:', err);
    }
    await fetchSystemData();
    await fetchAuditLogs();
  };
  init();
}, []);

// Fetch notification stats
useEffect(() => {
  const fetchNotificationStats = async () => {
    try {
      const stats = await getNotificationStats();
      console.log('Notification stats:', stats);
      setUnreadNotificationCount(stats?.unreadCount || 0);
    } catch (error) {
      console.error('Lỗi lấy thống kê thông báo:', error);
      setUnreadNotificationCount(0);
    }
  };

  fetchNotificationStats();
  
  // Auto refresh mỗi 30 giây
  const interval = setInterval(fetchNotificationStats, 30000);
  
  // Cleanup interval khi component unmount
  return () => clearInterval(interval);
}, []);

  const fetchAuditLogs = async () => {
    try {
      const data = await getRecentAuditLogs(7);
      console.log('Audit Logs Response:', data);
      const mappedLogs = data.map((log: any) => ({
        id: log.id?.toString() || '',
        time: log.timestamp || log.createdAt || new Date().toLocaleString('vi-VN'),
        user: log.performedBy || 'Unknown',
        action: log.actionType || 'Unknown',
        detail: log.comments || `${log.oldStatus || ''} → ${log.newStatus || ''}`
      }));
      console.log('Mapped Audit Logs:', mappedLogs);
      setAuditLogs(mappedLogs);
    } catch (error) {
      console.error("Không thể lấy audit logs:", error);
      setAuditLogs([]);
    }
  };

    const openRoleModal = async (user: UserData) => {
      try {
        setIsAssignRoleOpen(true);
        const resp = await getUserRoles(user.id);
        const rolesFromApi = (resp && resp.roles) ? resp.roles : user.roles || [];
        setCurrentUser({ ...user, roles: rolesFromApi });
        setOriginalRoles(rolesFromApi || []);
      } catch (error) {
        console.error('Không thể tải vai trò người dùng:', error);
        setCurrentUser(user);
        setOriginalRoles(user.roles || []);
        setIsAssignRoleOpen(true);
      }
    };

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: [] as string[],
    status: 'Hoạt động',
  });

  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, name: 'Giảng viên soạn thảo', role: 'Lecturer', order: 1 },
    { id: 2, name: 'Trưởng bộ môn duyệt', role: 'Head of Department', order: 2 },
    { id: 3, name: 'Phòng đào tạo kiểm tra', role: 'Academic Affairs', order: 3 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = formData.password;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough && !hasSpecialChar) {
      setPasswordError('Mật khẩu phải dài ít nhất 8 ký tự hoặc chứa ít nhất 1 ký tự đặc biệt.');
      return;
    }

    setPasswordError('');
    
    try {
      const newUserData = {
        fullName: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        status: formData.status === 'Hoạt động' ? 'ACTIVE' : 'SUSPENDED'
      };

      console.log('Tạo người dùng:', newUserData);
      const createdUser = await createUser(newUserData);
      console.log('Người dùng được tạo:', createdUser);

      if (formData.roles.length > 0 && createdUser.userId) {
        for (const role of formData.roles) {
          try {
            console.log(`Gán role ${role} cho người dùng ${createdUser.userId}`);
            await assignRoleToUser(createdUser.userId.toString(), role);
          } catch (err) {
            console.error(`Lỗi khi gán role ${role}:`, err);
          }
        }
      }

      await fetchSystemData();
      console.log('Tạo người dùng thành công!');
      setIsModalOpen(false);

      setFormData({
        name: '', username: '', email: '', password: '', 
        roles: [], status: 'Hoạt động'
      });
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      setPasswordError('Lỗi khi tạo người dùng. Vui lòng thử lại!');
    }
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

  const handleAssignRoleSubmit = async () => {
    if (!currentUser) {
      console.log('Không có người dùng nào được chọn!');
      return;
    }

    try {
      console.log(`Cập nhật vai trò cho người dùng: ${currentUser.name}`);

      const newRoles = currentUser.roles || [];
      const rolesToAdd = newRoles.filter(r => !originalRoles.includes(r));
      const rolesToRemove = originalRoles.filter(r => !newRoles.includes(r));

      for (const role of rolesToAdd) {
        try {
          await assignRoleToUser(currentUser.id, role);
          console.log(`Đã gán vai trò ${role} cho ${currentUser.name}`);
        } catch (err: any) {
          if (err?.response?.status === 409) {
            console.warn(`Vai trò ${role} đã tồn tại cho ${currentUser.name}, bỏ qua (409).`);
            continue;
          }
          throw err;
        }
      }

      for (const role of rolesToRemove) {
        try {
          await removeRoleFromUser(currentUser.id, role);
          console.log(`Đã gỡ vai trò ${role} khỏi ${currentUser.name}`);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            console.warn(`Vai trò ${role} không tồn tại cho ${currentUser.name}, bỏ qua (404).`);
            continue;
          }
          console.error(`Lỗi khi gỡ vai trò ${role}:`, err);
        }
      }

      await fetchSystemData();

      setIsAssignRoleOpen(false);
      setCurrentUser(null);
      setOriginalRoles([]);

      console.log('Cập nhật vai trò hoàn tất!');
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
    }
  };

  const handleBulkLockUsers = async () => {
    if (selectedUserIds.length === 0) {
      console.log('Vui lòng chọn người dùng!');
      return;
    }

    try {
      console.log(`Khóa ${selectedUserIds.length} tài khoản...`);
      for (const userId of selectedUserIds) {
        const userToLock = users.find(u => u.id === userId);
        if (userToLock) {
          await lockUser(userId, userToLock.name, userToLock.email);
          console.log(`Đã khóa tài khoản: ${userId}`);
        }
      }
      setSelectedUserIds([]);
      await fetchSystemData();
      console.log('Khóa tài khoản thành công!');
    } catch (error) {
      console.error('Lỗi khi khóa tài khoản:', error);
    }
  };

  const handleBulkUnlockUsers = async () => {
    if (selectedUserIds.length === 0) {
      console.log('Vui lòng chọn người dùng!');
      return;
    }

    try {
      console.log(`Mở khóa ${selectedUserIds.length} tài khoản...`);
      for (const userId of selectedUserIds) {
        const userToUnlock = users.find(u => u.id === userId);
        if (userToUnlock) {
          await unlockUser(userId, userToUnlock.name, userToUnlock.email);
          console.log(`Đã mở khóa tài khoản: ${userId}`);
        }
      }
      setSelectedUserIds([]);
      await fetchSystemData();
      console.log('Mở khóa tài khoản thành công!');
    } catch (error) {
      console.error('Lỗi khi mở khóa tài khoản:', error);
    }
  };

  const handleBulkResetPasswords = async () => {
    if (selectedUserIds.length === 0) {
      console.log('Vui lòng chọn người dùng!');
      return;
    }

    try {
      console.log(`Reset mật khẩu cho ${selectedUserIds.length} tài khoản...`);
      console.warn('⚠️ Chức năng reset mật khẩu chưa được hỗ trợ bởi backend. Người dùng cần sử dụng tính năng "Quên mật khẩu".');
      // Backend doesn't support password reset
      // For now, just log and show message
      setSelectedUserIds([]);
      console.log('Vui lòng hướng dẫn người dùng sử dụng tính năng "Quên mật khẩu" để reset mật khẩu.');
    } catch (error) {
      console.error('Lỗi:', error);
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
    setIsBulkImportOpen(false);
  }
};

  const handleDownloadBulkTemplate = async () => {
    try {
      const blob = await downloadBulkUserImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'user_bulk_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Không thể tải template import:', error);
      alert('Không thể tải file mẫu. Vui lòng thử lại.');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportFile) {
      setBulkImportError('Vui lòng chọn file .xlsx để import.');
      return;
    }

    setBulkImportLoading(true);
    setBulkImportError(null);
    try {
      const result = await bulkImportUsers(bulkImportFile);
      setBulkImportResult(result);
      await fetchSystemData();
    } catch (error) {
      console.error('Lỗi import người dùng hàng loạt:', error);
      setBulkImportError('Import thất bại. Vui lòng kiểm tra file và thử lại.');
    } finally {
      setBulkImportLoading(false);
    }
  };
  if (loading) return <div className="loading-spinner">Đang tải dữ liệu hệ thống...</div>;
  return (
    <div className="system-management-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><BookOpen size={32} /></div>
          <h2>SMD System</h2>
          <p>Hệ thống quản lý & tra cứu Giáo trình</p>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="icon"><Home size={18} /></span>
            Tổng quan
          </div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="icon"><FileText size={18} /></span>
            Báo cáo
          </div>
          <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span className="icon"><Users size={18} /></span>
            Quản lý người dùng
          </div>
          <div className={`nav-item ${activeTab === 'syllabi' ? 'active' : ''}`} onClick={() => setActiveTab('syllabi')}>
            <span className="icon"><BookOpen size={18} /></span>
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
                <Bell size={18} />
                <span className="badge">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            <div className="user-menu">
              <span className="user-icon"><User size={18} /></span>
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
                <div className="stat-icon"><Users size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Người dùng</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BarChart3 size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Hoạt động hôm nay</div>
                  <div className="stat-value">{stats.activeToday}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Database size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Tổng số khoa</div>
                  <div className="stat-value">{stats.totalDepartments}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BookOpen size={20} /></div>
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

        {activeTab === 'reports' && user && user.role === 'ADMIN' && (
          <div className="reports-container">
            <div className="reports-header">
              <h2>Báo cáo thống kê</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Users size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Người dùng</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BarChart3 size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Hoạt động hôm nay</div>
                  <div className="stat-value">{stats.activeToday}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Database size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Tổng số khoa</div>
                  <div className="stat-value">{stats.totalDepartments}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BookOpen size={20} /></div>
                <div className="stat-info">
                  <div className="stat-label">Tổng số giáo trình</div>
                  <div className="stat-value">{stats.totalSyllabi}</div>
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

        {activeTab === 'reports' && (!user || user.role !== 'ADMIN') && (
          <div className="reports-container">
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
              <ShieldAlert size={48} style={{ margin: '0 auto 20px', color: '#999' }} />
              <h3>Chỉ quản trị viên có thể xem báo cáo</h3>
              <p>Bạn không có quyền truy cập phần này. Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
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
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="LECTURER">Giảng viên</option>
                    <option value="HEAD_OF_DEPARTMENT">Trưởng khoa (HoD)</option>
                    <option value="ACADEMIC_AFFAIRS">Phòng đào tạo (AA)</option>
                    <option value="STUDENT">Sinh viên</option>
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
                    {(() => {
                      const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
                      const allLocked = selectedUsers.every(u => u.status === 'Đã khóa');
                      const allActive = selectedUsers.every(u => u.status === 'Hoạt động');
                      
                      if (allActive) {
                        return <button className="bulk-btn lock" onClick={handleBulkLockUsers}><Lock size={14}/> Khóa tài khoản</button>;
                      } else if (allLocked) {
                        return <button className="bulk-btn unlock" onClick={handleBulkUnlockUsers}><Lock size={14}/> Mở khóa tài khoản</button>;
                      } else {
                        return (
                          <>
                            <button className="bulk-btn lock" onClick={handleBulkLockUsers}><Lock size={14}/> Khóa tài khoản</button>
                            <button className="bulk-btn unlock" onClick={handleBulkUnlockUsers}><Lock size={14}/> Mở khóa tài khoản</button>
                          </>
                        );
                      }
                    })()}
                    <button className="bulk-btn reset" onClick={handleBulkResetPasswords}><RotateCcw size={14}/> Reset mật khẩu</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="add-button" onClick={handleDownloadBulkTemplate}>
                  <Download size={16} /> Tải mẫu
                </button>
                <button className="add-button" onClick={() => {
                  setBulkImportError(null);
                  setBulkImportResult(null);
                  setBulkImportFile(null);
                  setIsBulkImportOpen(true);
                }}>
                  <Upload size={16} /> Import hàng loạt
                </button>
                <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Thêm người dùng</button>
              </div>
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
                          <button className="edit-role-btn" onClick={() => openRoleModal(u)}>
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
                  {availableRoles.map(role => (
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
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsAssignRoleOpen(false)}>Hủy</button>
                <button className="submit-btn" onClick={handleAssignRoleSubmit}>Lưu thay đổi</button>
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
                    {availableRoles.map(role => (
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

        {/* Modal Bulk Import Users */}
        {isBulkImportOpen && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" style={{ maxWidth: '720px' }}>
              <div className="modal-header">
                <h3>Import người dùng hàng loạt</h3>
                <button className="close-btn" onClick={() => setIsBulkImportOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p style={{ marginTop: 0, color: '#666' }}>
                  Tải file mẫu, điền dữ liệu theo đúng định dạng rồi tải lên để tạo nhiều tài khoản cùng lúc.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <button type="button" className="add-button" onClick={handleDownloadBulkTemplate}>
                    <Download size={16} /> Tải mẫu Excel
                  </button>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                  />
                </div>

                {bulkImportFile && (
                  <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                    Đã chọn: <strong>{bulkImportFile.name}</strong>
                  </div>
                )}

                {bulkImportError && (
                  <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {bulkImportError}
                  </div>
                )}

                {bulkImportResult && (
                  <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>{bulkImportResult.message || 'Kết quả import'}</div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                      <span>Tổng dòng: {bulkImportResult.totalRows}</span>
                      <span>Thành công: {bulkImportResult.successCount}</span>
                      <span>Lỗi: {bulkImportResult.errorCount}</span>
                    </div>
                  </div>
                )}

                {bulkImportResult?.errors && bulkImportResult.errors.length > 0 && (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                    <table className="data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Dòng</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Vai trò</th>
                          <th>Khoa</th>
                          <th>Lỗi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkImportResult.errors.map((err, idx) => (
                          <tr key={`${err.rowNumber}-${idx}`}>
                            <td>{err.rowNumber}</td>
                            <td>{err.fullName || '-'}</td>
                            <td>{err.email || '-'}</td>
                            <td>{err.roleCode || '-'}</td>
                            <td>{err.departmentCode || '-'}</td>
                            <td style={{ color: '#c62828' }}>{err.errorMessage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsBulkImportOpen(false)}>Đóng</button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleBulkImport}
                  disabled={bulkImportLoading}
                >
                  {bulkImportLoading ? 'Đang import...' : 'Bắt đầu import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemManagementPage;
