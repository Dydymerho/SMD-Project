import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchInput from '../components/SearchInput';
import SubjectCard from '../components/SubjectCard';
import { searchSyllabuses, Syllabus, getDepartments } from '../services/api';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [subscribedSyllabi, setSubscribedSyllabi] = useState<Set<number>>(new Set());

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchSyllabuses(searchQuery);
      
      // Filter by department if selected
      const filtered = selectedDepartment 
        ? data.filter(s => s.course?.department?.departmentId.toString() === selectedDepartment)
        : data;
      
      setResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    
    // Re-filter existing results
    if (results.length > 0) {
      if (e.target.value) {
        const filtered = results.filter(s => 
          s.course?.department?.departmentId.toString() === e.target.value
        );
        setResults(filtered);
      } else {
        // If filter cleared, search again to get all results
        handleSearch();
      }
    }
  };

  const handleFollow = (syllabusId: number) => {
    setSubscribedSyllabi(prev => {
      const newSet = new Set(prev);
      if (newSet.has(syllabusId)) {
        newSet.delete(syllabusId);
      } else {
        newSet.add(syllabusId);
      }
      return newSet;
    });
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-container">
        <div className="search-header">
          <h1>Tra cứu giáo trình</h1>
          <p>Tìm kiếm và xem giáo trình các môn học</p>
        </div>

        <form className="search-filter-bar" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm theo tên hoặc mã môn học..."
              onSearch={handleSearch}
            />
          </div>
          <div className="filter-select">
            <select value={selectedDepartment} onChange={handleFilterChange}>
              <option value="">Tất cả chuyên ngành</option>
              {departments.map(dept => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.deptName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="search-submit-btn" disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        <div className="search-results">
          {loading && <p className="status-text">Đang tải dữ liệu môn học...</p>}
          {!loading && searched && results.length === 0 && (
            <p className="status-text no-results">❌ Không tìm thấy giáo trình phù hợp</p>
          )}
          {!searched && !loading && (
            <p className="status-text">Nhập tên môn học để bắt đầu tra cứu</p>
          )}

          {results.length > 0 && (
            <>
              <h2>Kết quả tìm kiếm ({results.length})</h2>
              <div className="results-grid course-grid">
                {results.map((syllabus) => (
                  <SubjectCard
                    key={syllabus.syllabusId}
                    id={syllabus.syllabusId}
                    courseCode={syllabus.course?.courseCode || ''}
                    courseName={syllabus.course?.courseName || ''}
                    lecturer={syllabus.lecturer?.fullName}
                    department={syllabus.course?.department?.deptName}
                    credits={syllabus.course?.credits}
                    academicYear={syllabus.academicYear}
                    status={syllabus.currentStatus}
                    isFollowed={subscribedSyllabi.has(syllabus.syllabusId)}
                    onFollow={() => handleFollow(syllabus.syllabusId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
