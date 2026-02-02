import React, { useEffect, useState } from 'react';
import './NotificationMenu.css';
import { Bell, CheckCircle, AlertCircle, MessageSquare, Check } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(0, 100);
      console.log('All notifications:', data);
      if (data.content) {
        setNotifications(Array.isArray(data.content) ? data.content : []);
      } else {
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Lỗi lấy thông báo:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      // Update notification in local state
      setNotifications(notifications.map(n => 
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update all notifications to read
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', error);
    }
  };

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);
  const displayedNotifications = activeTab === 'unread' ? unreadNotifications : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SYLLABUS_SUBMITTED':
      case 'DEADLINE_REMINDER':
        return <AlertCircle className="noti-icon urgent" size={20} />;
      case 'SYLLABUS_APPROVED_BY_HOD':
      case 'SYLLABUS_APPROVED_BY_AA':
      case 'SYLLABUS_PUBLISHED':
        return <CheckCircle className="noti-icon success" size={20} />;
      case 'COMMENT_ADDED':
      case 'SYLLABUS_REJECTED_BY_HOD':
      case 'SYLLABUS_REJECTED_BY_AA':
      case 'SYLLABUS_REJECTED_BY_PRINCIPAL':
        return <MessageSquare className="noti-icon comment" size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <>
      <div className="noti-overlay" onClick={onClose} />
      <div className="noti-menu-container">
        <div className="noti-header">
          <div className="noti-header-title">
            <h3>Thông báo</h3>
            <div className="noti-tabs">
              <button 
                className={`noti-tab ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Chưa đọc ({unreadNotifications.length})
              </button>
              <button 
                className={`noti-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả ({notifications.length})
              </button>
            </div>
          </div>
          {unreadNotifications.length > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllAsRead} title="Đánh dấu tất cả là đã đọc">
              <Check size={16} />
              Đánh dấu tất cả
            </button>
          )}
        </div>
        
        <div className="noti-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Đang tải thông báo...</p>
            </div>
          ) : displayedNotifications.length > 0 ? (
            <>
              {/* Unread section when viewing all */}
              {activeTab === 'all' && unreadNotifications.length > 0 && (
                <div className="noti-section">
                  <div className="noti-section-title">Chưa đọc</div>
                  {unreadNotifications.map((item) => (
                    <div key={item.notificationId} className={`noti-item ${item.isRead ? 'read' : 'unread'}`}>
                      <div className="noti-item-icon">
                        {getIcon(item.type)}
                      </div>
                      <div className="noti-item-content">
                        <div className="noti-item-title">
                          {item.title}
                          {!item.isRead && <span className="unread-dot" />}
                        </div>
                        <p className="noti-item-desc">{item.message}</p>
                        <span className="noti-item-time">{formatTime(item.createdAt)}</span>
                      </div>
                      <button
                        className="noti-close-btn"
                        onClick={() => handleMarkAsRead(item.notificationId)}
                        title="Đánh dấu đã đọc"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Main notifications */}
              {(activeTab === 'unread' ? unreadNotifications : displayedNotifications).map((item) => (
                <div key={item.notificationId} className={`noti-item ${item.isRead ? 'read' : 'unread'}`}>
                  <div className="noti-item-icon">
                    {getIcon(item.type)}
                  </div>
                  <div className="noti-item-content">
                    <div className="noti-item-title">
                      {item.title}
                      {!item.isRead && <span className="unread-dot" />}
                    </div>
                    <p className="noti-item-desc">{item.message}</p>
                    <span className="noti-item-time">{formatTime(item.createdAt)}</span>
                  </div>
                  {!item.isRead && (
                    <button
                      className="noti-close-btn"
                      onClick={() => handleMarkAsRead(item.notificationId)}
                      title="Đánh dấu đã đọc"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* Read section when viewing all */}
              {activeTab === 'all' && readNotifications.length > 0 && (
                <div className="noti-section">
                  <div className="noti-section-title">Đã đọc</div>
                  {readNotifications.map((item) => (
                    <div key={item.notificationId} className="noti-item read">
                      <div className="noti-item-icon">
                        {getIcon(item.type)}
                      </div>
                      <div className="noti-item-content">
                        <div className="noti-item-title">
                          {item.title}
                        </div>
                        <p className="noti-item-desc">{item.message}</p>
                        <span className="noti-item-time">{formatTime(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ color: '#999' }}>
                {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationMenu;