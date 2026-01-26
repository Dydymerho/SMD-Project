import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCourseById, getSyllabusByCourseId } from '../services/api';
import './SubjectDetailPage.css';

interface CourseDetail {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  description: string;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const syllabusId = searchParams.get('syllabusId');
  const [course, setCourse] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
