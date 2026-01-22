import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getSubjectById } from '../services/api';
import './SubjectDetailPage.css';

interface SubjectDetail {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  syllabus?: string;
  prerequisites?: string[];
}

const SubjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSubjectDetail(id);
    }
  }, [id]);

  const loadSubjectDetail = async (subjectId: string) => {
    try {
      const data = await getSubjectById(subjectId);
      setSubject(data);
    } catch (error) {
      console.error('Error loading subject:', error);
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

  if (!subject) {
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
            <h1>{subject.name}</h1>
            <span className="detail-code">{subject.code}</span>
          </div>
          <div className="detail-credits">
            <span>{subject.credits} tín chỉ</span>
          </div>
        </div>

        <div className="detail-content">
          <section className="detail-section">
            <h2>Mô tả</h2>
            <p>{subject.description}</p>
          </section>

          {subject.prerequisites && subject.prerequisites.length > 0 && (
            <section className="detail-section">
              <h2>Môn học tiên quyết</h2>
              <ul>
                {subject.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </section>
          )}

          {subject.syllabus && (
            <section className="detail-section">
              <h2>Đề cương</h2>
              <div className="syllabus-content">
                {subject.syllabus}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
