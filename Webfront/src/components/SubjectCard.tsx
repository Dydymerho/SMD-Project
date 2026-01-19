import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SubjectCard.css';

interface SubjectCardProps {
  id: string;
  name: string;
  code: string;
  credits?: number;
  description?: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  name,
  code,
  credits,
  description,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/subject/${id}`);
  };

  return (
    <div className="subject-card" onClick={handleClick}>
      <div className="subject-card-header">
        <h3 className="subject-name">{name}</h3>
        <span className="subject-code">{code}</span>
      </div>
      {credits && (
        <div className="subject-credits">
          <span>{credits} tín chỉ</span>
        </div>
      )}
      {description && (
        <p className="subject-description">{description}</p>
      )}
    </div>
  );
};

export default SubjectCard;
