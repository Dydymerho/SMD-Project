import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, FileText, Send, Bell, User, Zap, Home, Loader2, Hash, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import NotificationMenu from '../components/NotificationMenu';
import './dashboard/DashboardPage.css';

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
  lecturerName: string;
  academicYear?: string;
  courseType?: string;
  aiSummary?: string;
  description?: string;
  sessionPlans?: SessionPlan[];
  assessments?: Assessment[];
  materials?: Material[];
  clos: string[];
}

const SubjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { syllabusId } = useParams<{ syllabusId: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitNote, setSubmitNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [courseRelations, setCourseRelations] = useState<api.CourseRelationResponse[]>([]);
  
  // API Data States - CLOs and Mappings
  const [clos, setClos] = useState<api.CLOResponse[]>([]);
  const [mappings, setMappings] = useState<api.CLOPLOMappingResponse[]>([]);

  useEffect(() => {
    if (!syllabusId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [syllabusData, unreadCount] = await Promise.all([
          api.getSyllabusDetail(parseInt(syllabusId)),
          api.getUnreadNotificationsCount().catch(() => 0)
        ]);

        // Transform API data to local format
        setSyllabus({
          syllabusId: syllabusData.id,
          courseId: syllabusId ? parseInt(syllabusId) : undefined,
          courseCode: syllabusData.courseCode,
          courseName: syllabusData.courseName,
          credits: syllabusData.credit,
          deptName: syllabusData.deptName,
          lecturerName: syllabusData.lecturerName,
          academicYear: syllabusData.academicYear,
          courseType: syllabusData.type,
          aiSummary: syllabusData.aiSumary,
          description: syllabusData.description,
          sessionPlans: syllabusData.sessionPlans || [],
          assessments: syllabusData.assessments || [],
          materials: syllabusData.materials || [],
          clos: syllabusData.target || [],
        });
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error loading syllabus:', error);
        alert('Không thể tải thông tin giáo trình');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [syllabusId]);

  // Fetch course relations 
  useEffect(() => {
    if (syllabus && syllabus.courseId) {
      const fetchRelations = async () => {
        try {
          const relations = await api.getCourseRelationsByCourseId(syllabus.courseId!);
          console.log('Course relations fetched:', relations);
          setCourseRelations(Array.isArray(relations) ? relations : []);
        } catch (error) {
          console.error('Lỗi lấy mối quan hệ môn học:', error);
          setCourseRelations([]);
        }
      };
      fetchRelations();
    }
  }, [syllabus]);

  // Fetch CLOs and mappings
  useEffect(() => {
    if (syllabus) {
      const fetchCLOData = async () => {
        try {
          // Fetch CLOs by Syllabus ID
          const closData = await api.getCLOsBySyllabusId(syllabus.syllabusId);
          console.log('CLOs fetched:', closData);
          setClos(Array.isArray(closData) ? closData : []);
          
          // Fetch CLO-PLO Mappings by Syllabus ID
          const mappingsData = await api.getCLOPLOMappingsBySyllabusId(syllabus.syllabusId);
          console.log('CLO-PLO Mappings fetched:', mappingsData);
          setMappings(Array.isArray(mappingsData) ? mappingsData : []);
        } catch (error) {
          console.error('Lỗi lấy dữ liệu CLO:', error);
          setClos([]);
          setMappings([]);
        }
      };
      fetchCLOData();
    }
  }, [syllabus]);

  const handleSubmitForReview = async () => {
    if (!syllabusId) return;
    
    setIsSubmitting(true);
    try {
      await api.submitForReview(parseInt(syllabusId), submitNote);
      alert('✅ Giáo trình đã được gửi cho HoD duyệt!\nVui lòng chờ phản hồi.');
      setShowSubmitModal(false);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error submitting:', error);
      alert(error.response?.data?.message || '❌ Có lỗi xảy ra khi gửi giáo trình');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} color="#008f81" className="animate-spin" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#666' }}>Đang tải thông tin giáo trình...</p>
        </div>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} color="#f44336" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#666' }}>Không tìm thấy giáo trình</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2196f3', fontWeight: 600 }}
            >
              <Home size={20} />
            </button>
            <h2 style={{ margin: 0, color: '#333' }}>Giáo trình chi tiết</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={20} color="#333" />
                {notificationCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#f44336',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {notificationCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#333" />
              <span style={{ color: '#333' }}>{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: '1px solid #ddd',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '24px',
            color: '#2196f3',
            fontWeight: 500,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
          }}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>

        {/* Header */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: '#2196f315', color: '#2196f3', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
              {syllabus.courseCode}
            </span>
          </div>
          <h1 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '32px', fontWeight: 700 }}>
            {syllabus.courseName}
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Giảng viên</p>
              <p style={{ margin: 0, color: '#333', fontSize: '15px', fontWeight: 500 }}>{syllabus.lecturerName}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Tín chỉ</p>
              <p style={{ margin: 0, color: '#333', fontSize: '15px', fontWeight: 500 }}>{syllabus.credits}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Loại môn học</p>
              <p style={{ margin: 0, color: '#333', fontSize: '15px', fontWeight: 500 }}>{syllabus.courseType || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Năm học</p>
              <p style={{ margin: 0, color: '#333', fontSize: '15px', fontWeight: 500 }}>{syllabus.academicYear || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Bộ môn</p>
              <p style={{ margin: 0, color: '#333', fontSize: '15px', fontWeight: 500 }}>{syllabus.deptName || 'N/A'}</p>
            </div>
          </div>
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

        {/* AI Summary */}
        {syllabus.aiSummary && (
          <div style={{
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <Zap size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Tóm tắt AI</h3>
                <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.95 }}>{syllabus.aiSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* CLOs */}
        {clos.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hash size={20} color="#2196f3" />
              Course Learning Outcomes (CLOs)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {clos.map((clo) => (
                <div key={clo.cloId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #2196f3' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#2196f3', fontWeight: 600, fontSize: '15px' }}>{clo.cloCode}</h4>
                  </div>
                  <p style={{ margin: 0, color: '#333', lineHeight: 1.6 }}>{clo.cloDescription}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLO-PLO Mappings */}
        {mappings.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#4caf50" />
              CLO-PLO Mappings
            </h3>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
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
                      <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
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
          </div>
        )}

        {/* Course Relations */}
        {courseRelations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#ff9800" />
              Cây môn học
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {courseRelations.map((relation) => (
                <div key={relation.relationId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #ff9800' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#333', fontWeight: 600 }}>
                      {relation.targetCourseCode} - {relation.targetCourseName}
                    </h4>
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
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#2196f3" />
              Kế hoạch Giảng dạy ({syllabus.sessionPlans.length} buổi học)
            </h3>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
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
                      <tr key={session.sessionId} style={{ borderBottom: '1px solid #e0e0e0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#2196f3' }}>Tuần {session.weekNo}</td>
                        <td style={{ padding: '12px', color: '#333' }}>{session.topic}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{session.teachingMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Assessments */}
        {syllabus.assessments && syllabus.assessments.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#4caf50" />
              Đánh giá & Kiểm tra ({syllabus.assessments.length} hình thức)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {syllabus.assessments.map((assessment) => (
                <div key={assessment.assessmentId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #4caf50' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: 600 }}>{assessment.name}</h4>
                    <span style={{ background: '#4caf5020', color: '#4caf50', padding: '4px 12px', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }}>
                      {assessment.weightPercent}%
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '13px', lineHeight: 1.5 }}>{assessment.criteria}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {syllabus.materials && syllabus.materials.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#ff9800" />
              Tài liệu Tham khảo ({syllabus.materials.length} tài liệu)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {syllabus.materials.map((material) => (
                <div key={material.materialId} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #ff9800' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <FileText size={20} color="#ff9800" style={{ marginTop: '2px', flexShrink: 0 }} />
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

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              flex: 1,
              padding: '14px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4caf50';
            }}
          >
            <Send size={18} />
            Gửi cho HoD duyệt
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#eee';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
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
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={24} color="#4caf50" />
              Gửi giáo trình cho HoD duyệt
            </h2>
            <p style={{ color: '#666', margin: '0 0 20px 0' }}>
              Bạn có chắc chắn muốn gửi giáo trình này cho Trưởng bộ môn duyệt không? Sau khi gửi, giáo trình sẽ không thể chỉnh sửa cho đến khi HoD phê duyệt hoặc yêu cầu chỉnh sửa.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 600 }}>
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                placeholder="Nhập bất kỳ ghi chú hoặc lưu ý nào cho HoD..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eee';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isSubmitting ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#45a049';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#4caf50';
                }}
              >
                <Send size={18} />
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetailPage;
