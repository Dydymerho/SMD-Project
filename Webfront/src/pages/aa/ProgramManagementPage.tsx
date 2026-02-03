import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle, Settings, Search, Bell, User, 
  Plus, Edit, Trash2, Award, BookOpen, GitBranch, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AAPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';
import PrerequisiteModal from '../../components/PrerequisiteModal';
import * as api from '../../services/api';

interface Program {
  programId: number;
  code: string;
  name: string;
  totalPLOs: number;
  totalCourses: number;
  departmentName: string;
}

interface PLO {
  ploId: number;
  code: string;
  description: string;
  programId: number;
  programCode: string;
  category: string;
}

interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits?: number;
}

interface CourseRelation {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits?: number;
  relations: api.CourseRelationResponse[];
}

const ProgramManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'programs' | 'plos' | 'prerequisites'>('programs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [plos, setPlos] = useState<PLO[]>([]);
  const [courseRelations, setCourseRelations] = useState<CourseRelation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedRelationType, setSelectedRelationType] = useState<'ALL' | 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedCourseForPrereq, setSelectedCourseForPrereq] = useState<Course | null>(null);
  const [ploSearchTerm, setPloSearchTerm] = useState('');
  const [showCreatePLOModal, setShowCreatePLOModal] = useState(false);
  const [editingPLOId, setEditingPLOId] = useState<number | null>(null);
  const [newPLO, setNewPLO] = useState({ ploCode: '', ploDescription: '', programId: '', category: 'Knowledge' });
  const [submittingPLO, setSubmittingPLO] = useState(false);
  const [createPLOError, setCreatePLOError] = useState<string | null>(null);
  const [deletingPLOId, setDeletingPLOId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'prerequisites') {
      loadCourseRelations();
    }
  }, [activeTab]);

  const loadCourseRelations = async () => {
    try {
      const relations = await api.getAllCourseRelations();
      setCourseRelations(relations);
    } catch (err) {
      console.error('Error loading course relations:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [programsData, plosData, allSyllabuses, unreadCount, coursesData] = await Promise.all([
        api.getPrograms(),
        api.getPLOs(),
        api.getAllSyllabuses(),
        api.getUnreadNotificationsCount(),
        api.getCourses()
      ]);

      const syllabusCounts: { [key: number]: number } = {};
      (allSyllabuses as any[]).forEach((s: any) => {
        const progId = s.program?.programId;
        if (progId) {
          syllabusCounts[progId] = (syllabusCounts[progId] || 0) + 1;
        }
      });

      const ploCounts: { [key: number]: number } = {};
      (plosData as any[]).forEach((p: any) => {
        const progId = p.programId;
        if (progId) {
          ploCounts[progId] = (ploCounts[progId] || 0) + 1;
        }
      });

      const normalizedPrograms = (programsData as any[]).map((p: any) => ({
        programId: p.programId,
        code: `PRG-${p.programId}`,
        name: p.programName,
        totalPLOs: ploCounts[p.programId] || 0,
        totalCourses: syllabusCounts[p.programId] || 0,
        departmentName: p.department?.deptName || 'Chưa rõ'
      }));

      const normalizedPLOs = (plosData as any[]).map((p: any) => ({
        ploId: p.ploId,
        code: p.ploCode || `PLO-${p.ploId}`,
        description: p.ploDescription || 'Chưa có mô tả',
        programId: p.programId,
        programCode: `PRG-${p.programId}`,
        category: 'Knowledge'
      }));

      const normalizedCourses = (coursesData as any[]).map((c: any) => ({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits: c.credits
      }));

      setPrograms(normalizedPrograms);
      setPlos(normalizedPLOs);
      setCourses(normalizedCourses);
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Error loading program data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
          <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/aa/syllabus-approval'); }}>
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Level 2
          </a>
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/aa/program-management'); }}>
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
            <h1>Quản lý Chương trình & PLO</h1>
            <p>Thiết lập tiêu chuẩn học thuật và cấu trúc chương trình</p>
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
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                borderBottom: '2px solid #e0e0e0',
                paddingBottom: '8px'
              }}>
                <button
                  onClick={() => setActiveTab('programs')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'programs' ? '#2196f3' : 'transparent',
                    color: activeTab === 'programs' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BookOpen size={16} />
                  Chương trình ({programs.length})
                </button>
                <button
                  onClick={() => setActiveTab('plos')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'plos' ? '#2196f3' : 'transparent',
                    color: activeTab === 'plos' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={16} />
                  PLO Standards ({plos.length})
                </button>
                <button
                  onClick={() => setActiveTab('prerequisites')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'prerequisites' ? '#008f81' : 'transparent',
                    color: activeTab === 'prerequisites' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <GitBranch size={16} />
                  Quan hệ môn học
                </button>
              </div>

              {activeTab === 'programs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <PrerequisiteModal
                isOpen={showPrerequisiteModal}
                courseId={selectedCourseForPrereq?.courseId}
                courseName={selectedCourseForPrereq?.courseName}
                onClose={() => {
                  setShowPrerequisiteModal(false);
                  setSelectedCourseForPrereq(null);
                }}
              />
                    <h3 style={{ margin: 0, color: '#333' }}>Danh sách Chương trình</h3>
                    <button style={{
                      padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none',
                      borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Plus size={18} />
                      Thêm Chương trình
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '16px'
                  }}>
                    {programs.map(program => (
                      <div key={program.programId} className="program-card" style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{program.code}</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{program.name}</p>
                            <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '12px' }}>{program.departmentName}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button style={{
                              padding: '6px', background: '#f5f5f5', border: 'none',
                              borderRadius: '6px', cursor: 'pointer'
                            }}>
                              <Edit size={16} color="#666" />
                            </button>
                            <button style={{
                              padding: '6px', background: '#ffebee', border: 'none',
                              borderRadius: '6px', cursor: 'pointer'
                            }}>
                              <Trash2 size={16} color="#f44336" />
                            </button>
                          </div>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          padding: '12px',
                          background: '#f9f9f9',
                          borderRadius: '8px'
                        }}>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>PLOs</p>
                            <p style={{ margin: 0, fontWeight: 600, color: '#2196f3' }}>{program.totalPLOs}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Môn học</p>
                            <p style={{ margin: 0, fontWeight: 600, color: '#4caf50' }}>{program.totalCourses}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {programs.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#999',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3>Chưa có chương trình nào</h3>
                      <p>Thêm chương trình đầu tiên để bắt đầu</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>PLO Standards</h3>
                    <button style={{
                      padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none',
                      borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Plus size={18} />
                      Thêm PLO
                    </button>
                  </div>

                  <div style={{
                    background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã PLO</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mô tả</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Chương trình</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Danh mục</th>
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plos.map((plo, index) => (
                          <tr key={plo.ploId} style={{
                            borderBottom: '1px solid #e0e0e0',
                            background: index % 2 === 0 ? '#fafafa' : 'white'
                          }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#2196f3' }}>{plo.code}</td>
                            <td style={{ padding: '16px', color: '#333' }}>{plo.description}</td>
                            <td style={{ padding: '16px', color: '#666' }}>{plo.programCode}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', background: '#e3f2fd',
                                color: '#1976d2', fontSize: '12px', fontWeight: 600
                              }}>
                                {plo.category}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button style={{
                                  padding: '6px 10px', background: '#2196f3', color: 'white', border: 'none',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                }}>
                                  <Edit size={14} />
                                </button>
                                <button style={{
                                  padding: '6px 10px', background: '#f44336', color: 'white', border: 'none',
                                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {plos.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#999',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3>Chưa có PLO nào</h3>
                      <p>Thêm PLO đầu tiên để bắt đầu</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prerequisites' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#008f81', fontSize: '20px', fontWeight: 600 }}>Quản lý Tiên quyết Môn học</h3>
                      <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Quản lý các quy tắc tiên quyết, song hành và tương đương giữa các môn học</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          padding: '10px 16px', border: '1px solid #ddd', borderRadius: '8px',
                          fontSize: '14px', width: '250px', outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Course List with Actions */}
                  <div style={{
                    background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã Môn học</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên Môn học</th>
                          <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#333' }}>Tín chỉ</th>
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses
                          .filter(course => {
                            const searchLower = searchTerm.toLowerCase();
                            return course.courseCode.toLowerCase().includes(searchLower) ||
                                   course.courseName.toLowerCase().includes(searchLower);
                          })
                          .map((course, index) => (
                          <tr key={course.courseId} style={{
                            borderBottom: '1px solid #e0e0e0',
                            background: index % 2 === 0 ? '#fafafa' : 'white'
                          }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#2196f3' }}>{course.courseCode}</td>
                            <td style={{ padding: '16px', color: '#333' }}>{course.courseName}</td>
                            <td style={{ padding: '16px', color: '#666' }}>{course.credits || 0}</td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCourseForPrereq(course);
                                    setShowPrerequisiteModal(true);
                                  }}
                                  style={{
                                    padding: '8px 12px', background: '#008f81', color: 'white', border: 'none',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                                  }}
                                >
                                  Xem chi tiết
                                </button>
                                <button
                                  type="button"
                                  disabled
                                  title="Chức năng thêm cần API hỗ trợ"
                                  style={{
                                    padding: '8px 10px', background: '#e0e0e0', color: '#777', border: 'none',
                                    borderRadius: '6px', cursor: 'not-allowed', fontSize: '12px', fontWeight: 600
                                  }}
                                >
                                  <Plus size={14} style={{ display: 'inline' }} />
                                </button>
                                <button
                                  type="button"
                                  disabled
                                  title="Chức năng sửa cần API hỗ trợ"
                                  style={{
                                    padding: '8px 10px', background: '#e0e0e0', color: '#777', border: 'none',
                                    borderRadius: '6px', cursor: 'not-allowed', fontSize: '12px', fontWeight: 600
                                  }}
                                >
                                  <Edit size={14} style={{ display: 'inline' }} />
                                </button>
                                <button
                                  type="button"
                                  disabled
                                  title="Chức năng xóa cần API hỗ trợ"
                                  style={{
                                    padding: '8px 10px', background: '#e0e0e0', color: '#777', border: 'none',
                                    borderRadius: '6px', cursor: 'not-allowed', fontSize: '12px', fontWeight: 600
                                  }}
                                >
                                  <Trash2 size={14} style={{ display: 'inline' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {courses.filter(course => {
                    const searchLower = searchTerm.toLowerCase();
                    return course.courseCode.toLowerCase().includes(searchLower) ||
                           course.courseName.toLowerCase().includes(searchLower);
                  }).length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#999',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      marginTop: '12px'
                    }}>
                      <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3>{searchTerm ? 'Không tìm thấy môn học' : 'Chưa có môn học nào'}</h3>
                      <p>{searchTerm ? 'Hãy thử với từ khóa khác' : 'Hệ thống chưa có môn học'}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <PrerequisiteModal
        isOpen={showPrerequisiteModal}
        courseId={selectedCourseForPrereq?.courseId}
        courseName={selectedCourseForPrereq?.courseName}
        onClose={() => {
          setShowPrerequisiteModal(false);
          setSelectedCourseForPrereq(null);
        }}
      />
    </div>
  );
};

export default ProgramManagementPage;