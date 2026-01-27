import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, MessageCircle, AlertCircle, Send, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCourseById, getSyllabusByCourseId } from '../services/api';
import './SubjectDetailPage.css';
import './dashboard/DashboardPage.css';

interface CourseDetail {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  description: string;
}

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const syllabusId = searchParams.get('syllabusId');
  const [course, setCourse] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Report & Comment modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('content_error');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
        const syllabusData = await getSyllabusByCourseId(id);
        setSyllabus(syllabusData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, syllabusId]);

  const handleSubmitReport = async () => {
    if (!reportContent.trim()) {
      alert('Vui lòng nhập nội dung báo cáo');
      return;
    }
    try {
      setIsSubmitting(true);
      // Add your API call here to submit the report
      // await submitReport({ courseId: id, type: reportType, content: reportContent });
      alert('Báo cáo được gửi thành công');
      setShowReportModal(false);
      setReportContent('');
      setReportType('content_error');
    } catch (error) {
      console.error('Lỗi gửi báo cáo:', error);
      alert('Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      alert('Vui lòng nhập nội dung nhận xét');
      return;
    }
    try {
      setIsSubmitting(true);
      // Add your API call here to submit the comment
      // await submitComment({ courseId: id, content: commentContent });
      alert('Nhận xét được gửi thành công');
      setShowCommentModal(false);
      setCommentContent('');
    } catch (error) {
      console.error('Lỗi gửi nhận xét:', error);
      alert('Có lỗi xảy ra khi gửi nhận xét');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!course) return <div className="error">Không tìm thấy môn học</div>;

  return (
    <div className="subject-detail-page">
      <Navbar />
      <div className="detail-container">
        <div className="detail-header">
          <div className="detail-title">
            <h1>{course.courseName}</h1>
            <span className="detail-code">{course.courseCode}</span>
          </div>
          <div className="detail-credits">
            <span>{course.credits} tín chỉ</span>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section">
            <h2>Mô tả</h2>
            <p>{course.description || "Chưa có mô tả cho môn học này."}</p>
          </section>
          {/*
          {course.prerequisites && course.prerequisites.length > 0 && (
            <section className="detail-section">
              <h2>Môn học tiên quyết</h2>
              <ul>
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </section>
          )}  */}

        {syllabus && (
          <section className="detail-section">
            <h2>Chi tiết giáo trình</h2>
            <div className="syllabus-card">
              <p><strong>Giảng viên:</strong> {syllabus.lecturer?.fullName}</p>
              <p><strong>Năm học:</strong> {syllabus.academicYear}</p>
              <p><strong>Phiên bản:</strong> {syllabus.versionNo}</p>
              <div className="syllabus-notes">
                <h3>Nội dung chính:</h3>
                <p>{syllabus.versionNotes}</p>
              </div>
            </div>
          </section>
        )}

        {/* Detail Content */}
        <div className="content-section" style={{ margin: '20px 40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-back" style={{ 
              background: 'white', 
              border: '1px solid #ddd', 
              padding: '10px 20px', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeft size={20} />
              Quay lại Dashboard
            </button>
          </div>

          <div className="detail-container">
            <div className="detail-header">
              <div className="detail-title">
                <h1>{course.name}</h1>
                <span className="detail-code">{course.code}</span>
              </div>
              <div className="detail-credits">
                <span>{course.credits} tín chỉ</span>
              </div>
            </div>

            <div className="detail-content">
              <section className="detail-section">
                <h2>Mô tả</h2>
                <p>{course.description}</p>
              </section>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <section className="detail-section">
                  <h2>Môn học tiên quyết</h2>
                  <ul>
                    {course.prerequisites.map((prereq: string, index: number) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </section>
              )}

              {course.syllabus && (
                <section className="detail-section">
                  <h2>Đề cương</h2>
                  <div className="syllabus-content">
                    {course.syllabus}
                  </div>
                </section>
              )}

              {/* Action buttons */}
              <section className="detail-section">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => navigate(`/syllabus/review/${id}`)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <MessageSquare size={18} />
                    Xem tất cả Review
                  </button>
                  <button 
                    onClick={() => setShowCommentModal(true)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <MessageCircle size={18} />
                    Thêm nhận xét
                  </button>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ef4444', color: '#ef4444' }}
                  >
                    <AlertCircle size={18} />
                    Báo cáo vấn đề
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Report Modal */}
          {showReportModal && (
            <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={24} color="#ef4444" />
                    Báo cáo vấn đề
                  </h2>
                  <button onClick={() => setShowReportModal(false)} className="btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Loại vấn đề</label>
                    <select 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                      <option value="content_error">Sai sót nội dung</option>
                      <option value="outdated">Nội dung lỗi thời</option>
                      <option value="missing_info">Thiếu thông tin</option>
                      <option value="formatting">Lỗi định dạng</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nội dung báo cáo</label>
                    <textarea
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                      rows={6}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    onClick={() => setShowReportModal(false)} 
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSubmitReport} 
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comment Modal */}
          {showCommentModal && (
            <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={24} color="#3b82f6" />
                    Thêm nhận xét
                  </h2>
                  <button onClick={() => setShowCommentModal(false)} className="btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nội dung nhận xét</label>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ ý kiến, góp ý của bạn về giáo trình này..."
                      rows={6}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    onClick={() => setShowCommentModal(false)} 
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSubmitComment} 
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Đang gửi...' : 'Gửi nhận xét'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CourseDetailPage;
