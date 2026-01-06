import React from 'react';
import './StudentDashboard.css';
import { Search, Bell, User, ChevronLeft } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const courses = Array(4).fill({
    code: 'CS301',
    title: 'Kỹ thuật lập trình',
    department: 'Công nghệ thông tin và điện tử',
    dean: 'TS. Nguyễn Văn A',
    semester: 'HK I 2024 - 2025',
    credits: 4,
    description: 'Môn học tập trung vào các kỹ năng quản lý tài nguyên hệ thống, tổ chức mã nguồn chuyên nghiệp và rèn luyện logic giải thuật chuyên sâu.'
  });

  return (
    <div className="smd-container">
      {/* Sidebar */}
      <aside className="smd-sidebar">
        <div className="sidebar-top">
          <div className="logo-placeholder"></div>
          <div className="smd-brand">
            <h2>SMD System</h2>
            <span>Hệ thống quản lý & tra cứu Giáo trình</span>
          </div>
        </div>
        
        <nav className="smd-nav">
          <div className="nav-item active">
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

      {/* Main Content */}
      <main className="smd-main">
        <header className="smd-header">
          <div className="header-right">
            <div className="notification-badge">
              <Bell size={22} />
              <span className="badge-count">2</span>
            </div>
            <div className="user-profile">
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
          <div className="content-title">
            <h1>Tra cứu giáo trình</h1>
            <p>Tìm kiếm và xem giáo trình các môn học</p>
          </div>

          <div className="search-filter-bar">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo môn hoặc mã môn học..." 
              />
            </div>
            <div className="filter-select">
              <select>
                <option>Tất cả khoa</option>
              </select>
            </div>
          </div>

          <div className="course-grid">
            {courses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-card-header">
                  <span>{course.code}</span>
                  <h3>{course.title}</h3>
                </div>
                <div className="course-card-body">
                  <p><strong>Viện:</strong> {course.department}</p>
                  <p><strong>Viện trưởng:</strong> {course.dean}</p>
                  <p><strong>Học kỳ:</strong> {course.semester}</p>
                  <p><strong>Tín chỉ:</strong> {course.credits} Tín chỉ</p>
                  
                  <div className="course-intro">
                    <h5>Giới thiệu học phần</h5>
                    <p>{course.description}</p>
                  </div>
                </div>
                <button className="view-detail-btn">Xem chi tiết</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;