import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Hệ thống quản lý giáo trình
        </Link>
        <div className="navbar-menu">
          <Link
            to="/"
            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Trang chủ
          </Link>
          <Link
            to="/search"
            className={`navbar-item ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Tìm kiếm
          </Link>
          <Link
            to="/profile"
            className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Hồ sơ
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
