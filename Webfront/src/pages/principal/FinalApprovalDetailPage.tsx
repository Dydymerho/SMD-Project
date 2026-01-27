import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, Home, BarChart3, Bell, User,
  AlertTriangle, BookOpen, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './PrincipalPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import { 
  getPrincipalSyllabusDetail, 
  principalApproveSyllabus, 
  principalRejectSyllabus,
  getUnreadNotificationsCount,
  PrincipalSyllabusDetail 
} from '../../services/api';

const FinalApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [syllabus, setSyllabus] = useState<PrincipalSyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [syllabusData, notifCount] = await Promise.all([
          getPrincipalSyllabusDetail(parseInt(id)),
          getUnreadNotificationsCount().catch(() => 0)
        ]);
        setSyllabus(syllabusData);
        setNotificationCount(notifCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Không thể tải thông tin giáo trình');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!syllabus || !id) return;

    try {
      setSubmitting(true);
      await principalApproveSyllabus(parseInt(id), approvalNotes);
      alert('Phê duyệt thành công!');
      setShowApproveModal(false);
      setTimeout(() => navigate('/principal/final-approval'), 1000);
    } catch (error: any) {
      console.error('Error approving syllabus:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!syllabus || !id || !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);
      await principalRejectSyllabus(parseInt(id), rejectionReason);
      alert('Từ chối thành công!');
      setShowRejectModal(false);
      setTimeout(() => navigate('/principal/final-approval'), 1000);
    } catch (error: any) {
      console.error('Error rejecting syllabus:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối');
    } finally {
      setSubmitting(false);
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
          ) : !syllabus ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <AlertTriangle size={48} color="#f44336" style={{ margin: '0 auto 16px' }} />
              <h3>Không tìm thấy giáo trình</h3>
              <button
                onClick={() => navigate('/principal/final-approval')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Quay lại danh sách
              </button>
            </div>
          ) : (
            <>
          {/* Syllabus Header */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{
                    background: '#2196f315',
                    color: '#2196f3',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    {syllabus?.courseCode || 'N/A'}
                  </span>
                  <span style={{
                    background: '#ff980015',
                    color: '#ff9800',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    Chờ phê duyệt cuối
                  </span>
                </div>
                <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#333' }}>{syllabus?.courseName || 'Không có tên môn học'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', color: '#666', fontSize: '14px' }}>
                  <div><strong>Khoa:</strong> {syllabus?.deptName || 'N/A'}</div>
                  <div><strong>Giảng viên:</strong> {syllabus?.lecturerName || 'N/A'}</div>
                  <div><strong>Số tín chỉ:</strong> {syllabus?.credits || 'N/A'}</div>
                  <div><strong>Năm học:</strong> {syllabus?.academicYear || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Course Information */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="#2196f3" />
                  Thông tin môn học
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 20px', color: '#666', lineHeight: 1.8 }}>
                  <strong>Mã môn:</strong>
                  <span>{syllabus?.courseCode || 'N/A'}</span>
                  
                  <strong>Tên môn:</strong>
                  <span>{syllabus?.courseName || 'N/A'}</span>
                  
                  <strong>Số tín chỉ:</strong>
                  <span>{syllabus?.credits || 'N/A'} tín chỉ</span>
                  
                  <strong>Khoa/Bộ môn:</strong>
                  <span>{syllabus?.deptName || 'N/A'}</span>
                </div>
              </div>

              {/* Program Information */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} color="#9c27b0" />
                  Chương trình đào tạo
                </h3>
                <div style={{ color: '#666', lineHeight: 1.8 }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Chương trình:</strong> {syllabus?.programName || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Năm học:</strong> {syllabus?.academicYear || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Giảng viên phụ trách:</strong> {syllabus?.lecturerName || 'N/A'}
                  </div>
                  {syllabus?.versionNotes && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: '#f9f9f9', 
                      borderRadius: '8px',
                      borderLeft: '4px solid #2196f3'
                    }}>
                      <strong>Ghi chú phiên bản:</strong><br/>
                      {syllabus.versionNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Workflow Status */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} color="#4caf50" />
                  Quy trình phê duyệt
                </h3>
                <div style={{ position: 'relative', paddingLeft: '32px' }}>
                  {/* Timeline line */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '11px', 
                    top: '12px', 
                    bottom: '12px', 
                    width: '2px', 
                    background: 'linear-gradient(to bottom, #4caf50 60%, #ff9800 60%)'
                  }}></div>

                  {/* Step 1 */}
                  <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-32px', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}>
                      <CheckCircle size={14} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#4caf50', marginBottom: '4px' }}>
                        Bước 1: Phê duyệt HOD ✓
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        Đã được trưởng khoa phê duyệt
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-32px', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}>
                      <CheckCircle size={14} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#4caf50', marginBottom: '4px' }}>
                        Bước 2: Phê duyệt Academic Affairs ✓
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        Đã được phòng đào tạo phê duyệt
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-32px', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: '#ff9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                      animation: 'pulse 2s infinite'
                    }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }}></div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ff9800', marginBottom: '4px' }}>
                        Bước 3: Phê duyệt cuối Principal ⏳
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        Đang chờ quyết định phê duyệt cuối cùng
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Status Card */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>Trạng thái hiện tại</h3>
                <div style={{ 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '15px',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                }}>
                  {syllabus?.currentStatus || 'N/A'}
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: '#fff3e0', 
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#e65100',
                  textAlign: 'center'
                }}>
                  Cần phê duyệt cuối từ Principal
                </div>
              </div>

              {/* Quick Info */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>Thông tin thêm</h3>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>ID Giáo trình</div>
                    <div style={{ fontWeight: 600 }}>#{syllabus?.syllabusId || 'N/A'}</div>
                  </div>
                  {syllabus?.createdBy && (
                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Người tạo</div>
                      <div style={{ fontWeight: 600 }}>{syllabus.createdBy}</div>
                    </div>
                  )}
                  {syllabus?.lecturerEmail && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Email Giảng viên</div>
                      <div style={{ fontWeight: 600 }}>{syllabus.lecturerEmail}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Guide */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                padding: '20px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                color: 'white'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', margin: 0 }}>
                  Hành động cần thực hiện
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.6, margin: '8px 0 0 0' }}>
                  Vui lòng xem xét kỹ thông tin giáo trình và quyết định phê duyệt hoặc từ chối. 
                  Quyết định của bạn sẽ là bước cuối cùng trong quy trình phê duyệt.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingTop: '20px' }}>
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={submitting}
              style={{
                padding: '14px 32px',
                background: submitting ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: submitting ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
            >
              <CheckCircle size={20} />
              {submitting ? 'Đang xử lý...' : 'Phê duyệt'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={submitting}
              style={{
                padding: '14px 32px',
                background: submitting ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: submitting ? 'none' : '0 4px 12px rgba(244, 67, 54, 0.3)'
              }}
            >
              <XCircle size={20} />
              {submitting ? 'Đang xử lý...' : 'Từ chối'}
            </button>
          </div>
            </>
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
