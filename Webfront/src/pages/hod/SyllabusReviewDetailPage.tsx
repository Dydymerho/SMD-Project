import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, ArrowLeft, AlertTriangle, 
  Home, Users, Search, Bell, User, FileText, Clock, 
  TrendingUp, Zap, Loader, AlertCircle, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSyllabusDetailForReview, approveSyllabus, rejectSyllabus, getPendingSyllabusesForHoD } from '../../services/workflowService';
import * as api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface SyllabusDetail {
  id: string;
  courseId?: number;
  courseCode: string;
  courseName: string;
  credits: number;
  deptName?: string;
  courseType?: string;
  lecturer: {
    name: string;
    email: string;
  };
  version: number;
  submissionDate: string;
  academicYear: string;
  description?: string;
  aiSummary?: string | null;
  currentStatus?: string;
  rejectionReason?: string;
  clos: string[];
  sessionPlans?: Array<{
    sessionId?: number;
    weekNo: number;
    topic: string;
    teachingMethod: string;
  }>;
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
  materials?: Array<{
    materialId?: number;
    title: string;
    author: string;
    materialType: string;
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
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clos, setClos] = useState<api.CLOResponse[]>([]);
  const [mappings, setMappings] = useState<api.CLOPLOMappingResponse[]>([]);
  const [courseRelations, setCourseRelations] = useState<api.CourseRelationResponse[]>([]);
  
  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionType, setRejectionType] = useState('content_error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notificationCount = 0;

  const loadSyllabusDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) throw new Error('Không có ID giáo trình');
      const syllabusId = parseInt(id);
      
      // Get full detail
      const data = await getSyllabusDetailForReview(syllabusId);
      console.log('Syllabus loaded:', data);
      
      // Get status from the list
      try {
        const listResult = await getPendingSyllabusesForHoD();
        const syllabusFromList = listResult.data.find((s: any) => (s.id || s.syllabusId) === syllabusId);
        if (syllabusFromList) {
          console.log('Syllabus from list:', syllabusFromList);
          console.log('currentStatus from list:', syllabusFromList.currentStatus);
          data.currentStatus = syllabusFromList.currentStatus || syllabusFromList.status;
        }
      } catch (e) {
        console.error('Error getting status from list:', e);
      }
      
      setSyllabus(data);
    } catch (err) {
      console.error('Error loading syllabus:', err);
      setError('Không thể tải chi tiết giáo trình. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabusDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!syllabus?.id) return;
    const syllabusId = Number(syllabus.id);
    if (Number.isNaN(syllabusId)) return;

    const fetchCLOData = async () => {
      try {
        const [closData, mappingsData] = await Promise.all([
          api.getCLOsBySyllabusId(syllabusId),
          api.getCLOPLOMappingsBySyllabusId(syllabusId)
        ]);
        setClos(Array.isArray(closData) ? closData : []);
        setMappings(Array.isArray(mappingsData) ? mappingsData : []);
      } catch (fetchError) {
        console.error('Lỗi lấy dữ liệu CLO/Mappings:', fetchError);
        setClos([]);
        setMappings([]);
      }
    };

    fetchCLOData();
  }, [syllabus?.id]);

  useEffect(() => {
    if (!syllabus?.courseId) return;

    const fetchRelations = async () => {
      try {
        const relations = await api.getCourseRelationsByCourseId(syllabus.courseId!);
        setCourseRelations(Array.isArray(relations) ? relations : []);
      } catch (fetchError) {
        console.error('Lỗi lấy cây môn học:', fetchError);
        setCourseRelations([]);
      }
    };

    fetchRelations();
  }, [syllabus?.courseId]);

  const handleApprove = async () => {
    if (!approvalNote.trim()) {
      warning('Vui lòng nhập ghi chú phê duyệt');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!id) throw new Error('Không có ID giáo trình');
      const syllabusId = parseInt(id);
      await approveSyllabus(syllabusId, approvalNote);
      success('Đã phê duyệt giáo trình thành công! Giáo trình sẽ được chuyển đến phòng Đào tạo.');
      setTimeout(() => navigate('/hod/syllabus-review'), 1500);
    } catch (error: any) {
      console.error('Error approving syllabus:', error);
      // Check if error is due to status
      if (error.response?.data?.message?.includes('PENDING_REVIEW')) {
        showError(`Giáo trình không ở trạng thái "Chờ xử lý" - ${error.response.data.message}`);
      } else {
        showError('Có lỗi xảy ra khi phê duyệt');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      warning('Vui lòng nhập lý do từ chối (bắt buộc)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!id) throw new Error('Không có ID giáo trình');
      const syllabusId = parseInt(id);
      await rejectSyllabus(syllabusId, rejectionReason);
      success('Đã từ chối giáo trình. Giáo trình sẽ được trả về cho giảng viên với lý do từ chối.');
      setTimeout(() => navigate('/hod/syllabus-review'), 1500);
    } catch (error: any) {
      console.error('Error rejecting syllabus:', error);
      // Check if error is due to status
      if (error.response?.data?.message?.includes('PENDING_REVIEW')) {
        showError(`Giáo trình không ở trạng thái "Chờ xử lý" - ${error.response.data.message}`);
      } else {
        showError('Có lỗi xảy ra khi từ chối');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status config helper (without icons, for data)
  const getStatusConfig = (status: string | undefined): { bg: string; color: string; text: string; iconName: string } => {
    const configs: Record<string, { bg: string; color: string; text: string; iconName: string }> = {
      DRAFT: { bg: '#f5f5f5', color: '#666', text: 'Nháp', iconName: 'file' },
      PENDING_REVIEW: { bg: '#fff3cd', color: '#856404', text: 'Chờ phê duyệt', iconName: 'clock' },
      PENDING_APPROVAL: { bg: '#d1ecf1', color: '#0c5460', text: 'Chờ xác nhận', iconName: 'alert' },
      PUBLISHED: { bg: '#d4edda', color: '#155724', text: 'Công bố', iconName: 'check' },
      ARCHIVED: { bg: '#e2e3e5', color: '#383d41', text: 'Lưu trữ', iconName: 'file' },
      REJECTED: { bg: '#f8d7da', color: '#721c24', text: 'Bị từ chối', iconName: 'x' }
    };
    return configs[status || 'DRAFT'] || configs.DRAFT;
  };

  // Render icon by name
  const renderStatusIcon = (iconName: string) => {
    const iconStyle = { display: 'inline', marginRight: '4px', verticalAlign: 'middle' };
    switch(iconName) {
      case 'clock':
        return <Clock size={16} style={iconStyle} />;
      case 'alert':
        return <AlertCircle size={16} style={iconStyle} />;
      case 'check':
        return <CheckCircle size={16} style={iconStyle} />;
      case 'x':
        return <XCircle size={16} style={iconStyle} />;
      case 'file':
      default:
        return <FileText size={16} style={iconStyle} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} className="spin" style={{ color: '#1976d2', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: '#666', fontSize: '16px', fontWeight: 500 }}>Đang tải chi tiết giáo trình...</p>
        </div>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={48} style={{ color: '#f44336', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#f44336', margin: '0 0 8px 0' }}>Lỗi tải dữ liệu</h3>
          <p style={{ color: '#666', margin: '0 0 16px 0' }}>{error || 'Không tìm thấy giáo trình'}</p>
          <button
            onClick={() => window.location.reload()}
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
      </div>
    );
  }

  console.log('syllabus.currentStatus:', syllabus.currentStatus);
  console.log('Status check - isPending:', (syllabus.currentStatus || '').trim().toUpperCase() === 'PENDING_REVIEW');

  return (
    <div className="dashboard-page">
      <Toast toasts={toasts} onRemove={removeToast} />
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
                {notificationCount > 0 && (
                  <span className="badge">{notificationCount}</span>
                )}
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
              {(() => {
                const config = getStatusConfig(syllabus.currentStatus);
                return (
                  <div style={{
                    background: config.bg,
                    color: config.color,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}>
                    {renderStatusIcon(config.iconName)}
                    {config.text}
                  </div>
                );
              })()}
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
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Loại môn học</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{syllabus.courseType || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Năm học</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{syllabus.academicYear || 'N/A'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Bộ môn</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{syllabus.deptName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason Section */}
          {syllabus.currentStatus === 'REJECTED' && syllabus.rejectionReason && (
            <div style={{
              background: '#f8d7da',
              border: '2px solid #f5c6cb',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#721c24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={20} color="#721c24" />
                Lý do từ chối giáo trình
              </h3>
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                color: '#333',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {syllabus.rejectionReason}
              </div>
              <p style={{ margin: '16px 0 0 0', color: '#721c24', fontSize: '14px' }}>
                💡 Vui lòng xem lý do từ chối trên và chỉnh sửa giáo trình của bạn trước khi nộp lại.
              </p>
            </div>
          )}

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
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px', fontWeight: 700 }}>Mô tả giáo trình</h3>
            {syllabus.description && syllabus.description.trim().length > 0 ? (
              <p style={{ margin: 0, color: '#555', lineHeight: 1.6 }}>{syllabus.description}</p>
            ) : (
              <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>Chưa có mô tả cho giáo trình này</p>
            )}
          </div>

          {/* AI Summary */}
          {syllabus.aiSummary && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(156, 39, 176, 0.04) 100%)',
              border: '2px solid #9c27b0',
              borderLeft: '4px solid #9c27b0',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#9c27b0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                Tóm tắt AI
              </h3>
              <p style={{ 
                margin: 0, 
                color: '#555', 
                lineHeight: 1.8,
                fontSize: '15px'
              }}>
                {syllabus.aiSummary}
              </p>
            </div>
          )}

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
            {clos.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {clos.map((clo) => (
                  <li key={clo.cloId} style={{ margin: '8px 0', color: '#666', lineHeight: 1.6 }}>
                    <strong style={{ color: '#333' }}>{clo.cloCode}</strong>: {clo.cloDescription}
                  </li>
                ))}
              </ul>
            ) : syllabus.clos && syllabus.clos.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {syllabus.clos.map((clo: any, index: number) => (
                  <li key={index} style={{ margin: '8px 0', color: '#666', lineHeight: 1.6 }}>
                    {typeof clo === 'string' ? clo : (clo.description || clo.name || JSON.stringify(clo))}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>Chưa có CLO được định nghĩa</p>
            )}
          </div>

          {/* CLO-PLO Mappings */}
          {mappings.length > 0 && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#4caf50" />
                CLO-PLO Mappings
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>CLO Code</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>PLO Code</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>PLO Description</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Mapping Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping, idx) => (
                      <tr key={mapping.mappingId || idx} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#2196f3' }}>{mapping.cloCode}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#4caf50' }}>{mapping.ploCode}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{mapping.ploDescription}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            background: mapping.mappingLevel === 'HIGH' ? '#4caf5020' :
                                        mapping.mappingLevel === 'MEDIUM' ? '#ff980020' :
                                        '#f4433620',
                            color: mapping.mappingLevel === 'HIGH' ? '#4caf50' :
                                   mapping.mappingLevel === 'MEDIUM' ? '#ff9800' :
                                   '#f44336',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {mapping.mappingLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Course Relations */}
          {courseRelations.length > 0 && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#ff9800" />
                Cây môn học
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {courseRelations.map((relation) => (
                  <div key={relation.relationId} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#333', fontWeight: 600 }}>
                        {relation.targetCourseCode} - {relation.targetCourseName}
                      </div>
                      <span style={{
                        background: relation.relationType === 'PREREQUISITE' ? '#2196f320' :
                                    relation.relationType === 'COREQUISITE' ? '#ff980020' :
                                    '#4caf5020',
                        color: relation.relationType === 'PREREQUISITE' ? '#2196f3' :
                               relation.relationType === 'COREQUISITE' ? '#ff9800' :
                               '#4caf50',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {relation.relationType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Plans */}
          {syllabus.sessionPlans && syllabus.sessionPlans.length > 0 && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                Kế hoạch giảng dạy ({syllabus.sessionPlans.length} buổi)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tuần</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Chủ đề</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Phương pháp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syllabus.sessionPlans.map((session, idx) => (
                      <tr key={session.sessionId || idx} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#2196f3' }}>Tuần {session.weekNo}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{session.topic}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{session.teachingMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assessments */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Đánh giá</h3>
            {syllabus.assessments && syllabus.assessments.length > 0 ? (
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
            ) : (
              <p style={{ margin: 0, color: '#999', fontStyle: 'italic' }}>Chưa có phương pháp đánh giá được định nghĩa</p>
            )}
          </div>

          {/* Materials */}
          {syllabus.materials && syllabus.materials.length > 0 && (
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                Tài liệu tham khảo ({syllabus.materials.length} tài liệu)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {syllabus.materials.map((material, idx) => (
                  <div key={material.materialId || idx} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <FileText size={18} color="#ff9800" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '14px', fontWeight: 600 }}>{material.title}</h4>
                        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '12px' }}>{material.author}</p>
                        <span style={{ background: '#ff980020', color: '#ff9800', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {material.materialType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(() => {
            const status = (syllabus.currentStatus || '').trim().toUpperCase();
            return status === 'PENDING_REVIEW';
          })() && (
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
          )}

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
        </div>
      </main>
    </div>
  );
};

export default SyllabusReviewDetailPage;
