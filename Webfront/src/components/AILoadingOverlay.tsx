import React from 'react';
import './AILoadingOverlay.css';

interface AILoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ 
  isVisible, 
  message = 'AI đang xử lý tài liệu của bạn...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="ai-loading-overlay">
      <div className="ai-loading-container">
        <div className="ai-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2>AI đang tóm tắt</h2>
        <p>{message}</p>
        <div className="processing-steps">
          <div className="step">Đang xử lý tài liệu...</div>
        </div>
      </div>
    </div>
  );
};

export default AILoadingOverlay;
