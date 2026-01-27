import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle, Settings, Search, Bell, User, 
  Plus, Edit, Trash2, Award, BookOpen, GitBranch
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AAPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Program {
  id: string;
  code: string;
  name: string;
  totalPLOs: number;
  totalCourses: number;
  lastUpdated: string;
}

interface PLO {
  id: string;
  code: string;
  description: string;
  programCode: string;
  category: string;
}

const ProgramManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'programs' | 'plos' | 'prerequisites'>('programs');
  const [programs, setPrograms] = useState<Program[]>([
    { id: '1', code: 'CS', name: 'Computer Science', totalPLOs: 12, totalCourses: 45, lastUpdated: '2024-01-20' },
    { id: '2', code: 'SE', name: 'Software Engineering', totalPLOs: 10, totalCourses: 38, lastUpdated: '2024-01-18' },
    { id: '3', code: 'MATH', name: 'Mathematics', totalPLOs: 8, totalCourses: 32, lastUpdated: '2024-01-15' },
  ]);

  const [plos, setPlos] = useState<PLO[]>([
    { id: '1', code: 'PLO1', description: 'Apply knowledge of computing and mathematics', programCode: 'CS', category: 'Knowledge' },
    { id: '2', code: 'PLO2', description: 'Analyze complex computing problems', programCode: 'CS', category: 'Problem Analysis' },
    { id: '3', code: 'PLO3', description: 'Design solutions to complex problems', programCode: 'CS', category: 'Design' },
    { id: '4', code: 'PLO4', description: 'Conduct investigations', programCode: 'CS', category: 'Investigation' },
    { id: '5', code: 'PLO5', description: 'Function effectively on teams', programCode: 'CS', category: 'Teamwork' },
  ]);

  const notificationCount = 5;

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
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

      {/* Main Content */}
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
          {/* Tabs */}
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
              Chương trình
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
              PLO Standards
            </button>
            <button
              onClick={() => setActiveTab('prerequisites')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'prerequisites' ? '#2196f3' : 'transparent',
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
              Prerequisites
            </button>
          </div>

          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
                  <div key={program.id} className="program-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{program.code}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{program.name}</p>
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
                    <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999' }}>
                      Cập nhật: {program.lastUpdated}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLOs Tab */}
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
                      <tr key={plo.id} style={{
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
            </div>
          )}

          {/* Prerequisites Tab */}
          {activeTab === 'prerequisites' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Module Relationships & Prerequisites</h3>
                <button style={{
                  padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Plus size={18} />
                  Thêm quy tắc
                </button>
              </div>

              <div style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center', color: '#999'
              }}>
                <GitBranch size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <h3>Module Relationships Management</h3>
                <p>Quản lý điều kiện tiên quyết (Prerequisites) và đồng cùng học (Corequisites)</p>
                <p style={{ fontSize: '13px' }}>Tính năng đang được phát triển...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramManagementPage;
