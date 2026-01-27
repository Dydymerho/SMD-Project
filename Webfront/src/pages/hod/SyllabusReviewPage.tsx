import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, Eye, MessageSquare, 
  Home, Users, Search, Bell, User 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface SyllabusSubmission {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  version: number;
  hasChanges: boolean;
}

const HoDSyllabusReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabuses, setSyllabuses] = useState<SyllabusSubmission[]>([
    {
      id: '1',
      courseCode: 'CS101',
      courseName: 'Lập trình cơ bản',
      lecturer: 'Nguyễn Văn A',
      submissionDate: '2024-01-20',
      status: 'pending',
      version: 2,
      hasChanges: true,
    },
    {
      id: '2',
      courseCode: 'CS102',
      courseName: 'Cấu trúc dữ liệu',
      lecturer: 'Trần Thị B',
      submissionDate: '2024-01-18',
      status: 'pending',
      version: 1,
      hasChanges: false,
    },
    {
      id: '3',
      courseCode: 'CS201',
      courseName: 'Thuật toán nâng cao',
      lecturer: 'Lê Văn C',
      submissionDate: '2024-01-22',
      status: 'approved',
      version: 1,
      hasChanges: false,
    },
    {
      id: '4',
      courseCode: 'CS301',
      courseName: 'Trí tuệ nhân tạo',
      lecturer: 'Phạm Thị D',
      submissionDate: '2024-01-15',
      status: 'rejected',
      version: 1,
      hasChanges: false,
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (id: string) => {
    setSyllabuses(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'approved' } : s)
    );
  };

  const handleReject = (id: string) => {
    // TODO: Open modal for rejection reason
    setSyllabuses(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s)
    );
  };

  const filteredSyllabuses = syllabuses.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.courseCode.toLowerCase().includes(term) ||
        s.courseName.toLowerCase().includes(term) ||
        s.lecturer.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📋</div>
          <h2>SMD System</h2>
          <p>Trưởng Bộ môn</p>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item active" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-review'); }}
          >
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Giáo trình
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/collaborative-review'); }}
          >
            <span className="icon"><Users size={20} /></span>
            Quản lý Thảo luận
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-analysis'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tìm kiếm & Phân tích
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
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Phê duyệt Giáo trình - Level 1</h1>
            <p>Xác minh nội dung học tập, CLOs và tuân thủ giáo trình</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                <span className="badge">3</span>
              </div>
              {isNotificationOpen && (
                <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
              )}
            </div>
            {user && (
              <div className="user-info">
                <User size={20} />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="content-section" style={{ padding: '40px' }}>

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
            placeholder="🔍 Tìm kiếm theo mã môn, tên môn hoặc giảng viên..."
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
        <div className="filter-tabs" style={{ marginBottom: '24px' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 16px',
                background: filter === status ? '#007bff' : '#f5f5f5',
                color: filter === status ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
            >
              {status === 'all' && `Tất cả (${syllabuses.length})`}
              {status === 'pending' && `Chờ Phê duyệt (${syllabuses.filter(s => s.status === 'pending').length})`}
              {status === 'approved' && `Đã Phê duyệt (${syllabuses.filter(s => s.status === 'approved').length})`}
              {status === 'rejected' && `Từ chối (${syllabuses.filter(s => s.status === 'rejected').length})`}
            </button>
          ))}
        </div>

        {/* Syllabuses Table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã môn học</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên môn học</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Giảng viên</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Ngày nộp</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Phiên bản</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Thay đổi</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSyllabuses.map(syllabus => (
                <tr key={syllabus.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '16px', color: '#007bff', fontWeight: 600 }}>{syllabus.courseCode}</td>
                  <td style={{ padding: '16px', color: '#333' }}>{syllabus.courseName}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{syllabus.lecturer}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{syllabus.submissionDate}</td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>v{syllabus.version}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {syllabus.hasChanges ? (
                      <span style={{ background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                        Có thay đổi
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {syllabus.status === 'pending' && (
                      <span style={{ color: '#ff9800', fontWeight: 500 }}>Chờ xử lý</span>
                    )}
                    {syllabus.status === 'approved' && (
                      <span style={{ color: '#4caf50', fontWeight: 500 }}>✓ Đã duyệt</span>
                    )}
                    {syllabus.status === 'rejected' && (
                      <span style={{ color: '#f44336', fontWeight: 500 }}>✗ Từ chối</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {syllabus.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/hod/syllabus-review/${syllabus.id}`)}
                          style={{
                            padding: '6px 12px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={14} />
                          Xem
                        </button>
                        <button
                          onClick={() => handleApprove(syllabus.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => handleReject(syllabus.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          Từ chối
                        </button>
                      </div>
                    )}
                    {syllabus.status !== 'pending' && (
                      <button
                        onClick={() => navigate(`/hod/syllabus-review/${syllabus.id}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSyllabuses.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3>Không có giáo trình nào trong danh sách</h3>
            <p>Tất cả giáo trình đã được xử lý hoặc không có nội dung để hiển thị</p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default HoDSyllabusReviewPage;
