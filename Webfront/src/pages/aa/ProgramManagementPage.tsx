import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle, Settings, Search, Bell, User, 
  Plus, Edit, Trash2, Award, BookOpen, GitBranch, AlertTriangle, X, Check, Loader
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
  courseType?: string | null;
  departmentId?: number;
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
  const [activeTab, setActiveTab] = useState<'courses' | 'plos' | 'prerequisites'>('courses');
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
  const [newPLO, setNewPLO] = useState({ ploCode: '', ploDescription: '', programId: '' });
  const [submittingPLO, setSubmittingPLO] = useState(false);
  const [createPLOError, setCreatePLOError] = useState<string | null>(null);
  const [deletingPLOId, setDeletingPLOId] = useState<number | null>(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '', credits: '', courseType: '', departmentId: '' });
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [departments, setDepartments] = useState<Array<{ departmentId: number; deptName: string }>>([]);
  const [createCourseError, setCreateCourseError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

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
      const [programsData, plosData, allSyllabuses, unreadCount, coursesData, departmentsData] = await Promise.all([
        api.getPrograms(),
        api.getPLOs(),
        api.getAllSyllabuses(),
        api.getUnreadNotificationsCount(),
        api.getCourses(),
        api.getDepartments()
      ]);

      setDepartments(departmentsData as any[]);

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
        credits: c.credits,
        courseType: c.courseType ?? c.type ?? null
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

  const handleCreatePLO = async () => {
    if (!newPLO.ploCode.trim() || !newPLO.ploDescription.trim() || !newPLO.programId) {
      setCreatePLOError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingPLO(true);
    setCreatePLOError(null);

    try {
      const createdPLO = await api.createPLO({
        ploCode: newPLO.ploCode,
        ploDescription: newPLO.ploDescription,
        programId: parseInt(newPLO.programId)
      });

      setPlos([...plos, {
        ploId: createdPLO.ploId,
        code: createdPLO.ploCode,
        description: createdPLO.ploDescription,
        programId: createdPLO.programId,
        programCode: `PRG-${createdPLO.programId}`,
        category: 'Knowledge'
      }]);

      setShowCreatePLOModal(false);
      setNewPLO({ ploCode: '', ploDescription: '', programId: '' });
    } catch (err) {
      setCreatePLOError((err as Error).message || 'Không thể tạo PLO');
    } finally {
      setSubmittingPLO(false);
    }
  };

  const handleEditPLO = async () => {
    if (!editingPLOId || !newPLO.ploCode.trim() || !newPLO.ploDescription.trim() || !newPLO.programId) {
      setCreatePLOError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingPLO(true);
    setCreatePLOError(null);

    try {
      await api.updatePLO(editingPLOId, {
        ploCode: newPLO.ploCode,
        ploDescription: newPLO.ploDescription,
        programId: parseInt(newPLO.programId)
      });

      setPlos(plos.map(p => 
        p.ploId === editingPLOId 
          ? {
              ...p,
              code: newPLO.ploCode,
              description: newPLO.ploDescription,
              programId: parseInt(newPLO.programId),
              programCode: `PRG-${newPLO.programId}`
            }
          : p
      ));

      setShowCreatePLOModal(false);
      setEditingPLOId(null);
      setNewPLO({ ploCode: '', ploDescription: '', programId: '' });
    } catch (err) {
      setCreatePLOError((err as Error).message || 'Không thể cập nhật PLO');
    } finally {
      setSubmittingPLO(false);
    }
  };

  const handleDeletePLO = async () => {
    if (!deletingPLOId) return;

    setSubmittingPLO(true);
    setCreatePLOError(null);

    try {
      await api.deletePLO(deletingPLOId);
      setPlos(plos.filter(p => p.ploId !== deletingPLOId));
      setDeletingPLOId(null);
    } catch (err) {
      setCreatePLOError((err as Error).message || 'Không thể xóa PLO');
    } finally {
      setSubmittingPLO(false);
    }
  };

  const loadPLOForEdit = (ploId: number) => {
    const plo = plos.find(p => p.ploId === ploId);
    if (!plo) return;

    setNewPLO({
      ploCode: plo.code,
      ploDescription: plo.description,
      programId: String(plo.programId)
    });
    setEditingPLOId(ploId);
    setShowCreatePLOModal(true);
  };

  const handleCreateCourse = async () => {
    if (!newCourse.courseCode.trim() || !newCourse.courseName.trim() || !newCourse.credits || !newCourse.courseType.trim() || !newCourse.departmentId.trim()) {
      setCreateCourseError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingCourse(true);
    setCreateCourseError(null);

    try {
      const createdCourse = await api.createCourse({
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        credits: parseInt(newCourse.credits),
        courseType: newCourse.courseType,
        departmentId: parseInt(newCourse.departmentId)
      });

      setCourses([...courses, {
        courseId: createdCourse.courseId,
        courseCode: createdCourse.courseCode,
        courseName: createdCourse.courseName,
        credits: createdCourse.credits,
        courseType: createdCourse.courseType ?? null,
        departmentId: createdCourse.departmentId
      }]);

      setShowCreateCourseModal(false);
      setNewCourse({ courseCode: '', courseName: '', credits: '', courseType: '', departmentId: '' });
    } catch (err) {
      setCreateCourseError((err as Error).message || 'Không thể tạo môn học');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourseId || !newCourse.courseCode.trim() || !newCourse.courseName.trim() || !newCourse.credits || !newCourse.courseType.trim() || !newCourse.departmentId.trim()) {
      setCreateCourseError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingCourse(true);
    setCreateCourseError(null);

    try {
      await api.updateCourse(editingCourseId, {
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        credits: parseInt(newCourse.credits),
        courseType: newCourse.courseType,
        departmentId: parseInt(newCourse.departmentId)
      });

      setCourses(courses.map(c =>
        c.courseId === editingCourseId
          ? {
              ...c,
              courseCode: newCourse.courseCode,
              courseName: newCourse.courseName,
              credits: parseInt(newCourse.credits),
              courseType: newCourse.courseType,
              departmentId: parseInt(newCourse.departmentId)
            }
          : c
      ));

      setShowCreateCourseModal(false);
      setEditingCourseId(null);
      setNewCourse({ courseCode: '', courseName: '', credits: '', courseType: '', departmentId: '' });
    } catch (err) {
      setCreateCourseError((err as Error).message || 'Không thể cập nhật môn học');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;

    setSubmittingCourse(true);
    setCreateCourseError(null);

    try {
      await api.deleteCourse(deletingCourseId);
      setCourses(courses.filter(c => c.courseId !== deletingCourseId));
      setDeletingCourseId(null);
    } catch (err) {
      setCreateCourseError((err as Error).message || 'Không thể xóa môn học');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const loadCourseForEdit = (courseId: number) => {
    const course = courses.find(c => c.courseId === courseId);
    if (!course) return;

    setNewCourse({
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: String(course.credits || ''),
      courseType: course.courseType || '',
      departmentId: String(course.departmentId || '')
    });
    setEditingCourseId(courseId);
    setShowCreateCourseModal(true);
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
                  onClick={() => setActiveTab('courses')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'courses' ? '#008f81' : 'transparent',
                    color: activeTab === 'courses' ? 'white' : '#666',
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
                  Quản lý Môn học ({courses.length})
                </button>
                <button
                  onClick={() => setActiveTab('plos')}
                  style={{
                    padding: '10px 20px',
                    background: activeTab === 'plos' ? '#008f81' : 'transparent',
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

              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '250px' }}>
                      <Search size={20} style={{ color: '#666' }} />
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo mã môn, tên môn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          flex: 1,
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateCourseModal(true);
                        setEditingCourseId(null);
                        setNewCourse({ courseCode: '', courseName: '', credits: '', courseType: '', departmentId: '' });
                        setCreateCourseError(null);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#008f81',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={18} />
                      Thêm môn học
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Mã môn</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tên môn</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Số tín chỉ</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Loại môn</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.filter(c => 
                          c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.courseName.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                              Không tìm thấy môn học
                            </td>
                          </tr>
                        ) : (
                          courses.filter(c => 
                            c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.courseName.toLowerCase().includes(searchTerm.toLowerCase())
                          ).map((course, index) => (
                            <tr 
                              key={course.courseId}
                              style={{
                                borderBottom: '1px solid #eee',
                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                              }}
                            >
                              <td style={{ padding: '12px', color: '#333' }}>{course.courseCode}</td>
                              <td style={{ padding: '12px', color: '#333' }}>{course.courseName}</td>
                              <td style={{ padding: '12px', color: '#333' }}>{course.credits || 'N/A'}</td>
                              <td style={{ padding: '12px', color: '#333' }}>{course.courseType || 'N/A'}</td>
                              <td style={{ padding: '12px' }}>
                                <button
                                  onClick={() => loadCourseForEdit(course.courseId)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#008f81',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    marginRight: '8px'
                                  }}
                                >
                                  <Edit size={14} />
                                  Sửa
                                </button>
                                <button
                                  onClick={() => setDeletingCourseId(course.courseId)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <Trash2 size={14} />
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {showCreateCourseModal && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1000
                    }}>
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h2 style={{ margin: 0, color: '#333' }}>
                            {editingCourseId ? 'Chỉnh sửa môn học' : 'Thêm môn học'}
                          </h2>
                          <button
                            onClick={() => { setShowCreateCourseModal(false); setEditingCourseId(null); }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '24px',
                              color: '#666'
                            }}
                          >
                            <X size={24} />
                          </button>
                        </div>

                        {createCourseError && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '14px'
                          }}>
                            {createCourseError}
                          </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                            Mã môn học
                          </label>
                          <input
                            type="text"
                            value={newCourse.courseCode}
                            onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                            placeholder="VD: CS101"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                            Tên môn học
                          </label>
                          <input
                            type="text"
                            value={newCourse.courseName}
                            onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                            placeholder="VD: Lập trình Python"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                            Số tín chỉ
                          </label>
                          <input
                            type="number"
                            value={newCourse.credits}
                            onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                            placeholder="VD: 3"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                            Phòng ban
                          </label>
                          <select
                            value={newCourse.departmentId}
                            onChange={(e) => setNewCourse({ ...newCourse, departmentId: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          >
                            <option value="">Chọn phòng ban</option>
                            {departments.map(dept => (
                              <option key={dept.departmentId} value={dept.departmentId}>
                                {dept.deptName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                            Loại môn
                          </label>
                          <select
                            value={newCourse.courseType}
                            onChange={(e) => setNewCourse({ ...newCourse, courseType: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          >
                            <option value="">Chọn loại môn</option>
                            <option value="BAT_BUOC">BAT_BUOC</option>
                            <option value="TU_CHON">TU_CHON</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setShowCreateCourseModal(false); setEditingCourseId(null); }}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            onClick={editingCourseId ? handleEditCourse : handleCreateCourse}
                            disabled={submittingCourse}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: submittingCourse ? '#ccc' : '#008f81',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: submittingCourse ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {submittingCourse && <Loader size={16} className="spinner" />}
                            {editingCourseId ? 'Cập nhật' : 'Thêm mới'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {deletingCourseId !== null && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1001
                    }}>
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                      }}>
                        <AlertTriangle size={48} style={{ color: '#f44336', marginBottom: '16px' }} />
                        <h2 style={{ margin: '0 0 12px 0', color: '#333' }}>Xóa môn học</h2>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                          Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                          <button
                            onClick={() => setDeletingCourseId(null)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleDeleteCourse}
                            disabled={submittingCourse}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: submittingCourse ? '#ccc' : '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: submittingCourse ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {submittingCourse && <Loader size={16} className="spinner" />}
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#008f81', fontSize: '20px', fontWeight: 600 }}>Quản lý PLO Standards</h3>
                      <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>Định nghĩa các tiêu chuẩn kết quả học tập cấp chương trình (Program Learning Outcomes)</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Tìm kiếm PLO..."
                        value={ploSearchTerm}
                        onChange={(e) => setPloSearchTerm(e.target.value)}
                        style={{
                          padding: '10px 16px', border: '1px solid #ddd', borderRadius: '8px',
                          fontSize: '14px', width: '250px', outline: 'none'
                        }}
                      />
                      <button 
                        onClick={() => {
                          setNewPLO({ ploCode: '', ploDescription: '', programId: '' });
                          setEditingPLOId(null);
                          setCreatePLOError(null);
                          setShowCreatePLOModal(true);
                        }}
                        style={{
                          padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none',
                          borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                        <Plus size={18} />
                        Thêm PLO
                      </button>
                    </div>
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
                          <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plos
                          .filter(plo => {
                            const searchLower = ploSearchTerm.toLowerCase();
                            return plo.code.toLowerCase().includes(searchLower) ||
                                   plo.description.toLowerCase().includes(searchLower) ||
                                   plo.programCode.toLowerCase().includes(searchLower);
                          })
                          .map((plo, index) => (
                          <tr key={plo.ploId} style={{
                            borderBottom: '1px solid #e0e0e0',
                            background: index % 2 === 0 ? '#fafafa' : 'white'
                          }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#008f81' }}>{plo.code}</td>
                            <td style={{ padding: '16px', color: '#333' }}>{plo.description}</td>
                            <td style={{ padding: '16px', color: '#666' }}>{plo.programCode}</td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button 
                                  type="button"
                                  onClick={() => loadPLOForEdit(plo.ploId)}
                                  style={{
                                    padding: '8px 12px', background: '#008f81', color: 'white', border: 'none',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                  }}>
                                  <Edit size={14} />
                                  Sửa
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setDeletingPLOId(plo.ploId)}
                                  style={{
                                    padding: '8px 12px', background: '#f44336', color: 'white', border: 'none',
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                  }}>
                                  <Trash2 size={14} />
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {plos
                    .filter(plo => {
                      const searchLower = ploSearchTerm.toLowerCase();
                      return plo.code.toLowerCase().includes(searchLower) ||
                             plo.description.toLowerCase().includes(searchLower) ||
                             plo.programCode.toLowerCase().includes(searchLower);
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
                      <Award size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3>{ploSearchTerm ? 'Không tìm thấy PLO' : 'Chưa có PLO nào'}</h3>
                      <p>{ploSearchTerm ? 'Hãy thử với từ khóa khác' : 'Thêm PLO đầu tiên để bắt đầu'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Create/Edit PLO Modal */}
              {showCreatePLOModal && (
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
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
                        {editingPLOId ? 'Chỉnh sửa PLO' : 'Thêm PLO mới'}
                      </h2>
                      <button 
                        onClick={() => { 
                          setShowCreatePLOModal(false); 
                          setEditingPLOId(null);
                          setNewPLO({ ploCode: '', ploDescription: '', programId: '' });
                          setCreatePLOError(null);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <X size={24} color="#999" />
                      </button>
                    </div>

                    {createPLOError && (
                      <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px'
                      }}>
                        <AlertTriangle size={18} />
                        {createPLOError}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 600, fontSize: '14px' }}>
                          Mã PLO <span style={{ color: '#f44336' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., PLO1, PLO2"
                          value={newPLO.ploCode}
                          onChange={(e) => setNewPLO({ ...newPLO, ploCode: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 600, fontSize: '14px' }}>
                          Mô tả <span style={{ color: '#f44336' }}>*</span>
                        </label>
                        <textarea
                          placeholder="Nhập mô tả chi tiết về tiêu chuẩn học tập này..."
                          value={newPLO.ploDescription}
                          onChange={(e) => setNewPLO({ ...newPLO, ploDescription: e.target.value })}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 600, fontSize: '14px' }}>
                          Chương trình <span style={{ color: '#f44336' }}>*</span>
                        </label>
                        <select
                          value={newPLO.programId}
                          onChange={(e) => setNewPLO({ ...newPLO, programId: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="">Chọn chương trình</option>
                          {programs.map(prog => (
                            <option key={prog.programId} value={prog.programId}>
                              {prog.code} - {prog.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setShowCreatePLOModal(false); setEditingPLOId(null); }}
                        style={{
                          padding: '10px 20px',
                          background: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => editingPLOId ? handleEditPLO() : handleCreatePLO()}
                        disabled={submittingPLO}
                        style={{
                          padding: '10px 20px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: submittingPLO ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: submittingPLO ? 0.6 : 1
                        }}
                      >
                        {submittingPLO ? (
                          <>
                            <Loader size={16} className="spinner" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            {editingPLOId ? 'Cập nhật' : 'Thêm mới'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deletingPLOId && (
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
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                  }}>
                    <AlertTriangle size={48} color="#f44336" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Xóa PLO?</h2>
                    <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
                      Bạn chắc chắn muốn xóa PLO này không? Hành động này không thể hoàn tác.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setDeletingPLOId(null)}
                        style={{
                          padding: '10px 20px',
                          background: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleDeletePLO}
                        disabled={submittingPLO}
                        style={{
                          padding: '10px 20px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: submittingPLO ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: submittingPLO ? 0.6 : 1
                        }}
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  </div>
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
                                    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                  }}
                                >
                                  <GitBranch size={14} />
                                  Quản lý quan hệ
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
          loadCourseRelations(); // Refresh data when modal closes
        }}
      />
    </div>
  );
};

export default ProgramManagementPage;