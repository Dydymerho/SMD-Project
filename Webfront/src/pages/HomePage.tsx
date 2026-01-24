import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SubjectCard from '../components/SubjectCard';
import { getCourses } from '../services/api';
import './HomePage.css';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
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
              {courses.map((course) => (
                <SubjectCard
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  code={course.code}
                  credits={course.credits}
                  description={course.description}
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
