import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle, XCircle, Settings, Search, Bell, User, 
  Eye, Clock, AlertTriangle, Award, TrendingUp, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AAPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import * as api from '../../services/api';

interface SyllabusForApproval {
  syllabusId: number;
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  lecturer: string;
  hodApprovedDate: string;
  program: string;
  credits: number;
  ploMappingStatus: 'complete' | 'incomplete' | 'missing';
  rubricsValid: boolean;
  prerequisitesValid: boolean;
}

const AASyllabusApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabuses, setSyllabuses] = useState<SyllabusForApproval[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingSyllabuses, unreadCount] = await Promise.all([
        api.getSyllabusesByStatus('PENDING_APPROVAL'),
        api.getUnreadNotificationsCount()
      ]);

      const normalized = pendingSyllabuses.map((s: any, idx: number) => ({
        syllabusId: s.syllabusId,
        id: s.course?.courseCode || `SYL-${idx}`,
        courseCode: s.course?.courseCode || 'N/A',
        courseName: s.course?.courseName || 'Chưa có tên',
        department: s.course?.department?.deptName || 'Chưa rõ',
        lecturer: s.lecturer?.fullName || 'Chưa rõ',
        hodApprovedDate: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('vi-VN') : 'N/A',
        program: s.program?.programName || 'Chưa rõ',
        credits: s.course?.credits || 0,
        ploMappingStatus: 'complete' as const,
        rubricsValid: true,
        prerequisitesValid: true,
      }));

      setSyllabuses(normalized);
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Error loading approval data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getPLOStatusBadge = (status: string) => {
    const styles = {
      complete: { bg: '#e8f5e9', color: '#2e7d32', text: 'Đầy đủ' },
      incomplete: { bg: '#fff3e0', color: '#e65100', text: 'Chưa đủ' },
      missing: { bg: '#ffebee', color: '#c62828', text: 'Thiếu' },
    };
    const s = styles[status as keyof typeof styles] || styles.missing;
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🎓</div>
          <h2>SMD System</h2>
          <p>{user?.name || 'Academic Affairs'}</p>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/aa/dashboard'); }}>
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-approval'); }}>
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Level 2
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/aa/program-management'); }}>
            <span className="icon"><Settings size={20} /></span>
            Quản lý Chương trình
          </a>
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-analysis'); }}>
            <span className="icon"><Search size={20} /></span>
            Tìm kiếm & Phân tích
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">Đăng xuất</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1>Phê duyệt Giáo trình - Level 2</h1>
            <p>Xác minh PLO mapping, Rubrics và tiêu chuẩn học thuật</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer' }}>
                <Bell size={24} />
                {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
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
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              color: '#999'
            }}>
              <div>Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#999', fontSize: '13px' }}>Chờ phê duyệt</p>
                  <h3 style={{ margin: 0, color: '#ff9800', fontSize: '28px' }}>{syllabuses.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#999', fontSize: '13px' }}>PLO mapping đầy đủ</p>
                  <h3 style={{ margin: 0, color: '#4caf50', fontSize: '28px' }}>
                    {syllabuses.filter(s => s.ploMappingStatus === 'complete').length}
                  </h3>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#999', fontSize: '13px' }}>Rubrics hợp lệ</p>
                  <h3 style={{ margin: 0, color: '#2196f3', fontSize: '28px' }}>
                    {syllabuses.filter(s => s.rubricsValid).length}
                  </h3>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã môn</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên môn</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Chương trình</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>PLO Mapping</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Rubrics</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Prerequisites</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syllabuses.map((syllabus, index) => (
                      <tr key={syllabus.syllabusId} style={{
                        borderBottom: '1px solid #e0e0e0',
                        background: index % 2 === 0 ? '#fafafa' : 'white'
                      }}>
                        <td style={{ padding: '16px', color: '#007bff', fontWeight: 600 }}>
                          {syllabus.courseCode}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 500, color: '#333' }}>{syllabus.courseName}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                              {syllabus.department} • {syllabus.lecturer}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
                          {syllabus.program}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {getPLOStatusBadge(syllabus.ploMappingStatus)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {syllabus.rubricsValid ? (
                            <CheckCircle size={20} color="#4caf50" />
                          ) : (
                            <XCircle size={20} color="#f44336" />
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {syllabus.prerequisitesValid ? (
                            <CheckCircle size={20} color="#4caf50" />
                          ) : (
                            <AlertTriangle size={20} color="#ff9800" />
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => navigate(`/aa/syllabus-approval/${syllabus.syllabusId}`)}
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
                              Xem & Phê duyệt
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {syllabuses.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#999',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  marginTop: '24px'
                }}>
                  <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <h3>Không có giáo trình chờ phê duyệt</h3>
                  <p>Tất cả giáo trình đã được xử lý</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AASyllabusApprovalPage;