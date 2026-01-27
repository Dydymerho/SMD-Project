import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, Eye, AlertTriangle, 
  Home, Users, Search, Bell, User, FileText, Clock, 
  Edit, MessageSquare, TrendingUp, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface SyllabusDetail {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  lecturer: {
    name: string;
    email: string;
  };
  version: number;
  submissionDate: string;
  academicYear: string;
  description: string;
  clos: string[];
  modules: Array<{
    moduleNo: number;
    moduleName: string;
    topics: string[];
    hours: number;
  }>;
  assessments: Array<{
    type: string;
    percentage: number;
    description: string;
  }>;
  changes?: Array<{
    section: string;
    type: 'added' | 'modified' | 'deleted';
    description: string;
    confidence: number;
  }>;
}

const SyllabusReviewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionType, setRejectionType] = useState('content_error');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSyllabusDetail();
  }, [id]);

  const loadSyllabusDetail = async () => {
    try {
      setLoading(true);
      // TODO: Call API to fetch syllabus detail
      // const data = await getSyllabusDetail(id);
      // Mock data
      setSyllabus({
        id: id || '1',
        courseCode: 'CS101',
        courseName: 'Lập trình cơ bản',
        credits: 3,
        lecturer: {
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@university.edu.vn'
        },
        version: 2,
        submissionDate: '2024-01-20',
        academicYear: '2024-2025',
        description: 'Môn học cung cấp kiến thức nền tảng về lập trình máy tính...',
        clos: [
          'CLO1: Hiểu được các khái niệm cơ bản về lập trình',
          'CLO2: Vận dụng được các cấu trúc điều khiển',
          'CLO3: Thiết kế và implement được các thuật toán đơn giản'
        ],
        modules: [
          {
            moduleNo: 1,
            moduleName: 'Giới thiệu về lập trình',
            topics: ['Khái niệm lập trình', 'Ngôn ngữ lập trình', 'Môi trường phát triển'],
            hours: 6
          },
          {
            moduleNo: 2,
            moduleName: 'Cấu trúc dữ liệu cơ bản',
            topics: ['Biến và kiểu dữ liệu', 'Toán tử', 'Biểu thức'],
            hours: 8
          }
        ],
        assessments: [
          { type: 'Kiểm tra giữa kỳ', percentage: 30, description: 'Bài thi trắc nghiệm và tự luận' },
          { type: 'Bài tập thực hành', percentage: 20, description: 'Các bài tập lập trình hàng tuần' },
          { type: 'Thi cuối kỳ', percentage: 50, description: 'Bài thi tổng hợp kiến thức' }
        ],
        changes: [
          {
            section: 'CLOs',
            type: 'modified',
            description: 'Cập nhật CLO2 để phù hợp với chuẩn đầu ra mới',
            confidence: 0.95
          },
          {
            section: 'Module 2',
            type: 'added',
            description: 'Thêm chủ đề "Con trỏ và tham chiếu"',
            confidence: 0.88
          }
        ]
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
      // TODO: Call API to approve syllabus
      // await approveSyllabus(id, approvalNote);
      console.log('Approved:', { id, approvalNote });
      alert('✅ Đã phê duyệt giáo trình thành công!\nGiáo trình sẽ được chuyển đến phòng Đào tạo.');
      navigate('/hod/syllabus-review');
    } catch (error) {
      console.error('Error approving syllabus:', error);
      alert('❌ Có lỗi xảy ra khi phê duyệt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối (bắt buộc)');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to reject syllabus
      // await rejectSyllabus(id, rejectionType, rejectionReason);
      console.log('Rejected:', { id, rejectionType, rejectionReason });
      alert('✅ Đã từ chối giáo trình.\nGiáo trình sẽ được trả về cho giảng viên với lý do từ chối.');
      navigate('/hod/syllabus-review');
    } catch (error) {
      console.error('Error rejecting syllabus:', error);
      alert('❌ Có lỗi xảy ra khi từ chối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!syllabus) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy giáo trình</div>;
  }

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
            <h1>Chi tiết Giáo trình - Phê duyệt</h1>
            <p>Xác minh nội dung, CLOs và tuân thủ giáo trình</p>
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/hod/syllabus-review')}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </button>

          {/* Syllabus Info Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>
                  {syllabus.courseCode} - {syllabus.courseName}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Phiên bản {syllabus.version} | Năm học {syllabus.academicYear} | {syllabus.credits} tín chỉ
                </p>
              </div>
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                <Clock size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Chờ phê duyệt
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Giảng viên</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{syllabus.lecturer.name}</p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>{syllabus.lecturer.email}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Ngày nộp</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{syllabus.submissionDate}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Phiên bản</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>v{syllabus.version}</p>
              </div>
            </div>
          </div>

          {/* AI Change Detection */}
          {syllabus.changes && syllabus.changes.length > 0 && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
              border: '2px solid #2196f3'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#2196f3" />
                AI Change Detection - Phát hiện thay đổi
              </h3>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
                So với phiên bản trước, hệ thống AI đã phát hiện {syllabus.changes.length} thay đổi
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {syllabus.changes.map((change, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        change.type === 'added' ? '#4caf50' :
                        change.type === 'modified' ? '#ff9800' :
                        '#f44336'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <span style={{
                          background: change.type === 'added' ? '#e8f5e9' :
                                     change.type === 'modified' ? '#fff3e0' : '#ffebee',
                          color: change.type === 'added' ? '#2e7d32' :
                                change.type === 'modified' ? '#e65100' : '#c62828',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                          marginRight: '8px'
                        }}>
                          {change.type === 'added' ? 'THÊM MỚI' :
                           change.type === 'modified' ? 'SỬA ĐỔI' : 'XÓA'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#333' }}>{change.section}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#666',
                        fontSize: '12px'
                      }}>
                        <TrendingUp size={14} />
                        Độ tin cậy: {(change.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Mô tả môn học</h3>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{syllabus.description}</p>
          </div>

          {/* CLOs */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
              Chuẩn đầu ra (CLOs)
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {syllabus.clos.map((clo, index) => (
                <li key={index} style={{ margin: '8px 0', color: '#666', lineHeight: 1.6 }}>{clo}</li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Nội dung học phần</h3>
            {syllabus.modules.map((module) => (
              <div
                key={module.moduleNo}
                style={{
                  padding: '16px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  Module {module.moduleNo}: {module.moduleName} ({module.hours} giờ)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {module.topics.map((topic, idx) => (
                    <li key={idx} style={{ margin: '4px 0', color: '#666' }}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Assessments */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Đánh giá</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Loại đánh giá</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Tỷ lệ</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.assessments.map((assessment, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#333' }}>{assessment.type}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#2196f3' }}>
                      {assessment.percentage}%
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{assessment.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => setShowRejectModal(true)}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#f44336',
                border: '2px solid #f44336',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <XCircle size={18} />
              Từ chối / Yêu cầu sửa
            </button>
            <button
              onClick={() => setShowApproveModal(true)}
              style={{
                padding: '12px 24px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <CheckCircle size={18} />
              Phê duyệt
            </button>
          </div>
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div
            style={{
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
            }}
            onClick={() => setShowApproveModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={24} color="#4caf50" />
                Xác nhận Phê duyệt
              </h2>
              <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                Bạn có chắc chắn muốn phê duyệt giáo trình này? Giáo trình sẽ được chuyển đến phòng Đào tạo để xử lý tiếp.
              </p>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Ghi chú phê duyệt
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc nhận xét (không bắt buộc)..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
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
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Phê duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div
            style={{
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
            }}
            onClick={() => setShowRejectModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} color="#f44336" />
                Từ chối / Yêu cầu Sửa đổi
              </h2>
              <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                Giáo trình sẽ được trả về cho giảng viên với lý do từ chối. Giảng viên bắt buộc phải chỉnh sửa trước khi nộp lại.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Loại vấn đề <span style={{ color: '#f44336' }}>*</span>
                </label>
                <select
                  value={rejectionType}
                  onChange={(e) => setRejectionType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="content_error">Sai sót nội dung</option>
                  <option value="clo_mismatch">CLO không phù hợp</option>
                  <option value="assessment_issue">Vấn đề về đánh giá</option>
                  <option value="format_error">Lỗi định dạng</option>
                  <option value="incomplete">Thiếu thông tin bắt buộc</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Lý do từ chối <span style={{ color: '#f44336' }}>*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Mô tả chi tiết lý do từ chối hoặc yêu cầu chỉnh sửa (bắt buộc)..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
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
                  disabled={isSubmitting || !rejectionReason.trim()}
                  style={{
                    padding: '10px 20px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: (isSubmitting || !rejectionReason.trim()) ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SyllabusReviewDetailPage;
