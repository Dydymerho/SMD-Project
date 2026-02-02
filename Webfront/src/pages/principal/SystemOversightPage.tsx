import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle, BarChart3, Bell, User, TrendingUp, 
  Users, FileText, Award, Target, Activity, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PrincipalPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import { getPrograms, getAllSyllabuses, getUnreadNotificationsCount, Syllabus } from '../../services/api';

const SystemOversightPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // System KPIs
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    activeSyllabuses: 0,
    pendingApprovals: {
      level1: 0,
      level2: 0,
      final: 0,
    },
    completionRate: 0,
    avgApprovalTime: 0,
    systemUptime: 99.8,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [programs, syllabuses, notifCount] = await Promise.all([
          getPrograms(),
          getAllSyllabuses(),
          getUnreadNotificationsCount().catch(() => 0)
        ]);
        setNotificationCount(notifCount);

        const syllabusArray = Array.isArray(syllabuses) ? syllabuses : [];
        
        // Count syllabuses by status
        const activeSyllabuses = syllabusArray.filter((s: Syllabus) => 
          s.currentStatus === 'APPROVED' || s.currentStatus === 'PUBLISHED'
        ).length;
        
        const pendingReview = syllabusArray.filter((s: Syllabus) => 
          s.currentStatus === 'PENDING_REVIEW'
        ).length;
        
        const pendingApproval = syllabusArray.filter((s: Syllabus) => 
          s.currentStatus === 'PENDING_APPROVAL'
        ).length;
        
        const finalApproval = syllabusArray.filter((s: Syllabus) => 
          s.currentStatus === 'APPROVED'
        ).length;

        const totalSyllabuses = syllabusArray.length;
        const completionRate = totalSyllabuses > 0 
          ? ((activeSyllabuses / totalSyllabuses) * 100).toFixed(1)
          : 0;

        setKpis({
          totalUsers: 245, // Mock data
          activeSyllabuses,
          pendingApprovals: {
            level1: pendingReview,
            level2: pendingApproval,
            final: finalApproval,
          },
          completionRate: parseFloat(completionRate.toString()),
          avgApprovalTime: 3.5, // Mock data
          systemUptime: 99.8, // Mock data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Department Performance
  const departments = [
    { name: 'Khoa CNTT', syllabuses: 45, approved: 42, pending: 3, completion: 93.3 },
    { name: 'Khoa Toán', syllabuses: 32, approved: 30, pending: 2, completion: 93.8 },
    { name: 'Khoa Vật Lý', syllabuses: 28, approved: 27, pending: 1, completion: 96.4 },
    { name: 'Khoa Hóa', syllabuses: 25, approved: 23, pending: 2, completion: 92.0 },
    { name: 'Khoa Sinh', syllabuses: 26, approved: 24, pending: 2, completion: 92.3 },
  ];

  // Monthly Trends
  const monthlyData = [
    { month: 'T8', submitted: 28, approved: 25, rejected: 2 },
    { month: 'T9', submitted: 35, approved: 32, rejected: 1 },
    { month: 'T10', submitted: 42, approved: 38, rejected: 3 },
    { month: 'T11', submitted: 38, approved: 36, rejected: 1 },
    { month: 'T12', submitted: 45, approved: 41, rejected: 2 },
    { month: 'T1', submitted: 32, approved: 28, rejected: 1 },
  ];

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
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/principal/final-approval'); }}>
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Cuối cùng
          </a>
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/principal/system-oversight'); }}>
            <span className="icon"><BarChart3 size={20} /></span>
            Tổng quan Hệ thống
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
            <h1>Tổng quan Hệ thống</h1>
            <p>Giám sát KPI, báo cáo và trạng thái hoạt động toàn hệ thống</p>
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
          {/* Period Selector */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Calendar size={20} color="#666" />
            <span style={{ color: '#666', fontWeight: 500 }}>Kỳ báo cáo:</span>
            {(['week', 'month', 'quarter', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: '8px 16px',
                  background: selectedPeriod === period ? '#2196f3' : '#f5f5f5',
                  color: selectedPeriod === period ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {period === 'week' && 'Tuần'}
                {period === 'month' && 'Tháng'}
                {period === 'quarter' && 'Quý'}
                {period === 'year' && 'Năm'}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Tổng Người dùng</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: '#333' }}>{kpis.totalUsers}</h2>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} color="#2196f3" />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4caf50', fontWeight: 500 }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                +12% so với tháng trước
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Giáo trình Hoạt động</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: '#333' }}>{kpis.activeSyllabuses}</h2>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="#9c27b0" />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4caf50', fontWeight: 500 }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                +8% so với tháng trước
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Tỷ lệ Hoàn thành</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: '#333' }}>{kpis.completionRate}%</h2>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={24} color="#4caf50" />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4caf50', fontWeight: 500 }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                +2.3% so với tháng trước
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Thời gian Phê duyệt TB</p>
                  <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 700, color: '#333' }}>{kpis.avgApprovalTime} ngày</h2>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={24} color="#ff9800" />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4caf50', fontWeight: 500 }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Cải thiện 15%
              </div>
            </div>
          </div>

          {/* Approval Pipeline */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Pipeline Phê duyệt</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#2196f3', marginBottom: '8px' }}>{kpis.pendingApprovals.level1}</div>
                <div style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>Level 1 (HoD)</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>Chờ trưởng bộ môn</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ff9800', marginBottom: '8px' }}>{kpis.pendingApprovals.level2}</div>
                <div style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>Level 2 (AA)</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>Chờ phòng đào tạo</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: '#fff3e0', borderRadius: '10px', border: '2px solid #ff9800' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#9c27b0', marginBottom: '8px' }}>{kpis.pendingApprovals.final}</div>
                <div style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>Final (Principal)</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>Chờ hiệu trưởng</div>
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Hiệu suất Theo Bộ môn</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Bộ môn</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Tổng GT</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Đã duyệt</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Chờ duyệt</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hoàn thành</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#333' }}>{dept.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>{dept.syllabuses}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#4caf50', fontWeight: 600 }}>{dept.approved}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#ff9800', fontWeight: 600 }}>{dept.pending}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>{dept.completion}%</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${dept.completion}%`, height: '100%', background: dept.completion >= 95 ? '#4caf50' : dept.completion >= 90 ? '#ff9800' : '#f44336', borderRadius: '4px' }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Monthly Trends */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Xu hướng 6 Tháng gần đây</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '250px', padding: '20px 0' }}>
              {monthlyData.map((data, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '4px', width: '100%' }}>
                    <div
                      style={{
                        background: '#4caf50',
                        height: `${(data.approved / 50) * 100}%`,
                        borderRadius: '4px 4px 0 0',
                        minHeight: '20px',
                        position: 'relative',
                      }}
                      title={`Đã duyệt: ${data.approved}`}
                    >
                      <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 600, color: '#4caf50' }}>
                        {data.approved}
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#2196f3',
                        height: `${((data.submitted - data.approved - data.rejected) / 50) * 100}%`,
                        minHeight: '10px',
                      }}
                      title={`Đang xử lý: ${data.submitted - data.approved - data.rejected}`}
                    ></div>
                    <div
                      style={{
                        background: '#f44336',
                        height: `${(data.rejected / 50) * 100}%`,
                        borderRadius: '0 0 4px 4px',
                        minHeight: data.rejected > 0 ? '8px' : '0',
                      }}
                      title={`Từ chối: ${data.rejected}`}
                    ></div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginTop: '8px' }}>{data.month}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#4caf50', borderRadius: '2px' }}></div>
                <span>Đã duyệt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#2196f3', borderRadius: '2px' }}></div>
                <span>Đang xử lý</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#f44336', borderRadius: '2px' }}></div>
                <span>Từ chối</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemOversightPage;
