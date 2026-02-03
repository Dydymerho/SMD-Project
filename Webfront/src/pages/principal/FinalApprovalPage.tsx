import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Eye, Home, BarChart3, Bell, User, 
  FileText, Award, Calendar, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PrincipalPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import { getPrincipalPendingSyllabuses, getUnreadNotificationsCount, Syllabus } from '../../services/api';

const FinalApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [syllabusData, notifCount] = await Promise.all([
          getPrincipalPendingSyllabuses(),
          getUnreadNotificationsCount().catch(() => 0)
        ]);
        setSyllabuses(syllabusData);
        setNotificationCount(notifCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSyllabuses = syllabuses.filter(s => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.course.courseName.toLowerCase().includes(term) ||
        s.course.courseCode.toLowerCase().includes(term) ||
        s.course.department?.deptName.toLowerCase().includes(term) ||
        s.lecturer.fullName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🎓</div>
          <h2>SMD System</h2>
          <p>Principal</p>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/principal/dashboard'); }}>
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/principal/final-approval'); }}>
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Cuối cùng
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/principal/system-oversight'); }}>
            <span className="icon"><BarChart3 size={20} /></span>
            Tìm kiếm & Phân tích
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">Đăng xuất</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1>Phê duyệt Cuối cùng - Strategic Level</h1>
            <p>Xét duyệt chương trình đào tạo, đề xuất chiến lược và thay đổi quan trọng</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer' }}>
                <Bell size={24} />
                <span className="badge">{notificationCount}</span>
              </div>
              {isNotificationOpen && <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
            </div>
            {user && (
              <div className="user-info">
                <User size={20} />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <div className="content-section" style={{ padding: '40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <div className="spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f0f0f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
          {/* Search Bar */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tiêu đề, bộ môn hoặc người nộp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '10px 16px',
                background: filter === 'all' ? '#007bff' : '#f5f5f5',
                color: filter === 'all' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
            >
              Tất cả ({syllabuses.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '10px 16px',
                background: filter === 'pending' ? '#007bff' : '#f5f5f5',
                color: filter === 'pending' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
            >
              Chờ Phê duyệt Cuối ({syllabuses.length})
            </button>
          </div>

          {/* Syllabuses Table */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã môn</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên môn học</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Khoa</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Giảng viên</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Năm học</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Trạng thái</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSyllabuses.map(syllabus => (
                  <tr key={syllabus.syllabusId} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: '#2196f315',
                        color: '#2196f3',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        {syllabus.course.courseCode}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                        {syllabus.course.courseName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {syllabus.course.credits} tín chỉ
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>
                      {syllabus.course.department?.deptName || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>
                      {syllabus.lecturer.fullName}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                      {syllabus.academicYear || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        color: '#ff9800', 
                        fontWeight: 500,
                        background: '#ff980015',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        Chờ Principal
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => navigate(`/principal/final-approval/${syllabus.syllabusId}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} />
                        Xem & Phê duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSyllabuses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '24px' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3>Không tìm thấy giáo trình nào</h3>
              <p>Hiện tại không có giáo trình nào chờ phê duyệt cuối từ Principal</p>
            </div>
          )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinalApprovalPage;
