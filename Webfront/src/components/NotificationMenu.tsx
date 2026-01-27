import React, { useEffect, useState } from 'react';
import './NotificationMenu.css';
import { Bell, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUnreadNotifications();
      console.log('Unread notifications:', data);
      setNotifications(Array.isArray(data) ? data : []);
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
      setNotifications(notifications.filter(n => n.notificationId !== id));
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', error);
    }
  };

  if (!isOpen) return null;

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

  const getTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'SYLLABUS_SUBMITTED': 'Giáo trình được gửi',
      'SYLLABUS_APPROVED_BY_HOD': 'Giáo trình được duyệt bởi trưởng khoa',
      'SYLLABUS_REJECTED_BY_HOD': 'Giáo trình bị từ chối bởi trưởng khoa',
      'SYLLABUS_APPROVED_BY_AA': 'Giáo trình được duyệt bởi phòng QLĐT',
      'SYLLABUS_REJECTED_BY_AA': 'Giáo trình bị từ chối bởi phòng QLĐT',
      'SYLLABUS_PUBLISHED': 'Giáo trình được công bố',
      'PDF_UPLOADED': 'PDF được tải lên',
      'PDF_DELETED': 'PDF được xóa',
      'COMMENT_ADDED': 'Có bình luận mới',
      'DEADLINE_REMINDER': 'Nhắc nhở hạn chót',
      'SYLLABUS_REJECTED_BY_PRINCIPAL': 'Giáo trình bị từ chối bởi hiệu trưởng'
    };
    return typeMap[type] || type;
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
          <h3>Thông báo ({notifications.length})</h3>
          {notifications.length > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>
        
        <div className="noti-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Đang tải thông báo...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div key={item.notificationId} className="noti-item unread">
                <div className="noti-item-icon">
                  {getIcon(item.type)}
                </div>
                <div className="noti-item-content">
                  <div className="noti-item-title">
                    {item.title}
                    <span className="unread-dot" />
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
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ color: '#999' }}>Không có thông báo nào</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationMenu;