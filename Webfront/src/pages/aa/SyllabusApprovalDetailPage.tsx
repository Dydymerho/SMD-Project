import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Home, CheckCircle, XCircle, Settings, Search, Bell, User, 
  ArrowLeft, Award, AlertTriangle, TrendingUp, FileText, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AAPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface PLOMapping {
  ploCode: string;
  ploDescription: string;
  closMapped: string[];
  coveragePercentage: number;
}

interface SyllabusDetail {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  department: string;
  program: string;
  lecturer: string;
  hodApprovedDate: string;
  clos: string[];
  ploMappings: PLOMapping[];
  rubricsValid: boolean;
  rubricsIssues: string[];
  prerequisitesValid: boolean;
  prerequisitesList: string[];
}

const AASyllabusApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSyllabusDetail();
  }, [id]);

  const loadSyllabusDetail = async () => {
    try {
      setLoading(true);
      // Mock data
      setSyllabus({
        id: id || '1',
        courseCode: 'CS301',
        courseName: 'Trí tuệ nhân tạo',
        credits: 4,
        department: 'Khoa CNTT',
        program: 'Computer Science',
        lecturer: 'Nguyễn Văn A',
        hodApprovedDate: '2024-01-25',
        clos: [
          'CLO1: Hiểu các khái niệm cơ bản về AI',
          'CLO2: Vận dụng các thuật toán học máy',
          'CLO3: Phân tích và đánh giá mô hình AI',
        ],
        ploMappings: [
          { ploCode: 'PLO1', ploDescription: 'Apply knowledge of computing', closMapped: ['CLO1', 'CLO2'], coveragePercentage: 80 },
          { ploCode: 'PLO2', ploDescription: 'Analyze complex problems', closMapped: ['CLO2', 'CLO3'], coveragePercentage: 90 },
          { ploCode: 'PLO5', ploDescription: 'Function effectively in teams', closMapped: ['CLO3'], coveragePercentage: 60 },
        ],
        rubricsValid: true,
        rubricsIssues: [],
        prerequisitesValid: true,
        prerequisitesList: ['CS201 - Cấu trúc dữ liệu', 'MATH101 - Đại số tuyến tính'],
      });
    } catch (error) {
      console.error('Error loading syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approvalNote.trim()) {
      alert('Vui lòng nhập ghi chú phê duyệt');
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: API call
      console.log('Approved Level 2:', { id, approvalNote });
      alert('✅ Đã phê duyệt Level 2!\nGiáo trình sẽ được chuyển đến phòng ban cuối cùng để công bố.');
      navigate('/aa/syllabus-approval');
    } catch (error) {
      console.error('Error approving:', error);
      alert('❌ Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: API call
      console.log('Rejected Level 2:', { id, rejectionReason });
      alert('✅ Đã từ chối giáo trình.\nGiáo trình sẽ được trả về HoD/Lecturer với lý do từ chối.');
      navigate('/aa/syllabus-approval');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('❌ Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  if (!syllabus) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy giáo trình</div>;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🎓</div>
          <h2>SMD System</h2>
          <p>Academic Affairs</p>
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
            <h1>Chi tiết Phê duyệt Level 2</h1>
            <p>Xác minh PLO mapping và tiêu chuẩn học thuật</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer' }}>
                <Bell size={24} />
                <span className="badge">5</span>
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
          <button
            onClick={() => navigate('/aa/syllabus-approval')}
            style={{
              background: 'white', border: '1px solid #ddd', padding: '10px 16px', borderRadius: '8px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 500
            }}
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </button>

          {/* Course Info */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>{syllabus.courseCode} - {syllabus.courseName}</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{syllabus.program} | {syllabus.credits} tín chỉ | HoD đã duyệt: {syllabus.hodApprovedDate}</p>
          </div>

          {/* PLO Mapping Section */}
          <div className="plo-mapping-section" style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} />
              PLO Mapping Verification
            </h3>
            {syllabus.ploMappings.map((plo) => (
              <div key={plo.ploCode} style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#333' }}>{plo.ploCode}</span>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>{plo.ploDescription}</p>
                  </div>
                  <span style={{ fontSize: '14px', color: plo.coveragePercentage >= 70 ? '#4caf50' : '#ff9800', fontWeight: 600 }}>
                    {plo.coveragePercentage}%
                  </span>
                </div>
                <div>
                  {plo.closMapped.map(clo => (
                    <span key={clo} className="plo-tag">{clo}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Rubrics & Prerequisites */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Rubrics Validation</h4>
              {syllabus.rubricsValid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4caf50' }}>
                  <CheckCircle size={20} />
                  <span>Rubrics hợp lệ</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', marginBottom: '8px' }}>
                    <XCircle size={20} />
                    <span>Rubrics không hợp lệ</span>
                  </div>
                  <ul style={{ margin: '8px 0 0 20px', fontSize: '13px', color: '#666' }}>
                    {syllabus.rubricsIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Prerequisites</h4>
              {syllabus.prerequisitesValid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4caf50', marginBottom: '8px' }}>
                  <CheckCircle size={20} />
                  <span>Điều kiện tiên quyết hợp lệ</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff9800', marginBottom: '8px' }}>
                  <AlertTriangle size={20} />
                  <span>Cần kiểm tra lại</span>
                </div>
              )}
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                {syllabus.prerequisitesList.map((prereq, idx) => <li key={idx}>{prereq}</li>)}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              onClick={() => setShowApproveModal(true)}
              style={{
                flex: 1, padding: '14px', background: '#4caf50', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <CheckCircle size={18} />
              Phê duyệt Level 2
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              style={{
                flex: 1, padding: '14px', background: '#f44336', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <XCircle size={18} />
              Từ chối
            </button>
          </div>

          {/* Approve Modal */}
          {showApproveModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
            }} onClick={() => setShowApproveModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white', borderRadius: '12px', padding: '28px', width: '90%', maxWidth: '500px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Xác nhận Phê duyệt Level 2</h3>
                <textarea
                  placeholder="Ghi chú phê duyệt (bắt buộc)..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  style={{
                    width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={handleApprove} disabled={isSubmitting} style={{
                    flex: 1, padding: '12px', background: '#4caf50', color: 'white', border: 'none',
                    borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600
                  }}>
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Phê duyệt'}
                  </button>
                  <button onClick={() => setShowApproveModal(false)} style={{
                    flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: 'none',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                  }}>
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
            }} onClick={() => setShowRejectModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: 'white', borderRadius: '12px', padding: '28px', width: '90%', maxWidth: '500px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Xác nhận Từ chối</h3>
                <textarea
                  placeholder="Lý do từ chối (bắt buộc: PLO mapping, Rubrics, Prerequisites...)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%', minHeight: '120px', padding: '12px', border: '1px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={handleReject} disabled={isSubmitting} style={{
                    flex: 1, padding: '12px', background: '#f44336', color: 'white', border: 'none',
                    borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600
                  }}>
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
                  </button>
                  <button onClick={() => setShowRejectModal(false)} style={{
                    flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: 'none',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                  }}>
                    Hủy
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

export default AASyllabusApprovalDetailPage;
