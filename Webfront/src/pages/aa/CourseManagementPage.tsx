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

interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits?: number;
  departmentName?: string;
}

interface CourseRelation {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits?: number;
  relations: api.CourseRelationResponse[];
}

const CourseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'prerequisites'>('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseRelations, setCourseRelations] = useState<CourseRelation[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedRelationType, setSelectedRelationType] = useState<'ALL' | 'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedCourseForPrereq, setSelectedCourseForPrereq] = useState<Course | null>(null);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '', credits: '' });
  const [submittingCourse, setSubmittingCourse] = useState(false);
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
      const [coursesData, unreadCount] = await Promise.all([
        api.getCourses(),
        api.getUnreadNotificationsCount()
      ]);

      const normalizedCourses = (coursesData as any[]).map((c: any) => ({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits: c.credits,
        departmentName: c.department?.deptName || 'Chưa rõ'
      }));

      setCourses(normalizedCourses);
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Error loading course data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.courseCode.trim() || !newCourse.courseName.trim() || !newCourse.credits) {
      setCreateCourseError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingCourse(true);
    setCreateCourseError(null);

    try {
      const createdCourse = await api.createCourse({
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        credits: parseInt(newCourse.credits)
      });

      setCourses([...courses, {
        courseId: createdCourse.courseId,
        courseCode: createdCourse.courseCode,
        courseName: createdCourse.courseName,
        credits: createdCourse.credits,
        departmentName: createdCourse.departmentName || 'Chưa rõ'
      }]);

      setShowCreateCourseModal(false);
      setNewCourse({ courseCode: '', courseName: '', credits: '' });
    } catch (err) {
      setCreateCourseError((err as Error).message || 'Không thể tạo môn học');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourseId || !newCourse.courseCode.trim() || !newCourse.courseName.trim() || !newCourse.credits) {
      setCreateCourseError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmittingCourse(true);
    setCreateCourseError(null);

    try {
      await api.updateCourse(editingCourseId, {
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        credits: parseInt(newCourse.credits)
      });

      setCourses(courses.map(c => 
        c.courseId === editingCourseId 
          ? {
              ...c,
              courseCode: newCourse.courseCode,
              courseName: newCourse.courseName,
              credits: parseInt(newCourse.credits)
            }
          : c
      ));

      setShowCreateCourseModal(false);
      setEditingCourseId(null);
      setNewCourse({ courseCode: '', courseName: '', credits: '' });
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
      credits: String(course.credits || '')
    });
    setEditingCourseId(courseId);
    setShowCreateCourseModal(true);
  };

  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

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
          <a href="#" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/aa/course-management'); }}>
            <span className="icon"><BookOpen size={20} /></span>
            Quản lý Môn học
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
            <h1>Quản lý Môn học</h1>
            <p>Cấu hình và quản lý các môn học trong hệ thống</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer' }}>
                <Bell size={24} />
                {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
              </div>
              {isNotificationOpen && <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
            </div>
            <div className="user-profile">
              <User size={24} />
            </div>
          </div>
        </header>

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
            style={{
              borderBottom: activeTab === 'courses' ? '3px solid #008f81' : 'none',
              color: activeTab === 'courses' ? '#008f81' : '#666'
            }}
          >
            <BookOpen size={18} />
            Quản lý Môn học
          </button>
          <button 
            className={`tab-btn ${activeTab === 'prerequisites' ? 'active' : ''}`}
            onClick={() => setActiveTab('prerequisites')}
            style={{
              borderBottom: activeTab === 'prerequisites' ? '3px solid #008f81' : 'none',
              color: activeTab === 'prerequisites' ? '#008f81' : '#666'
            }}
          >
            <GitBranch size={18} />
            Quản lý Tiên quyết
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'courses' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828' }}>
                  {error}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <Search size={20} style={{ color: '#666' }} />
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo mã môn, tên môn..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
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
                        setNewCourse({ courseCode: '', courseName: '', credits: '' });
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
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                              Không tìm thấy môn học
                            </td>
                          </tr>
                        ) : (
                          filteredCourses.map((course, index) => (
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
                </>
              )}

              {/* Create/Edit Course Modal */}
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

                    <div style={{ marginBottom: '24px' }}>
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
                        {submittingCourse && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                        {editingCourseId ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
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
                        {submittingCourse && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'prerequisites' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                      Loại quan hệ:
                    </label>
                    <select
                      value={selectedRelationType}
                      onChange={(e) => setSelectedRelationType(e.target.value as any)}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="ALL">Tất cả</option>
                      <option value="PREREQUISITE">Tiên quyết</option>
                      <option value="COREQUISITE">Học cùng</option>
                      <option value="EQUIVALENT">Tương đương</option>
                    </select>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Môn học</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tiên quyết</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseRelations.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                              Chưa có quan hệ giữa các môn
                            </td>
                          </tr>
                        ) : (
                          courseRelations.map((relation, index) => (
                            <tr 
                              key={relation.courseId}
                              style={{
                                borderBottom: '1px solid #eee',
                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                              }}
                            >
                              <td style={{ padding: '12px', color: '#333' }}>
                                {relation.courseCode} - {relation.courseName}
                              </td>
                              <td style={{ padding: '12px', color: '#666' }}>
                                {relation.relations.length > 0 ? (
                                  <span>{relation.relations.map(r => r.targetCourseCode).join(', ')}</span>
                                ) : (
                                  <span style={{ color: '#999' }}>Không có</span>
                                )}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <button
                                  onClick={() => {
                                    setSelectedCourseForPrereq(relation);
                                    setShowPrerequisiteModal(true);
                                  }}
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
                                    fontSize: '12px'
                                  }}
                                >
                                  <GitBranch size={14} />
                                  Quản lý
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
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

export default CourseManagementPage;
