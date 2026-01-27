import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, Home, BarChart3, Bell, User,
  FileText, Award, Calendar, AlertTriangle, Users, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PrincipalPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface ProposalDetail {
  id: string;
  type: 'program' | 'plo_change' | 'strategic';
  title: string;
  department: string;
  submittedBy: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  description: string;
  rationale: string;
  expectedOutcome: string;
  affectedPrograms: string[];
  budget?: number;
  timeline: string;
  approvalHistory: Array<{
    level: string;
    approver: string;
    date: string;
    status: string;
    notes?: string;
  }>;
}

const FinalApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const notificationCount = 8;

  // Mock data - replace with API call
  const [proposal, setProposal] = useState<ProposalDetail>({
    id: id || '1',
    type: 'program',
    title: 'Chương trình Đào tạo CNTT 2024-2025',
    department: 'Khoa CNTT',
    submittedBy: 'Academic Affairs',
    submissionDate: '2024-01-25',
    status: 'pending',
    priority: 'high',
    description: 'Chương trình đào tạo cử nhân Công nghệ Thông tin với tổng số 156 tín chỉ, áp dụng từ năm học 2024-2025',
    rationale: 'Cập nhật chương trình đào tạo theo chuẩn AUN-QA và yêu cầu của ngành CNTT hiện đại. Tích hợp các kiến thức mới về AI, Data Science, Cloud Computing.',
    expectedOutcome: 'Sinh viên tốt nghiệp đáp ứng được chuẩn đầu ra quốc tế, có khả năng làm việc tại các công ty công nghệ lớn',
    affectedPrograms: ['CNTT - Khóa 2024', 'CNTT - Chuyên sâu AI', 'CNTT - An toàn thông tin'],
    budget: 500000000,
    timeline: '6 tháng (02/2024 - 08/2024)',
    approvalHistory: [
      {
        level: 'Level 1 - Head of Department',
        approver: 'TS. Nguyễn Văn A',
        date: '2024-01-20',
        status: 'approved',
        notes: 'Chương trình đã được thảo luận và thông qua tại hội đồng khoa. Nội dung phù hợp với định hướng phát triển.'
      },
      {
        level: 'Level 2 - Academic Affairs',
        approver: 'PGS.TS Trần Thị B',
        date: '2024-01-24',
        status: 'approved',
        notes: 'Đã kiểm tra PLO mapping, rubrics và prerequisites. Chương trình đáp ứng đầy đủ tiêu chuẩn AUN-QA.'
      }
    ]
  });

  const handleApprove = () => {
    setProposal(prev => ({ ...prev, status: 'approved' }));
    setShowApproveModal(false);
    // TODO: Call API to approve
    setTimeout(() => navigate('/principal/final-approval'), 1500);
  };

  const handleReject = () => {
    setProposal(prev => ({ ...prev, status: 'rejected' }));
    setShowRejectModal(false);
    // TODO: Call API to reject
    setTimeout(() => navigate('/principal/final-approval'), 1500);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'program': return 'Chương trình Đào tạo';
      case 'plo_change': return 'Thay đổi PLO';
      case 'strategic': return 'Đề xuất Chiến lược';
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
            <button
              onClick={() => navigate('/principal/final-approval')}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>Chi tiết Đề xuất</h1>
              <p>Xem xét và phê duyệt đề xuất cấp chiến lược</p>
            </div>
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
          {/* Status Banner */}
          {proposal.status === 'approved' && (
            <div style={{
              background: '#e8f5e9',
              border: '1px solid #4caf50',
              color: '#2e7d32',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle size={24} />
              <div>
                <strong>Đề xuất đã được phê duyệt</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Quyết định này đã được lưu vào hệ thống</p>
              </div>
            </div>
          )}

          {proposal.status === 'rejected' && (
            <div style={{
              background: '#ffebee',
              border: '1px solid #f44336',
              color: '#c62828',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <XCircle size={24} />
              <div>
                <strong>Đề xuất đã bị từ chối</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Quyết định này đã được thông báo đến các bên liên quan</p>
              </div>
            </div>
          )}

          {/* Proposal Header */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{
                    background: `${getTypeColor(proposal.type)}15`,
                    color: getTypeColor(proposal.type),
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    {getTypeLabel(proposal.type)}
                  </span>
                  <span style={{
                    background: `${getPriorityColor(proposal.priority)}15`,
                    color: getPriorityColor(proposal.priority),
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {proposal.priority} Priority
                  </span>
                </div>
                <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#333' }}>{proposal.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', color: '#666', fontSize: '14px' }}>
                  <div><strong>Bộ môn:</strong> {proposal.department}</div>
                  <div><strong>Người nộp:</strong> {proposal.submittedBy}</div>
                  <div><strong>Ngày nộp:</strong> {proposal.submissionDate}</div>
                  <div><strong>Timeline:</strong> {proposal.timeline}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Description */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#2196f3" />
                  Mô tả Chi tiết
                </h3>
                <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{proposal.description}</p>
              </div>

              {/* Rationale */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={20} color="#ff9800" />
                  Lý do & Căn cứ
                </h3>
                <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{proposal.rationale}</p>
              </div>

              {/* Expected Outcome */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="#4caf50" />
                  Kết quả Kỳ vọng
                </h3>
                <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{proposal.expectedOutcome}</p>
              </div>
            </div>

            {/* Sidebar Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Affected Programs */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>Chương trình Ảnh hưởng</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {proposal.affectedPrograms.map((prog, idx) => (
                    <div key={idx} style={{
                      padding: '10px 12px',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      {prog}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              {proposal.budget && (
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>Ngân sách Dự kiến</h3>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#2196f3' }}>
                    {proposal.budget.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} />
                  Thời gian Thực hiện
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{proposal.timeline}</p>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>Lịch sử Phê duyệt</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {proposal.approvalHistory.map((history, idx) => (
                <div key={idx} style={{
                  padding: '20px',
                  background: '#f9f9f9',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${history.status === 'approved' ? '#4caf50' : '#f44336'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>{history.level}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Người duyệt: {history.approver}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: history.status === 'approved' ? '#e8f5e9' : '#ffebee',
                        color: history.status === 'approved' ? '#2e7d32' : '#c62828'
                      }}>
                        {history.status === 'approved' ? '✓ Đã duyệt' : '✗ Từ chối'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>{history.date}</div>
                    </div>
                  </div>
                  {history.notes && (
                    <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                      "{history.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {proposal.status === 'pending' && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingTop: '20px' }}>
              <button
                onClick={() => setShowApproveModal(true)}
                style={{
                  padding: '14px 32px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
              >
                <CheckCircle size={20} />
                Phê duyệt
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                style={{
                  padding: '14px 32px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }}
              >
                <XCircle size={20} />
                Từ chối
              </button>
            </div>
          )}

          {/* Approve Modal */}
          {showApproveModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={() => setShowApproveModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#333' }}>Xác nhận Phê duyệt</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                  Bạn có chắc chắn muốn phê duyệt đề xuất này? Quyết định này sẽ được lưu vào hệ thống và thông báo đến các bên liên quan.
                </p>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Nhập ghi chú về quyết định phê duyệt..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    style={{
                      padding: '10px 20px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApprove}
                    style={{
                      padding: '10px 20px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Xác nhận Phê duyệt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }} onClick={() => setShowRejectModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#333' }}>Từ chối Đề xuất</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                  Vui lòng cho biết lý do từ chối để các bên liên quan có thể cải thiện và nộp lại.
                </p>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Lý do từ chối <span style={{ color: '#f44336' }}>*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối đề xuất..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    style={{
                      padding: '10px 20px',
                      background: '#f5f5f5',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    style={{
                      padding: '10px 20px',
                      background: rejectionReason.trim() ? '#f44336' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 600
                    }}
                  >
                    Xác nhận Từ chối
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinalApprovalDetailPage;
