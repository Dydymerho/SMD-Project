import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubjectCard from '../components/SubjectCard';
import { getSubjects } from '../services/api';
import './HomePage.css';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

const HomePage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-container">
        <div className="home-header">
          <h1>Chào mừng đến với hệ thống quản lý giáo trình</h1>
          <p>Khám phá các môn học và tài liệu học tập</p>
        </div>

        <div className="home-content">
          <h2>Môn học phổ biến</h2>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  code={subject.code}
                  credits={subject.credits}
                  description={subject.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
