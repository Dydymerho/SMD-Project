import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, Eye, MessageSquare, 
  Home, Users, Search, Bell, User, Loader, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPendingSyllabusesForHoD, approveSyllabus, rejectSyllabus } from '../../services/workflowService';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface SyllabusSubmission {
  id: string;
  syllabusId?: number;
  courseCode: string;
  courseName: string;
  lecturer: string;
  submissionDate: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStatus?: string;
  version: number;
  hasChanges: boolean;
  lecturerName?: string;
  departmentName?: string;
}

const HoDSyllabusReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabuses, setSyllabuses] = useState<SyllabusSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSyllabuses();
  }, []);

  const loadSyllabuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPendingSyllabusesForHoD();
      const data = Array.isArray(result.data) ? result.data : [];
      setSyllabuses(data.map((item: any) => {
        const normalizedStatus = (item.currentStatus || '').toLowerCase();
        const uiStatus: 'pending' | 'approved' | 'rejected' =
          normalizedStatus.includes('pending') ? 'pending'
          : normalizedStatus.includes('approve') ? 'approved'
          : normalizedStatus.includes('reject') ? 'rejected'
          : 'pending';

        return {
          id: (item.syllabusId || item.id || '').toString(),
          syllabusId: item.syllabusId || item.id,
          courseCode: item.courseCode || item.course?.courseCode || 'N/A',
          courseName: item.courseName || item.course?.courseName || 'Giáo trình không tên',
          lecturer: item.lecturerName || item.lecturer?.fullName || item.createdBy?.fullName || 'Chưa rõ',
          submissionDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          createdAt: item.createdAt,
          status: uiStatus,
          currentStatus: item.currentStatus,
          version: item.version || 1,
          hasChanges: item.version && item.version > 1,
          lecturerName: item.lecturerName,
          departmentName: item.departmentName || item.department?.deptName,
        };
      }));
    } catch (err) {
      console.error('Error loading syllabuses:', err);
      setError('Không thể tải danh sách giáo trình');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const syllabusId = parseInt(id);
      await approveSyllabus(syllabusId, 'Phê duyệt từ cấp trưởng bộ môn');
      // Update local state
      setSyllabuses(prev =>
        prev.map(s => s.id === id ? { ...s, status: 'approved' } : s)
      );
      alert('Đã phê duyệt giáo trình thành công!');
    } catch (err) {
      console.error('Error approving syllabus:', err);
      alert('Lỗi khi phê duyệt giáo trình');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (!reason) return;
    
    try {
      const syllabusId = parseInt(id);
      await rejectSyllabus(syllabusId, reason);
      // Update local state
      setSyllabuses(prev =>
        prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s)
      );
      alert('Đã từ chối giáo trình');
    } catch (err) {
      console.error('Error rejecting syllabus:', err);
      alert('Lỗi khi từ chối giáo trình');
    }
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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải danh sách giáo trình...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffebee', borderRadius: '12px', boxShadow: '0 2px 8px rgba(244, 67, 54, 0.1)', marginBottom: '24px' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#f44336', opacity: 0.8 }} />
            <h3 style={{ color: '#f44336', marginBottom: '8px' }}>Lỗi tải dữ liệu</h3>
            <p style={{ color: '#d32f2f', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={loadSyllabuses}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
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
        </>
        )}
        </div>
      </main>
    </div>
  );
};

export default HoDSyllabusReviewPage;
