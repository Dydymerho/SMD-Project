import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronLeft, Loader2, Home, BookOpen, Star } from 'lucide-react';
import { searchSubjects } from '../../services/api';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  department?: string;
  dean?: string;
  semester?: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

// dữ liệu giả
  const recommendedCourses: Subject[] = [
    { id: '1', name: 'Kỹ thuật lập trình', code: 'CS301', credits: 4, description: 'Quản lý tài nguyên hệ thống và logic giải thuật chuyên sâu.', department: 'CNTT' },
    { id: '2', name: 'Cấu trúc dữ liệu', code: 'CS302', credits: 3, description: 'Các cấu trúc lưu trữ và tối ưu hóa tìm kiếm dữ liệu.', department: 'CNTT' },
  ];

  const goToProfile = () => {
    navigate('../profile');
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchSubjects(searchQuery);
      setCourses(data);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm môn học:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === '' && searched) {
      setSearched(false);
      setCourses([]);
    }
  }, [searchQuery, searched]);

  return (
    <div className="smd-container">
      <aside className="smd-sidebar">
        <div className="sidebar-top">
          <div className="logo-placeholder"></div>
          <div className="smd-brand">
            <h2>SMD System</h2>
            <span>Hệ thống quản lý & tra cứu</span>
          </div>
        </div>
        
        <nav className="smd-nav">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>Trang chủ</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} 
            onClick={() => setActiveTab('search')}
          >
            <Search size={20} />
            <span>Tra cứu giáo trình</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="collapse-btn">
            <ChevronLeft size={16} />
            <span>Thu gọn</span>
          </button>
        </div>
      </aside>

      <main className="smd-main">
        <header className="smd-header">
          <div className="header-right">
            <div className="notification-badge">
              <Bell size={22} />
              <span className="badge-count">2</span>
            </div>
            <div className="user-profile" onClick={goToProfile} style={{ cursor: 'pointer' }}>
              <div className="user-info">
                <p className="user-name">Nguyễn Văn B</p>
                <p className="user-role">Sinh viên</p>
              </div>
              <div className="user-avatar">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <section className="smd-content">
          {activeTab === 'home' ? (
            <div className="home-content">
              <div className="content-title">
                <h1>Chào mừng trở lại, Văn B! 👋</h1>
                <p>Khám phá các giáo trình được đề xuất dành riêng cho bạn</p>
              </div>

              <div className="recommendation-section">
                <div className="section-header">
                  <Star size={20} color="#f1c40f" fill="#f1c40f" />
                  <h2>Giáo trình được đề xuất</h2>
                </div>
                <div className="course-grid">
                  {recommendedCourses.map((course) => (
                    <div key={course.id} className="course-card">
                      <div className="course-card-header">
                        <span>{course.code}</span>
                        <h3>{course.name}</h3>
                      </div>
                      <div className="course-card-body">
                        <p><strong>Số tín chỉ:</strong> {course.credits} Tín chỉ</p>
                        <p className="line-clamp">{course.description}</p>
                      </div>
                      <button className="view-detail-btn">Xem ngay</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-stats">
              </div>
            </div>
          ) : (
            <div className="search-content">
              <div className="content-title">
                <h1>Tra cứu giáo trình</h1>
                <p>Tìm kiếm và xem giáo trình các môn học</p>
              </div>

              <form className="search-filter-bar" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <Search size={20} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc mã môn học..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-select">
                  <select>
                    <option>Tất cả khoa</option>
                    <option>CNTT & Điện tử</option>
                    <option>Kinh tế</option>
                  </select>
                </div>
                <button type="submit" className="search-submit-btn" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Tìm kiếm'}
                </button>
              </form>

              <div className="results-status">
                {loading && <p className="status-text">Đang tải dữ liệu môn học...</p>}
                {!loading && searched && courses.length === 0 && (
                  <p className="status-text">Không tìm thấy môn học nào phù hợp với "{searchQuery}"</p>
                )}
                {!searched && !loading && (
                  <p className="status-text">Nhập tên môn học để bắt đầu tra cứu</p>
                )}
              </div>

              <div className="course-grid">
                {courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-header">
                      <span>{course.code}</span>
                      <h3>{course.name}</h3>
                    </div>
                    <div className="course-card-body">
                      <p><strong>Viện:</strong> {course.department || 'Đang cập nhật'}</p>
                      <p><strong>Số tín chỉ:</strong> {course.credits} Tín chỉ</p>
                      <div className="course-intro">
                        <h5>Giới thiệu học phần</h5>
                        <p className="line-clamp">{course.description}</p>
                      </div>
                    </div>
                    <button className="view-detail-btn">Xem chi tiết</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;