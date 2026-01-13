import React from 'react';
import './NotificationMenu.css';
import { Bell, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'urgent' | 'success' | 'comment';
  isRead: boolean;
}

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Dữ liệu giả lập dựa trên ảnh mẫu
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Hoạt động sắp đến hạn',
      description: 'Giáo trình "Cấu trúc dữ liệu và giải thuật" cần được hoàn thành trước ngày 25/12/2025',
      time: '2 giờ trước',
      type: 'urgent',
      isRead: false,
    },
    {
      id: '2',
      title: 'Giáo trình của bạn đã được duyệt',
      description: 'Giáo trình "Cấu trúc dữ liệu và giải thuật" của bạn đã được duyệt',
      time: '2 giờ trước',
      type: 'success',
      isRead: true,
    },
    {
      id: '3',
      title: 'Bạn có nhận xét mới',
      description: 'Giáo trình "Cấu trúc dữ liệu và giải thuật" đã được trưởng khoa nhận xét',
      time: '2 giờ trước',
      type: 'comment',
      isRead: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="noti-icon urgent" size={20} />;
      case 'success': return <CheckCircle className="noti-icon success" size={20} />;
      case 'comment': return <MessageSquare className="noti-icon comment" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <>
      <div className="noti-overlay" onClick={onClose} />
      <div className="noti-menu-container">
        <div className="noti-header">
          <h3>Thông báo</h3>
          <button className="mark-read-btn">Đánh dấu tất cả là đã đọc</button>
        </div>
        
        <div className="noti-list">
          {notifications.map((item) => (
            <div key={item.id} className={`noti-item ${!item.isRead ? 'unread' : ''}`}>
              <div className="noti-item-icon">
                {getIcon(item.type)}
              </div>
              <div className="noti-item-content">
                <div className="noti-item-title">
                  {item.title}
                  {!item.isRead && <span className="unread-dot" />}
                </div>
                <p className="noti-item-desc">{item.description}</p>
                <span className="noti-item-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationMenu;