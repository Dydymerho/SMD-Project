import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchInput from '../components/SearchInput';
import SubjectCard from '../components/SubjectCard';
import { searchSubjects } from '../services/api';
import './SearchPage.css';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchSubjects(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-container">
        <div className="search-header">
          <h1>Tìm kiếm môn học</h1>
          <div className="search-box">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Nhập tên hoặc mã môn học..."
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="search-results">
          {loading ? (
            <p>Đang tìm kiếm...</p>
          ) : searched ? (
            results.length > 0 ? (
              <>
                <h2>Kết quả tìm kiếm ({results.length})</h2>
                <div className="results-grid">
                  {results.map((subject) => (
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
              </>
            ) : (
              <p>Không tìm thấy kết quả nào</p>
            )
          ) : (
            <p>Nhập từ khóa để tìm kiếm</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
