import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Syllabus {
  id: string;
  name: string;
  semester?: string;
  status?: string;
  lastUpdated?: string;
  version: string;
  instructor?: string;
  submittedDate?: string;
  approvedDate?: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-syllabi' | 'pending' | 'approved' | 'search'>('my-syllabi');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Demo data
  const stats = {
    totalSyllabi: 4,
    submitted: 1,
    pending: 2,
    approved: 1,
  };

  const mySyllabi: Syllabus[] = [
    {
      id: '001',
      name: 'Nhập môn Công nghệ thông tin',
      semester: 'HK I 2023-2024',
      status: 'Hoạt động',
      lastUpdated: '15/12/2025',
      version: 'v1.0',
    },
    {
      id: '002',
      name: 'Kỹ thuật lập trình',
      semester: 'HK II 2023 - 2024',
      status: 'Chờ duyệt',
      lastUpdated: '15/12/2025',
      version: 'v1.0',
    },
  ];

  const pendingSyllabi: Syllabus[] = [
    {
      id: '001',
      name: 'Nhập môn Công nghệ thông tin',
      instructor: 'Nguyễn Văn A',
      submittedDate: '15/12/2025',
      version: 'v1.1',
    },
    {
      id: '002',
      name: 'Kỹ thuật lập trình',
      instructor: 'Nguyễn Văn B',
      submittedDate: '15/12/2025',
      version: 'v1.2',
    },
  ];

  const approvedSyllabi: Syllabus[] = [
    {
      id: '001',
      name: 'Nhập môn Công nghệ thông tin',
      instructor: 'Nguyễn Văn A',
      submittedDate: '15/12/2025',
      approvedDate: '15/12/2025',
      version: 'v1.1',
    },
    {
      id: '002',
      name: 'Kỹ thuật lập trình',
      instructor: 'Nguyễn Văn B',
      submittedDate: '15/12/2025',
      approvedDate: '15/12/2025',
      version: 'v1.2',
    },
  ];

  const searchResults: Syllabus[] = [
    {
      id: '001',
      name: 'Kỹ thuật lập trình',
      semester: 'HK I 2024 - 2025',
      status: 'Hoạt động',
      lastUpdated: '15/12/2025',
      version: 'v1.0',
    },
    {
      id: '002',
      name: 'Kỹ thuật lập trình',
      semester: 'HK II 2023 - 2024',
      status: 'Hoạt động',
      lastUpdated: '15/12/2025',
      version: 'v1.2',
    },
  ];

  const handleViewDetails = (id: string) => {
    navigate(`/subject/${id}`);
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📚</div>
          <h2>SMD System</h2>
          <p>Hệ thống quản lý & tra cứu Giáo trình</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active" onClick={() => setActiveTab('my-syllabi')}>
            <span className="icon">🏠</span>
            Tổng quan
          </a>
          <a href="#" className="nav-item" onClick={() => setActiveTab('search')}>
            <span className="icon">🔍</span>
            Tra cứu giáo trình
          </a>
          <a href="#" className="nav-item" onClick={() => setActiveTab('pending')}>
            <span className="icon">📝</span>
            Phê duyệt
          </a>
          <a href="#" className="nav-item">
            <span className="icon">📚</span>
            Báo cáo
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
            <h1>Tổng quan</h1>
            <p>{activeTab === 'my-syllabi' ? 'Quản lý giáo trình và tiến độ phát triển' : activeTab === 'pending' ? 'Phê duyệt và quản lý giáo trình' : 'Tìm kiếm và xem giáo trình các môn học'}</p>
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
                <div className="user-name">{user?.name || 'Người dùng'}</div>
                <div className="user-role">{user?.role === 'TEACHER' ? 'Giảng viên' : user?.role === 'STUDENT' ? 'Sinh viên' : 'Admin'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📚</div>
            <div className="stat-info">
              <div className="stat-label">Tổng số giáo trình</div>
              <div className="stat-value">{stats.totalSyllabi}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⏳</div>
            <div className="stat-info">
              <div className="stat-label">{activeTab === 'pending' ? 'Chờ phê duyệt' : 'Đã nộp'}</div>
              <div className="stat-value">{activeTab === 'pending' ? stats.pending : stats.submitted}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <div className="stat-label">{activeTab === 'pending' ? 'Đã duyệt' : 'Chờ duyệt'}</div>
              <div className="stat-value">{activeTab === 'pending' ? stats.approved : stats.pending}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">✏️</div>
            <div className="stat-info">
              <div className="stat-label">Đã nhận xét</div>
              <div className="stat-value">{stats.approved}</div>
            </div>
          </div>
        </div>

        {/* Create Syllabus Button for Teachers */}
        {user?.role === 'TEACHER' && activeTab === 'my-syllabi' && (
          <div className="action-bar">
            <button 
              className="btn-create-syllabus"
              onClick={() => navigate('/syllabus/create')}
            >
              <span className="icon">➕</span>
              Tạo đề cương mới
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'my-syllabi' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Giáo trình của tôi</h2>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã môn học</th>
                    <th>Tên môn học</th>
                    <th>Học kỳ</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Tài liệu</th>
                  </tr>
                </thead>
                <tbody>
                  {mySyllabi.map((syllabus) => (
                    <tr key={syllabus.id}>
                      <td>{syllabus.id}</td>
                      <td>{syllabus.name}</td>
                      <td>{syllabus.semester}</td>
                      <td>
                        <span className={`status-badge ${syllabus.status === 'Hoạt động' ? 'active' : 'pending'}`}>
                          {syllabus.status}
                        </span>
                      </td>
                      <td>{syllabus.lastUpdated}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleViewDetails(syllabus.id)}>
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Giáo trình chờ phê duyệt</h2>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã môn học</th>
                    <th>Tên môn học</th>
                    <th>Giảng viên</th>
                    <th>Ngày gửi</th>
                    <th>Phiên bản</th>
                    <th>Tài liệu</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSyllabi.map((syllabus) => (
                    <tr key={syllabus.id}>
                      <td>{syllabus.id}</td>
                      <td>{syllabus.name}</td>
                      <td>{syllabus.instructor}</td>
                      <td>{syllabus.submittedDate}</td>
                      <td>{syllabus.version}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleViewDetails(syllabus.id)}>
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-header" style={{ marginTop: '40px' }}>
              <h2>Giáo trình đã phê duyệt</h2>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã môn học</th>
                    <th>Tên môn học</th>
                    <th>Giảng viên</th>
                    <th>Ngày gửi</th>
                    <th>Ngày duyệt</th>
                    <th>Phiên bản</th>
                    <th>Tài liệu</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedSyllabi.map((syllabus) => (
                    <tr key={syllabus.id}>
                      <td>{syllabus.id}</td>
                      <td>{syllabus.name}</td>
                      <td>{syllabus.instructor}</td>
                      <td>{syllabus.submittedDate}</td>
                      <td>{syllabus.approvedDate}</td>
                      <td>{syllabus.version}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleViewDetails(syllabus.id)}>
                          👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Tra cứu giáo trình</h2>
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo môn học, mã môn học..."
                  className="search-input"
                />
                <button className="filter-btn">Tất cả khoa</button>
              </div>
            </div>

            <div className="syllabi-grid">
              {searchResults.map((syllabus) => (
                <div key={syllabus.id} className="syllabus-card">
                  <div className="card-header purple">
                    <div className="card-badge">{syllabus.semester}</div>
                    <h3>Kỹ thuật lập trình</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Viên:</strong> Công nghệ thông tin và truyền đạt</p>
                    <p><strong>Mã MH:</strong> {syllabus.id}</p>
                    <p><strong>Học kỳ:</strong> {syllabus.semester}</p>
                    <p><strong>Tín chỉ:</strong> 3 Tín chỉ</p>
                  </div>
                  <div className="card-footer">
                    <div className="card-description">
                      Môn học này giới thiệu các kỹ năng cơ bản và lý thuyết cần thiết để viết code tối ưu và hiệu quả
                    </div>
                    <button className="view-btn" onClick={() => handleViewDetails(syllabus.id)}>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
