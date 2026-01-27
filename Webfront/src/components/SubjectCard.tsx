import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import './SubjectCard.css';

interface SubjectCardProps {
  id: number;
  courseCode: string;
  courseName: string;
  lecturer?: string;
  department?: string;
  credits?: number;
  academicYear?: string;
  status?: string;
  onViewDetail?: () => void;
  onFollow?: () => void;
  onReport?: () => void;
  isFollowed?: boolean;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  courseCode,
  courseName,
  lecturer,
  department,
  credits,
  academicYear,
  status,
  onViewDetail,
  onFollow,
  onReport,
  isFollowed = false,
}) => {
  return (
    <div className="course-card">
      <div className="course-card-header">
        <div className="course-code-name">
          <span className="course-code">{courseCode}</span>
          {credits && <span className="course-credits">{credits} TC</span>}
        </div>
        <h3 className="course-title">{courseName}</h3>
      </div>
      
      <div className="course-card-body">
        {lecturer && <p><strong>Giảng viên:</strong> {lecturer}</p>}
        {department && <p><strong>Bộ môn:</strong> {department}</p>}
        {academicYear && <p><strong>Năm học:</strong> {academicYear}</p>}
        {status && <p><strong>Trạng thái:</strong> <span className={`status-badge status-${status?.toLowerCase()}`}>{status}</span></p>}
      </div>

      <div className="course-card-actions">
        {onViewDetail && (
          <button 
            className="view-detail-btn"
            onClick={onViewDetail}
          >
            Xem giáo trình
          </button>
        )}
        {onFollow && (
          <button 
            className={`action-btn subscribe-btn ${isFollowed ? 'active' : ''}`}
            onClick={onFollow}
            title="Follow để nhận thông báo"
          >
            <Heart size={16} fill={isFollowed ? 'currentColor' : 'none'} />
          </button>
        )}
        {onReport && (
          <button 
            className="action-btn feedback-btn"
            onClick={onReport}
            title="Gửi báo cáo lỗi"
          >
            <MessageSquare size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
