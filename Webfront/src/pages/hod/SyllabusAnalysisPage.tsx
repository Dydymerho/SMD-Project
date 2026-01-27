import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Home, Users, CheckCircle, Eye, Copy, Bell, User 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import { fetchAllSyllabuses } from '../../services/syllabusService';

interface SyllabusVersion {
  version: number;
  academicYear: string;
  updatedAt: string;
  changedSections: string[];
}

interface Syllabus {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  currentVersion: number;
  lastUpdated: string;
  department: string;
  credits: number;
  versions: SyllabusVersion[];
}

const fallbackSyllabuses: Syllabus[] = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Lập trình cơ bản',
    lecturer: 'Nguyễn Văn A',
    currentVersion: 3,
    lastUpdated: '2024-01-20',
    department: 'Khoa CNTT',
    credits: 3,
    versions: [
      { version: 1, academicYear: '2022-2023', updatedAt: '2023-02-10', changedSections: ['CLOs', 'Assessment'] },
      { version: 2, academicYear: '2023-2024', updatedAt: '2023-10-02', changedSections: ['Modules'] },
      { version: 3, academicYear: '2024-2025', updatedAt: '2024-01-20', changedSections: ['CLOs', 'Projects'] },
    ],
  },
  {
    id: '2',
    courseCode: 'CS102',
    courseName: 'Cấu trúc dữ liệu',
    lecturer: 'Trần Thị B',
    currentVersion: 2,
    lastUpdated: '2024-01-18',
    department: 'Khoa CNTT',
    credits: 4,
    versions: [
      { version: 1, academicYear: '2023-2024', updatedAt: '2023-09-12', changedSections: ['Modules', 'Labs'] },
      { version: 2, academicYear: '2024-2025', updatedAt: '2024-01-18', changedSections: ['Assessment'] },
    ],
  },
  {
    id: '3',
    courseCode: 'MATH101',
    courseName: 'Đại số tuyến tính',
    lecturer: 'Lê Văn C',
    currentVersion: 1,
    lastUpdated: '2024-01-15',
    department: 'Khoa Toán',
    credits: 3,
    versions: [
      { version: 1, academicYear: '2024-2025', updatedAt: '2024-01-15', changedSections: ['CLOs'] },
    ],
  },
];

const SyllabusAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [minCredits, setMinCredits] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationCount = 3;
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(fallbackSyllabuses);

  const normalizeSyllabus = (item: any, index: number): Syllabus => {
    const course = item.course || {};
    const dept = item.department || item.program || {};
    const versions = Array.isArray(item.versions) && item.versions.length > 0
      ? item.versions.map((v: any, vIdx: number) => ({
          version: v.version || vIdx + 1,
          academicYear: v.academicYear || v.year || 'Chưa rõ',
          updatedAt: v.updatedAt || v.modifiedDate || v.createdAt || 'Chưa rõ',
          changedSections: v.changedSections || v.changes || [],
        }))
      : [{
          version: item.version || 1,
          academicYear: item.academicYear || 'Chưa rõ',
          updatedAt: item.updatedAt || item.modifiedDate || item.createdAt || 'Chưa rõ',
          changedSections: item.changedSections || [],
        }];

    return {
      id: String(item.syllabusId || item.id || index),
      courseCode: course.courseCode || item.courseCode || `Môn-${index + 1}`,
      courseName: course.courseName || item.courseName || item.title || 'Chưa có tên',
      lecturer: item.lecturer?.name || item.lecturerName || item.createdBy?.fullName || 'Chưa rõ',
      currentVersion: item.version || versions[versions.length - 1].version || 1,
      lastUpdated: item.updatedAt || item.modifiedDate || item.createdAt || versions[versions.length - 1].updatedAt,
      department: dept.name || dept.departmentName || dept.programName || 'Chưa xác định',
      credits: course.credits || item.credits || 0,
      versions,
    };
  };

  const loadSyllabuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllSyllabuses();
      const payload = Array.isArray(response.data) ? response.data : [];
      const normalized = payload.map((item, idx) => normalizeSyllabus(item, idx));
      setSyllabuses(normalized.length ? normalized : fallbackSyllabuses);
    } catch (err) {
      console.error('Failed to load syllabuses', err);
      setError('Không tải được dữ liệu, hiển thị dữ liệu mẫu.');
      setSyllabuses(fallbackSyllabuses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabuses();
  }, []);

  const departments = ['all', ...Array.from(new Set(syllabuses.map(s => s.department)))];
  const academicYears = ['all', ...Array.from(new Set(syllabuses.flatMap(s => s.versions.map(v => v.academicYear))))];

  const filteredSyllabuses = syllabuses.filter((s) => {
    const matchesSearch =
      s.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lecturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterDept === 'all' || s.department === filterDept;
    const matchesYear = filterYear === 'all' || s.versions.some((v) => v.academicYear === filterYear);
    const minOk = minCredits ? s.credits >= Number(minCredits) : true;
    const maxOk = maxCredits ? s.credits <= Number(maxCredits) : true;

    return matchesSearch && matchesFilter && matchesYear && minOk && maxOk;
  }).sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
    if (sortBy === 'version') {
      return b.currentVersion - a.currentVersion;
    }
    return a.courseCode.localeCompare(b.courseCode);
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
            className="nav-item" 
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
            className="nav-item active" 
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
            <h1>Tìm kiếm & Phân tích Giáo trình</h1>
            <p>Tìm kiếm, lọc và so sánh giáo trình trên bộ môn</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                <span className="badge">{notificationCount}</span>
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
        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #f44336',
            color: '#b71c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, color: '#333' }}>Bộ lọc tìm kiếm</div>
            <button
              onClick={loadSyllabuses}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #1976d2',
                background: loading ? '#bbdefb' : '#2196f3',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Tìm kiếm
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #ddd',
              borderRadius: '8px',
              paddingLeft: '12px',
              background: '#f9f9f9'
            }}>
              <Search size={18} color="#999" />
              <input
                type="text"
                placeholder="Mã môn, tên môn, giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '10px 12px',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Bộ môn
            </label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'Tất cả bộ môn' : dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Năm học
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'Tất cả năm học' : year}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Tín chỉ từ
              </label>
              <input
                type="number"
                value={minCredits}
                onChange={(e) => setMinCredits(e.target.value)}
                placeholder="Min"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Đến
              </label>
              <input
                type="number"
                value={maxCredits}
                onChange={(e) => setMaxCredits(e.target.value)}
                placeholder="Max"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="updated">Cập nhật gần đây</option>
              <option value="version">Phiên bản mới</option>
              <option value="code">Mã môn học</option>
            </select>
          </div>
        </div>

        {/* Realtime Alerts Snapshot */}
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0d47a1', fontWeight: 600 }}>
            <Bell size={18} />
            Thông báo tức thời (mẫu dữ liệu)
          </div>
          <ul style={{ margin: '10px 0 0 20px', color: '#0d47a1', fontSize: '13px' }}>
            <li>Giáo trình mới nộp: CS205 - Phân tích thiết kế (lecturer: Đỗ Văn G)</li>
            <li>Hết hạn thảo luận hợp tác: CS102 - Cấu trúc dữ liệu (2 giờ còn lại)</li>
            <li>Giáo trình bị từ chối bởi QLĐT: CS301 - Trí tuệ nhân tạo (cần hành động)</li>
          </ul>
        </div>

        {/* Results Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã môn</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên môn</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Giảng viên</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Phiên bản</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Bộ môn</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Cập nhật</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSyllabuses.map((syllabus, index) => (
                <tr key={syllabus.id} style={{
                  borderBottom: '1px solid #e0e0e0',
                  background: index % 2 === 0 ? '#fafafa' : 'white'
                }}>
                  <td style={{ padding: '16px', color: '#007bff', fontWeight: 600 }}>
                    {syllabus.courseCode}
                  </td>
                  <td style={{ padding: '16px', color: '#333' }}>
                    {syllabus.courseName}
                  </td>
                  <td style={{ padding: '16px', color: '#666' }}>
                    {syllabus.lecturer}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                    <span style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 500
                    }}>
                      v{syllabus.currentVersion}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
                    {syllabus.department}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                    {syllabus.lastUpdated}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        type="button"
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
                        type="button"
                        onClick={() => { setSelectedSyllabus(syllabus); setShowCompareModal(true); }}
                        style={{
                          padding: '6px 12px',
                          background: '#ff9800',
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
                        <Copy size={14} />
                        So sánh
                      </button>
                    </div>
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
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <h3>Không tìm thấy giáo trình nào</h3>
            <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc lọc của bạn</p>
          </div>
        )}

        {/* Summary Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '13px' }}>Tổng giáo trình</p>
            <h3 style={{ color: '#333', margin: 0, fontSize: '24px' }}>
              {filteredSyllabuses.length}
            </h3>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#999', margin: '0 0 8px 0', fontSize: '13px' }}>Phiên bản trung bình</p>
            <h3 style={{ color: '#333', margin: 0, fontSize: '24px' }}>
              {(filteredSyllabuses.reduce((sum, s) => sum + s.currentVersion, 0) / (filteredSyllabuses.length || 1)).toFixed(1)}
            </h3>
          </div>
        </div>

        {/* Version Comparison Modal */}
        {showCompareModal && selectedSyllabus && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100
            }}
            onClick={() => setShowCompareModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '28px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', color: '#333' }}>
                    So sánh phiên bản - {selectedSyllabus.courseCode}
                  </h2>
                  <p style={{ margin: 0, color: '#666' }}>{selectedSyllabus.courseName}</p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  style={{
                    border: 'none',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#666'
                  }}
                >
                  Đóng
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '12px' }}>Phiên bản mới nhất</p>
                  <h3 style={{ margin: 0, color: '#333' }}>v{selectedSyllabus.currentVersion}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>Cập nhật: {selectedSyllabus.lastUpdated}</p>
                </div>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', color: '#999', fontSize: '12px' }}>Số phiên bản</p>
                  <h3 style={{ margin: 0, color: '#333' }}>{selectedSyllabus.versions.length}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>Từ {selectedSyllabus.versions[0].academicYear} → {selectedSyllabus.versions[selectedSyllabus.versions.length - 1].academicYear}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Phiên bản</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Năm học</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Ngày cập nhật</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Mục thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSyllabus.versions.map((v) => (
                    <tr key={`${selectedSyllabus.id}-v${v.version}`} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>v{v.version}</td>
                      <td style={{ padding: '12px' }}>{v.academicYear}</td>
                      <td style={{ padding: '12px' }}>{v.updatedAt}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {v.changedSections.map((section) => (
                            <span
                              key={`${v.version}-${section}`}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedSyllabus.versions.length >= 2 && (
                <div style={{ background: '#fff8e1', padding: '14px', borderRadius: '10px', border: '1px solid #ffd54f' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Khác biệt giữa 2 phiên bản gần nhất</h4>
                  {(() => {
                    const lastTwo = selectedSyllabus.versions.slice(-2);
                    const newest = lastTwo[lastTwo.length - 1];
                    const prev = lastTwo[lastTwo.length - 2];
                    const added = newest.changedSections.filter(c => !prev.changedSections.includes(c));
                    const persisted = newest.changedSections.filter(c => prev.changedSections.includes(c));
                    return (
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#555', fontSize: '13px' }}>
                        <li>Năm học: {prev.academicYear} → {newest.academicYear}</li>
                        <li>Các mục cập nhật mới: {added.length ? added.join(', ') : 'Không có mục mới'}</li>
                        <li>Các mục tiếp tục thay đổi: {persisted.length ? persisted.join(', ') : 'Không lặp lại thay đổi'}</li>
                      </ul>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default SyllabusAnalysisPage;
