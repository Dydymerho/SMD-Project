import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Home, Search } from 'lucide-react';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: 'home' | 'search';
  onTabChange?: (tab: 'home' | 'search') => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab = 'home',
  onTabChange 
}) => {
  const { logout } = useAuth();

  const handleTabChange = (tab: 'home' | 'search') => {
    onTabChange?.(tab);
  };

  return (
    <div className="dashboard-layout-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">📚</div>
          <h2>SMD System</h2>
          <p>Hệ thống quản lý & tra cứu</p>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => handleTabChange('home')}
          >
            <span className="icon"><Home size={20} /></span>
            <span>Trang chủ</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} 
            onClick={() => handleTabChange('search')}
          >
            <span className="icon"><Search size={20} /></span>
            <span>Tra cứu giáo trình</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <ChevronLeft size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
