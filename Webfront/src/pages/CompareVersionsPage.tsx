import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, FolderOpen, MessageSquare, Search, GitCompare, Bell, User,
  Plus, ArrowLeft, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import NotificationMenu from '../components/NotificationMenu';
import './dashboard/DashboardPage.css';

interface VersionComparison {
  field: string;
  oldValue: string;
  newValue: string;
  status: 'added' | 'modified' | 'removed' | 'unchanged';
}

const CompareVersionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOldVersion, setSelectedOldVersion] = useState('v1.0');
  const [selectedNewVersion, setSelectedNewVersion] = useState('v2.1');

  // Available versions
  const versions = ['v2.1', 'v2.0', 'v1.5', 'v1.0', 'v0.5'];

  // Mock comparison data
  const [comparisons, setComparisons] = useState<VersionComparison[]>([
    { field: 'Tên môn học', oldValue: 'Nhập môn CNTT', newValue: 'Nhập môn Công nghệ thông tin', status: 'modified' },
    { field: 'Số tín chỉ', oldValue: '3', newValue: '3', status: 'unchanged' },
    { field: 'CLO1', oldValue: 'Hiểu các khái niệm cơ bản', newValue: 'Hiểu và áp dụng các khái niệm cơ bản về CNTT', status: 'modified' },
    { field: 'CLO4', oldValue: '', newValue: 'Phân tích và đánh giá hệ thống thông tin', status: 'added' },
    { field: 'Assessment - Lab', oldValue: '20%', newValue: '25%', status: 'modified' },
    { field: 'Assessment - Final', oldValue: '40%', newValue: '35%', status: 'modified' },
  ]);

  useEffect(() => {
    if (id) {
      loadVersionComparison();
    }
  }, [id, selectedOldVersion, selectedNewVersion]);

  const loadVersionComparison = async () => {
    try {
      // TODO: Call API to get version comparison
      // const response = await api.get(`/api/v1/syllabuses/${id}/compare?old=${selectedOldVersion}&new=${selectedNewVersion}`);
      setLoading(false);
    } catch (error) {
      console.error('Error loading comparison:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <CheckCircle size={18} color="#10b981" />;
      case 'removed':
        return <XCircle size={18} color="#ef4444" />;
      case 'modified':
        return <AlertCircle size={18} color="#f59e0b" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      added: { text: 'Thêm mới', className: 'status-badge active' },
      removed: { text: 'Đã xóa', className: 'status-badge inactive' },
      modified: { text: 'Đã sửa', className: 'status-badge pending' },
      unchanged: { text: 'Không đổi', className: 'status-badge' }
    };
    const badge = badges[status as keyof typeof badges] || badges.unchanged;
    return <span className={badge.className}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo"></div>
            <h2>SMD System</h2>
            <p>Giảng viên</p>
          </div>
        </aside>
        <main className="main-content">
          <div className="content-section">
            <p>Đang tải dữ liệu so sánh...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"></div>
          <h2>SMD System</h2>
          <p>Giảng viên</p>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><FolderOpen size={20} /></span>
            Giáo trình của tôi
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }}
          >
            <span className="icon"><Plus size={20} /></span>
            Tạo giáo trình mới
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Cộng tác Review
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tra cứu & Theo dõi
          </a>
          <a 
            href="#" 
            className="nav-item active" 
          >
            <span className="icon"><GitCompare size={20} /></span>
            Quản lý nâng cao
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1>So sánh phiên bản</h1>
            <p>Xem sự khác biệt giữa các phiên bản giáo trình</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <Bell size={24} />
                <span className="badge">5</span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            <div className="user-menu">
              <span className="user-icon"><User size={24} /></span>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Giảng viên'}</div>
                <div className="user-role">Lecturer</div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-section" style={{ margin: '20px 40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-back" style={{ 
              background: 'white', 
              border: '1px solid #ddd', 
              padding: '10px 20px', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeft size={20} />
              Quay lại Dashboard
            </button>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Chọn phiên bản so sánh</h2>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Phiên bản cũ
                </label>
                <select 
                  value={selectedOldVersion} 
                  onChange={(e) => setSelectedOldVersion(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  {versions.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ paddingTop: '30px' }}>
                <GitCompare size={24} color="#666" />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Phiên bản mới
                </label>
                <select 
                  value={selectedNewVersion} 
                  onChange={(e) => setSelectedNewVersion(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  {versions.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Kết quả so sánh</h2>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Trường thông tin</th>
                    <th style={{ width: '30%' }}>{selectedOldVersion}</th>
                    <th style={{ width: '30%' }}>{selectedNewVersion}</th>
                    <th style={{ width: '20%' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comp, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: comp.status === 'unchanged' ? 'transparent' : 
                                      comp.status === 'added' ? '#f0fdf4' :
                                      comp.status === 'removed' ? '#fef2f2' : '#fffbeb'
                    }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(comp.status)}
                          <strong>{comp.field}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          color: comp.status === 'removed' ? '#ef4444' : '#666',
                          textDecoration: comp.status === 'removed' ? 'line-through' : 'none'
                        }}>
                          {comp.oldValue || <em style={{ color: '#999' }}>Chưa có</em>}
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          color: comp.status === 'added' ? '#10b981' : '#666',
                          fontWeight: comp.status === 'added' ? '600' : 'normal'
                        }}>
                          {comp.newValue || <em style={{ color: '#999' }}>Đã xóa</em>}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(comp.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#3b82f6" />
                Tóm tắt thay đổi
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    {comparisons.filter(c => c.status === 'added').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Thêm mới</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {comparisons.filter(c => c.status === 'modified').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Chỉnh sửa</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                    {comparisons.filter(c => c.status === 'removed').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Xóa bỏ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompareVersionsPage;
