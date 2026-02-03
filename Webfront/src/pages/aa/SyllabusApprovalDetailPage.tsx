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
import * as api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';

interface SessionPlan {
  sessionId: number;
  weekNo: number;
  topic: string;
  teachingMethod: string;
}

interface Assessment {
  assessmentId: number;
  name: string;
  weightPercent: number;
  criteria: string;
}

interface Material {
  materialId: number;
  title: string;
  author: string;
  materialType: string;
}

interface SyllabusDetail {
  syllabusId: number;
  courseId?: number;
  courseCode: string;
  courseName: string;
  credits: number;
  deptName?: string;
  courseType?: string;
  programName?: string;
  lecturerName: string;
  lecturerEmail?: string;
  academicYear?: string;
  currentStatus?: string;
  versionNotes?: string;
  description?: string;
  aiSummary?: string;
  sessionPlans?: SessionPlan[];
  assessments?: Assessment[];
  materials?: Material[];
  clos: string[];
  rubricsValid: boolean;
  rubricsIssues: string[];
  prerequisitesValid: boolean;
  prerequisitesList: string[];
}

const AASyllabusApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [clos, setClos] = useState<api.CLOResponse[]>([]);
  const [mappings, setMappings] = useState<api.CLOPLOMappingResponse[]>([]);
  const [courseRelations, setCourseRelations] = useState<api.CourseRelationResponse[]>([]);

  useEffect(() => {
    loadSyllabusDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSyllabusDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [syllabusData, syllabusInfo, unreadCount] = await Promise.all([
        api.getSyllabusDetail(parseInt(id)),
        api.getSyllabusById(parseInt(id)).catch(() => null),
        api.getUnreadNotificationsCount().catch(() => 0)
      ]);

      console.log('Loaded syllabus detail:', syllabusData);

      // Transform API data to local format
      setSyllabus({
        syllabusId: syllabusData.id,
        courseId: syllabusInfo?.course?.courseId,
        courseCode: syllabusData.courseCode,
        courseName: syllabusData.courseName,
        credits: syllabusData.credit,
        deptName: syllabusData.deptName || syllabusInfo?.course?.department?.deptName,
        courseType: syllabusData.type || undefined,
        programName: syllabusInfo?.program?.programName,
        lecturerName: syllabusData.lecturerName || syllabusInfo?.lecturer?.fullName || 'N/A',
        lecturerEmail: undefined,
        academicYear: syllabusData.academicYear,
        currentStatus: syllabusInfo?.currentStatus,
        versionNotes: syllabusInfo?.versionNotes,
        description: syllabusData.description,
        aiSummary: syllabusData.aiSumary,
        sessionPlans: syllabusData.sessionPlans || [],
        assessments: syllabusData.assessments || [],
        materials: syllabusData.materials || [],
        clos: syllabusData.target || [],
        rubricsValid: true, // Mock data
        rubricsIssues: [],
        prerequisitesValid: true, // Mock data
        prerequisitesList: [],
      });
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Error loading syllabus:', error);
      showError('Không thể tải thông tin giáo trình');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!syllabus?.syllabusId) return;
    const syllabusId = Number(syllabus.syllabusId);
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
  }, [syllabus?.syllabusId]);

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
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await api.aaApproveSyllabus(parseInt(id), approvalNote);
      success('Đã phê duyệt Level 2! Giáo trình sẽ được chuyển đến Principal để phê duyệt cuối cùng.');
      setShowApproveModal(false);
      setTimeout(() => navigate('/aa/syllabus-approval'), 1000);
    } catch (error: any) {
      console.error('Error approving:', error);
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) {
      warning('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.aaRejectSyllabus(parseInt(id), rejectionReason);
      success('Đã từ chối giáo trình. Giáo trình sẽ được trả về HoD với lý do từ chối.');
      setShowRejectModal(false);
      setTimeout(() => navigate('/aa/syllabus-approval'), 1000);
    } catch (error: any) {
      console.error('Error rejecting:', error);
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối');
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
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="logout-btn">Đăng xuất</a>
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
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-approval'); }}
            style={{
              background: 'white', border: '1px solid #ddd', padding: '10px 16px', borderRadius: '8px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 500, textDecoration: 'none', color: 'inherit'
            }}
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </a>

          {/* Course Info */}
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span style={{ background: '#2196f315', color: '#2196f3', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                {syllabus.courseCode}
              </span>
              <span style={{ background: '#ff980015', color: '#ff9800', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                {syllabus.currentStatus || 'PENDING_APPROVAL'}
              </span>
            </div>
            <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>{syllabus.courseName}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', color: '#666', fontSize: '14px' }}>
              <div><strong>Chương trình:</strong> {syllabus.programName || 'N/A'}</div>
              <div><strong>Số tín chỉ:</strong> {syllabus.credits}</div>
              <div><strong>Khoa:</strong> {syllabus.deptName || 'N/A'}</div>
              <div><strong>Giảng viên:</strong> {syllabus.lecturerName}</div>
              <div><strong>Loại môn:</strong> {syllabus.courseType || 'N/A'}</div>
              {syllabus.academicYear && <div><strong>Năm học:</strong> {syllabus.academicYear}</div>}
            </div>
            {syllabus.versionNotes && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                <strong>Ghi chú:</strong> {syllabus.versionNotes}
              </div>
            )}
          </div>

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

          {/* AI Summary Section */}
          {syllabus.aiSummary && (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', borderRadius: '12px', marginBottom: '24px', color: 'white' }}>
              <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <Zap size={20} />
                AI Summary - Tổng hợp tự động
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', lineHeight: 1.8 }}>
                {syllabus.aiSummary}
              </div>
            </div>
          )}

          {/* CLO Section */}
          {clos.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#1976d2" />
                Chuẩn đầu ra học phần (CLO)
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mã CLO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mô tả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clos.map((clo, idx) => (
                      <tr key={clo.cloId} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1976d2' }}>{clo.cloCode}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{clo.cloDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Session Plans Section */}
          {syllabus.sessionPlans && syllabus.sessionPlans.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#2196f3" />
                Kế hoạch Giảng dạy ({syllabus.sessionPlans.length} buổi học)
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tuần</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Chủ đề</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Phương pháp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syllabus.sessionPlans.map((session, idx) => (
                      <tr key={session.sessionId} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
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

          {/* Assessments Section */}
          {syllabus.assessments && syllabus.assessments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#4caf50" />
                Đánh giá & Kiểm tra ({syllabus.assessments.length} hình thức)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {syllabus.assessments.map((assessment) => (
                  <div key={assessment.assessmentId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>{assessment.name}</h4>
                      <span style={{ background: '#4caf5015', color: '#4caf50', padding: '4px 12px', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }}>
                        {assessment.weightPercent}%
                      </span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '13px' }}>{assessment.criteria}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Section */}
          {syllabus.materials && syllabus.materials.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#ff9800" />
                Tài liệu Tham khảo ({syllabus.materials.length} tài liệu)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {syllabus.materials.map((material) => (
                  <div key={material.materialId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <FileText size={18} color="#ff9800" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '14px' }}>{material.title}</h4>
                        <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>{material.author}</p>
                        <span style={{ background: '#ff980015', color: '#ff9800', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {material.materialType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLO-PLO Mapping Section */}
          {mappings.length > 0 ? (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} />
                Mapping CLO - PLO
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>CLO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mô tả CLO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>PLO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mô tả PLO</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Mức độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping, idx) => (
                      <tr key={mapping.mappingId} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1976d2' }}>{mapping.cloCode}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{mapping.cloDescription}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#7b1fa2' }}>{mapping.ploCode}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{mapping.ploDescription}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{mapping.mappingLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff3e0', color: '#e65100', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <AlertTriangle size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Chưa có dữ liệu mapping CLO - PLO.
            </div>
          )}

          {/* Course Relations Section */}
          {courseRelations.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#ff9800" />
                Cây môn học / Quan hệ môn học
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Loại quan hệ</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Mã môn</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Tên môn</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Tín chỉ</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Khoa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseRelations.map((relation, idx) => (
                      <tr key={`${relation.relationId}-${relation.targetCourseId}`} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '12px', color: '#333' }}>{relation.relationType}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1976d2' }}>{relation.targetCourseCode}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{relation.targetCourseName}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>{relation.credits ?? '-'}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{relation.deptName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AASyllabusApprovalDetailPage;
