import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Eye, Home, BarChart3, Bell, User, 
  FileText, Award, Calendar, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PrincipalPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Proposal {
  id: string;
  type: 'program' | 'plo_change' | 'strategic';
  title: string;
  department: string;
  submittedBy: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

const FinalApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const notificationCount = 8;

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      type: 'program',
      title: 'Chương trình Đào tạo CNTT 2024-2025',
      department: 'Khoa CNTT',
      submittedBy: 'Academic Affairs',
      submissionDate: '2024-01-25',
      status: 'pending',
      priority: 'high',
      description: 'Chương trình đào tạo cử nhân CNTT với 156 tín chỉ, bao gồm 24 PLOs',
    },
    {
      id: '2',
      type: 'plo_change',
      title: 'Đề xuất cập nhật PLO - Toán Ứng dụng',
      department: 'Khoa Toán',
      submittedBy: 'Academic Affairs',
      submissionDate: '2024-01-24',
      status: 'pending',
      priority: 'high',
      description: 'Thêm PLO mới về Data Science và Machine Learning',
    },
    {
      id: '3',
      type: 'strategic',
      title: 'Kế hoạch Chuyển đổi Số năm 2025',
      department: 'Phòng Đào tạo',
      submittedBy: 'Academic Affairs',
      submissionDate: '2024-01-23',
      status: 'pending',
      priority: 'medium',
      description: 'Chiến lược số hóa quy trình quản lý giáo trình và đánh giá',
    },
    {
      id: '4',
      type: 'program',
      title: 'Chương trình Đào tạo Vật Lý 2024-2025',
      department: 'Khoa Vật Lý',
      submittedBy: 'Academic Affairs',
      submissionDate: '2024-01-20',
      status: 'approved',
      priority: 'medium',
      description: 'Chương trình cử nhân Vật Lý ứng dụng',
    },
  ]);

  const filteredProposals = proposals.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(term) ||
        p.department.toLowerCase().includes(term) ||
        p.submittedBy.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'program': return 'Chương trình';
      case 'plo_change': return 'Thay đổi PLO';
      case 'strategic': return 'Chiến lược';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'program': return '#2196f3';
      case 'plo_change': return '#ff9800';
      case 'strategic': return '#9c27b0';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
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
                {status === 'all' && `Tất cả (${proposals.length})`}
                {status === 'pending' && `Chờ Phê duyệt (${proposals.filter(p => p.status === 'pending').length})`}
                {status === 'approved' && `Đã Phê duyệt (${proposals.filter(p => p.status === 'approved').length})`}
                {status === 'rejected' && `Từ chối (${proposals.filter(p => p.status === 'rejected').length})`}
              </button>
            ))}
          </div>

          {/* Proposals Table */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Loại</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tiêu đề</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Bộ môn</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Người nộp</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Ngày nộp</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Ưu tiên</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Trạng thái</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map(proposal => (
                  <tr key={proposal.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: `${getTypeColor(proposal.type)}15`,
                        color: getTypeColor(proposal.type),
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        {getTypeLabel(proposal.type)}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>{proposal.title}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{proposal.description}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>{proposal.department}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{proposal.submittedBy}</td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#666' }}>{proposal.submissionDate}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        background: `${getPriorityColor(proposal.priority)}15`,
                        color: getPriorityColor(proposal.priority),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {proposal.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {proposal.status === 'pending' && (
                        <span style={{ color: '#ff9800', fontWeight: 500 }}>Chờ xử lý</span>
                      )}
                      {proposal.status === 'approved' && (
                        <span style={{ color: '#4caf50', fontWeight: 500 }}>✓ Đã duyệt</span>
                      )}
                      {proposal.status === 'rejected' && (
                        <span style={{ color: '#f44336', fontWeight: 500 }}>✗ Từ chối</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {proposal.status === 'pending' && (
                        <button
                          onClick={() => navigate(`/principal/final-approval/${proposal.id}`)}
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
                      )}
                      {proposal.status !== 'pending' && (
                        <button
                          onClick={() => navigate(`/principal/final-approval/${proposal.id}`)}
                          style={{
                            padding: '6px 12px',
                            background: '#f5f5f5',
                            color: '#666',
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
                          Xem
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProposals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '24px' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3>Không tìm thấy đề xuất nào</h3>
              <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc lọc của bạn</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinalApprovalPage;
