import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Home, Users, Search, Bell, User, FileText,
  MessageSquare, Send, CheckCircle, Clock, UserCheck, AlertCircle,
  Edit, Trash2, MoreVertical, Download, Eye, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HoDPages.css';
import '../dashboard/DashboardPage.css';
import NotificationMenu from '../../components/NotificationMenu';

interface Participant {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  hasReviewed: boolean;
  reviewDate?: string;
}

interface Comment {
  id: string;
  author: {
    name: string;
    role: string;
  };
  content: string;
  timestamp: string;
  isHoD: boolean;
}

interface CollaborativeReviewDetail {
  id: string;
  syllabusTitle: string;
  courseCode: string;
  lecturer: string;
  status: 'active' | 'pending' | 'completed' | 'finalized';
  createdDate: string;
  deadline: string;
  description: string;
  participants: Participant[];
  comments: Comment[];
  reviewedCount: number;
  totalParticipants: number;
  isFinalized: boolean;
  finalizedDate?: string;
  finalizedBy?: string;
  compiledSummary?: string;
}

const CollaborativeReviewDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [review, setReview] = useState<CollaborativeReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [compiledSummary, setCompiledSummary] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [availableLecturers, setAvailableLecturers] = useState<Array<{ id: string; name: string; email: string; department: string }>>([]);
  const notificationCount = 0;

  useEffect(() => {
    loadReviewDetail();
    loadAvailableLecturers();
  }, [id]);

  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      // TODO: Call API to fetch review detail
      // const data = await getCollaborativeReviewDetail(id);
      // Mock data
      setReview({
        id: id || '1',
        syllabusTitle: 'Lập trình cơ bản',
        courseCode: 'CS101',
        lecturer: 'Nguyễn Văn A',
        status: 'active',
        createdDate: '2024-01-15',
        deadline: '2024-01-30',
        description: 'Xin mời các thầy cô góp ý về nội dung giáo trình Lập trình cơ bản. Đặc biệt chú ý phần CLOs và phân bổ thời gian.',
        participants: [
          {
            id: '1',
            name: 'Trần Thị B',
            email: 'tranthib@university.edu.vn',
            department: 'Khoa CNTT',
            role: 'Giảng viên',
            hasReviewed: true,
            reviewDate: '2024-01-18'
          },
          {
            id: '2',
            name: 'Lê Văn C',
            email: 'levanc@university.edu.vn',
            department: 'Khoa CNTT',
            role: 'Giảng viên',
            hasReviewed: false
          },
          {
            id: '3',
            name: 'Phạm Thị D',
            email: 'phamthid@university.edu.vn',
            department: 'Khoa CNTT',
            role: 'Giảng viên',
            hasReviewed: true,
            reviewDate: '2024-01-20'
          }
        ],
        comments: [
          {
            id: '1',
            author: { name: 'Trần Thị B', role: 'Giảng viên' },
            content: 'Tôi cho rằng phần Module 2 nên bổ sung thêm về Con trỏ và Quản lý bộ nhớ. Đây là kiến thức quan trọng cho sinh viên.',
            timestamp: '2024-01-18 10:30',
            isHoD: false
          },
          {
            id: '2',
            author: { name: user?.name || 'Trưởng khoa', role: 'Trưởng khoa' },
            content: 'Cảm ơn góp ý của cô Trần Thị B. Thầy Nguyễn Văn A vui lòng xem xét bổ sung nội dung này.',
            timestamp: '2024-01-18 14:00',
            isHoD: true
          },
          {
            id: '3',
            author: { name: 'Phạm Thị D', role: 'Giảng viên' },
            content: 'Tỷ lệ phân bổ điểm đánh giá có vẻ hợp lý. Tuy nhiên nên tăng tỷ lệ bài tập thực hành lên 30% để khuyến khích sinh viên luyện tập nhiều hơn.',
            timestamp: '2024-01-20 09:15',
            isHoD: false
          }
        ],
        reviewedCount: 2,
        totalParticipants: 3,
        isFinalized: false
      });
    } catch (error) {
      console.error('Error loading review:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLecturers = async () => {
    try {
      // TODO: Call API to fetch available lecturers
      // const data = await getAvailableLecturers();
      setAvailableLecturers([
        { id: '4', name: 'Hoàng Văn E', email: 'hoangvane@university.edu.vn', department: 'Khoa CNTT' },
        { id: '5', name: 'Vũ Thị F', email: 'vuthif@university.edu.vn', department: 'Khoa CNTT' },
        { id: '6', name: 'Đỗ Văn G', email: 'dovang@university.edu.vn', department: 'Khoa CNTT' }
      ]);
    } catch (error) {
      console.error('Error loading lecturers:', error);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung góp ý');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to post comment
      // await postReviewComment(id, newComment);
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: { name: user?.name || 'Trưởng khoa', role: 'Trưởng khoa' },
        content: newComment,
        timestamp: new Date().toLocaleString('vi-VN'),
        isHoD: true
      };
      
      setReview(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newCommentObj]
      } : null);
      
      setNewComment('');
      alert('✅ Đã đăng góp ý thành công!');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('❌ Có lỗi xảy ra khi đăng góp ý');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedParticipant) {
      alert('Vui lòng chọn giảng viên');
      return;
    }

    try {
      // TODO: Call API to add participant
      // await addReviewParticipant(id, selectedParticipant);
      const lecturer = availableLecturers.find(l => l.id === selectedParticipant);
      if (lecturer && review) {
        const newParticipant: Participant = {
          id: lecturer.id,
          name: lecturer.name,
          email: lecturer.email,
          department: lecturer.department,
          role: 'Giảng viên',
          hasReviewed: false
        };
        
        setReview({
          ...review,
          participants: [...review.participants, newParticipant],
          totalParticipants: review.totalParticipants + 1
        });
        
        setShowAddParticipantModal(false);
        setSelectedParticipant('');
        alert('✅ Đã thêm người tham gia thành công!');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('❌ Có lỗi xảy ra khi thêm người tham gia');
    }
  };

  const handleSendReminder = async (participantId: string) => {
    try {
      // TODO: Call API to send reminder
      // await sendReviewReminder(id, participantId);
      alert('✅ Đã gửi email nhắc nhở thành công!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('❌ Có lỗi xảy ra khi gửi email');
    }
  };

  const handleCompleteReview = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to complete review
      // await completeCollaborativeReview(id);
      alert('✅ Đã kết thúc phiên thảo luận thành công!');
      navigate('/hod/collaborative-review');
    } catch (error) {
      console.error('Error completing review:', error);
      alert('❌ Có lỗi xảy ra khi kết thúc phiên thảo luận');
    } finally {
      setIsSubmitting(false);
      setShowCompleteModal(false);
    }
  };

  const handleFinalizeAndSubmit = async () => {
    if (!compiledSummary.trim()) {
      alert('Vui lòng nhập tóm tắt các góp ý đã tổng hợp');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to finalize review and submit to HoD pipeline
      // await finalizeCollaborativeReview(id, compiledSummary);
      console.log('Finalized with summary:', compiledSummary);
      alert('✅ Đã hoàn tất thảo luận và chuyển giáo trình vào quy trình phê duyệt của Trưởng khoa!');
      navigate('/hod/syllabus-review');
    } catch (error) {
      console.error('Error finalizing review:', error);
      alert('❌ Có lỗi xảy ra khi hoàn tất thảo luận');
    } finally {
      setIsSubmitting(false);
      setShowFinalizeModal(false);
    }
  };

  const generateAutoSummary = () => {
    if (!review) return '';
    
    const summary = `TÓM TẮT PHIÊN THẢO LUẬN HỢP TÁC
Giáo trình: ${review.courseCode} - ${review.syllabusTitle}
Thời gian: ${review.createdDate} đến ${review.deadline}

THỐNG KÊ:
- Tổng số người tham gia: ${review.totalParticipants}
- Đã góp ý: ${review.reviewedCount}/${review.totalParticipants}
- Tổng số góp ý: ${review.comments.length}

CÁC GÓP Ý CHÍNH:
${review.comments
  .filter(c => !c.isHoD)
  .map((c, idx) => `${idx + 1}. ${c.author.name}: ${c.content}`)
  .join('\n\n')}

KẾT LUẬN:
[Trưởng khoa vui lòng bổ sung kết luận và đề xuất]`;

    return summary;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!review) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy phiên thảo luận</div>;
  }

  const progressPercentage = (review.reviewedCount / review.totalParticipants) * 100;
  const isDeadlinePassed = new Date(review.deadline) < new Date();
  const canFinalize = review.reviewedCount > 0 && !review.isFinalized;

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">📋</div>
          <h2>SMD System</h2>
          <p>Trưởng Bộ môn</p>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-review'); }}
          >
            <span className="icon"><CheckCircle size={20} /></span>
            Phê duyệt Giáo trình
          </a>
          <a 
            href="#" 
            className="nav-item active" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/collaborative-review'); }}
          >
            <span className="icon"><Users size={20} /></span>
            Quản lý Thảo luận
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/hod/syllabus-analysis'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tìm kiếm & Phân tích
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Chi tiết Thảo luận</h1>
            <p>Quản lý phiên thảo luận và góp ý từ giảng viên</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div 
                className="notification-icon" 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Bell size={24} />
                {notificationCount > 0 && (
                  <span className="badge">{notificationCount}</span>
                )}
              </div>
              {isNotificationOpen && (
                <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
              )}
            </div>
            {user && (
              <div className="user-info">
                <User size={20} />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="content-section" style={{ padding: '40px' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/hod/collaborative-review')}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={20} />
            Quay lại danh sách
          </button>

          {/* Review Info Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>
                  {review.courseCode} - {review.syllabusTitle}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Giảng viên: {review.lecturer} | Tạo ngày: {review.createdDate}
                </p>
              </div>
              <div style={{
                background: review.isFinalized ? '#e8f5e9' :
                           review.status === 'active' ? '#e3f2fd' :
                           review.status === 'pending' ? '#fff3e0' : '#e8f5e9',
                color: review.isFinalized ? '#2e7d32' :
                       review.status === 'active' ? '#1976d2' :
                       review.status === 'pending' ? '#f57c00' : '#388e3c',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                {review.isFinalized ? '✅ Đã hoàn tất & chuyển phê duyệt' :
                 review.status === 'active' ? '🟢 Đang hoạt động' :
                 review.status === 'pending' ? '🟡 Chờ phản hồi' : '✅ Hoàn thành'}
              </div>
            </div>

            {review.isFinalized && (
              <div style={{
                padding: '16px',
                background: '#e8f5e9',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #4caf50'
              }}>
                <p style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: 600, fontSize: '14px' }}>
                  ✅ Phiên thảo luận đã được hoàn tất
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                  Hoàn tất bởi: {review.finalizedBy || user?.name} | Ngày: {review.finalizedDate}
                </p>
              </div>
            )}

            {isDeadlinePassed && !review.isFinalized && (
              <div style={{
                padding: '16px',
                background: '#fff3e0',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #ff9800'
              }}>
                <p style={{ margin: 0, color: '#e65100', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  Đã quá hạn phản hồi - Vui lòng xem xét hoàn tất thảo luận
                </p>
              </div>
            )}

            <div style={{
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{review.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Hạn phản hồi</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} />
                  {review.deadline}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Tiến độ</p>
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progressPercentage}%`,
                      height: '100%',
                      background: '#4caf50',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <p style={{ margin: '4px 0 0 0', color: '#333', fontSize: '12px', fontWeight: 500 }}>
                    {review.reviewedCount}/{review.totalParticipants} đã phản hồi
                  </p>
                </div>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '12px' }}>Tổng góp ý</p>
                <p style={{ margin: 0, color: '#333', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageSquare size={16} />
                  {review.comments.length} góp ý
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Participants Panel */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  Người tham gia ({review.totalParticipants})
                </h3>
                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  style={{
                    padding: '6px 12px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  + Thêm người
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {review.participants.map((participant) => (
                  <div
                    key={participant.id}
                    style={{
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500, color: '#333', fontSize: '14px' }}>
                        {participant.name}
                      </p>
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                        {participant.email}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {participant.hasReviewed ? (
                        <div style={{
                          background: '#e8f5e9',
                          color: '#2e7d32',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <UserCheck size={12} />
                          Đã góp ý
                        </div>
                      ) : (
                        <>
                          <div style={{
                            background: '#fff3e0',
                            color: '#e65100',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            Chưa góp ý
                          </div>
                          <button
                            onClick={() => handleSendReminder(participant.id)}
                            style={{
                              padding: '4px 8px',
                              background: 'white',
                              border: '1px solid #2196f3',
                              color: '#2196f3',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Gửi email nhắc nhở"
                          >
                            <Mail size={12} />
                            Nhắc
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Panel */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '600px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                Góp ý & Thảo luận
              </h3>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {review.comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      padding: '12px',
                      background: comment.isHoD ? '#e3f2fd' : '#f9f9f9',
                      borderRadius: '8px',
                      borderLeft: comment.isHoD ? '3px solid #2196f3' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#333', fontSize: '13px' }}>
                          {comment.author.name}
                          {comment.isHoD && (
                            <span style={{
                              marginLeft: '8px',
                              background: '#2196f3',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              TRƯỞNG KHOA
                            </span>
                          )}
                        </p>
                        <p style={{ margin: 0, color: '#999', fontSize: '11px' }}>
                          {comment.author.role} • {comment.timestamp}
                        </p>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#333', fontSize: '13px', lineHeight: 1.5 }}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Post Comment */}
              <div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Nhập góp ý của bạn..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={handlePostComment}
                  disabled={isSubmitting || !newComment.trim()}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: (isSubmitting || !newComment.trim()) ? 0.6 : 1
                  }}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Đang gửi...' : 'Đăng góp ý'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginTop: '24px'
          }}>
            <button
              onClick={() => navigate(`/hod/syllabus-review/${review.id}`)}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#2196f3',
                border: '2px solid #2196f3',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Eye size={18} />
              Xem giáo trình
            </button>
            
            {!review.isFinalized && canFinalize && (
              <button
                onClick={() => {
                  setCompiledSummary(generateAutoSummary());
                  setShowFinalizeModal(true);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={18} />
                Hoàn tất & Chuyển phê duyệt
              </button>
            )}
            
            {!review.isFinalized && (
              <button
                onClick={() => setShowCompleteModal(true)}
                style={{
                  padding: '12px 24px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle size={18} />
                Kết thúc thảo luận
              </button>
            )}
          </div>
        </div>

        {/* Add Participant Modal */}
        {showAddParticipantModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowAddParticipantModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>Thêm người tham gia</h2>
              <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                Chọn giảng viên để tham gia thảo luận
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                  Chọn giảng viên
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {availableLecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} ({lecturer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddParticipantModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddParticipant}
                  disabled={!selectedParticipant}
                  style={{
                    padding: '10px 20px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: !selectedParticipant ? 0.6 : 1
                  }}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Review Confirmation Modal */}
        {showCompleteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowCompleteModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={24} color="#4caf50" />
                Xác nhận kết thúc thảo luận
              </h2>
              <p style={{ margin: '0 0 24px 0', color: '#666', lineHeight: 1.6 }}>
                Bạn có chắc chắn muốn kết thúc phiên thảo luận này?
                <br /><br />
                <strong>Lưu ý:</strong> Sau khi kết thúc, không thể thêm góp ý mới.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCompleteReview}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận kết thúc'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finalize and Submit Modal */}
        {showFinalizeModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowFinalizeModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <h2 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={24} color="#ff9800" />
                Hoàn tất Thảo luận & Chuyển Phê duyệt
              </h2>
              <p style={{ margin: '0 0 24px 0', color: '#666', lineHeight: 1.6 }}>
                Tổng hợp các góp ý từ phiên thảo luận và chuyển giáo trình vào quy trình phê duyệt chính thức của Trưởng khoa.
              </p>

              <div style={{
                background: '#e3f2fd',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #2196f3'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1976d2', fontSize: '14px' }}>
                  📊 Thống kê phiên thảo luận
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Người tham gia</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
                      {review.totalParticipants}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Đã góp ý</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#4caf50' }}>
                      {review.reviewedCount}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Tổng góp ý</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#2196f3' }}>
                      {review.comments.filter(c => !c.isHoD).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 500, color: '#333' }}>
                    Tóm tắt tổng hợp <span style={{ color: '#f44336' }}>*</span>
                  </label>
                  <button
                    onClick={() => setCompiledSummary(generateAutoSummary())}
                    style={{
                      padding: '6px 12px',
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                  >
                    🤖 Tạo tự động
                  </button>
                </div>
                <textarea
                  value={compiledSummary}
                  onChange={(e) => setCompiledSummary(e.target.value)}
                  placeholder="Nhập tóm tắt các góp ý đã tổng hợp, kết luận và đề xuất..."
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    lineHeight: 1.6
                  }}
                />
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                  💡 Tóm tắt này sẽ được gửi cùng giáo trình trong quy trình phê duyệt
                </p>
              </div>

              <div style={{
                background: '#fff3e0',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #ff9800'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#e65100', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  Lưu ý quan trọng
                </p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
                  <li>Sau khi hoàn tất, giáo trình sẽ được chuyển vào hàng đợi phê duyệt chính thức</li>
                  <li>Không thể chỉnh sửa hoặc thêm góp ý sau khi hoàn tất</li>
                  <li>Trưởng khoa sẽ xem xét tóm tắt này khi phê duyệt</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowFinalizeModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleFinalizeAndSubmit}
                  disabled={isSubmitting || !compiledSummary.trim()}
                  style={{
                    padding: '10px 20px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: (isSubmitting || !compiledSummary.trim()) ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Đang xử lý...' : '✅ Hoàn tất & Chuyển phê duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborativeReviewDetailPage;
