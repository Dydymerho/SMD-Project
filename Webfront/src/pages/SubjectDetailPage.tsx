import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCourseById } from '../services/api';
import './SubjectDetailPage.css';

interface CourseDetail {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  syllabus?: string;
  prerequisites?: string[];
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourseDetail(id);
    }
  }, [id]);

  const loadCourseDetail = async (courseId: string) => {
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subject-detail-page">
        <Navbar />
        <div className="detail-container">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="subject-detail-page">
        <Navbar />
        <div className="detail-container">
          <p>Không tìm thấy môn học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-detail-page">
      <Navbar />
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
                {course.prerequisites.map((prereq, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
