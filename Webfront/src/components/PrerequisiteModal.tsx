import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Edit, Loader, Plus, Trash2 } from 'lucide-react';
import * as api from '../services/api';

interface PrerequisiteModalProps {
  isOpen: boolean;
  courseId?: number;
  courseName?: string;
  onClose: () => void;
}

const PrerequisiteModal: React.FC<PrerequisiteModalProps> = ({
  isOpen,
  courseId,
  courseName,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relations, setRelations] = useState<api.CourseRelationResponse[]>([]);
  const [selectedType, setSelectedType] = useState<'PREREQUISITE' | 'COREQUISITE' | 'EQUIVALENT'>('PREREQUISITE');

  useEffect(() => {
    if (!isOpen || !courseId) return;

    const loadRelations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCourseRelationsByCourseId(courseId);
        setRelations(data);
      } catch (err) {
        console.error('Failed to load course relations:', err);
        setError('Không thể tải quan hệ môn học.');
      } finally {
        setLoading(false);
      }
    };

    loadRelations();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const typeStyles: Record<api.CourseRelationResponse['relationType'], { label: string; bg: string; text: string }> = {
    PREREQUISITE: { label: 'Môn tiên quyết', bg: '#e8f5e9', text: '#2e7d32' },
    COREQUISITE: { label: 'Môn song hành', bg: '#fff3e0', text: '#f57c00' },
    EQUIVALENT: { label: 'Môn tương đương', bg: '#e3f2fd', text: '#1976d2' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '720px',
          maxWidth: '95%',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            background: '#008f81',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Quan hệ môn học</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
              {courseName || 'Môn học'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(80vh - 70px)' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
              <Loader size={18} className="spin" />
              Đang tải dữ liệu...
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#c62828',
              background: '#ffebee',
              padding: '10px 12px',
              borderRadius: '6px',
              marginBottom: '12px'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {!loading && !error && relations.length === 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2e7d32',
              background: '#e8f5e9',
              padding: '10px 12px',
              borderRadius: '6px'
            }}>
              <Check size={16} />
              Chưa có quan hệ môn học.
            </div>
          )}

          {!loading && !error && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>
                Thêm quan hệ mới
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                >
                  <option value="PREREQUISITE">Môn tiên quyết</option>
                  <option value="COREQUISITE">Môn song hành</option>
                  <option value="EQUIVALENT">Môn tương đương</option>
                </select>
                <button
                  type="button"
                  disabled
                  title="Chức năng thêm cần API hỗ trợ"
                  style={{
                    padding: '8px 12px',
                    background: '#e0e0e0',
                    color: '#777',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'not-allowed',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  <Plus size={14} style={{ marginRight: '4px', display: 'inline' }} />
                  Thêm quan hệ
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                Chức năng thêm/sửa/xóa cần API backend hỗ trợ.
              </div>
            </div>
          )}

          {!loading && !error && relations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {relations.map((relation) => {
                const style = typeStyles[relation.relationType];
                return (
                  <div key={relation.relationId} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#333' }}>{relation.targetCourseCode}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: style.bg,
                        color: style.text,
                        fontWeight: 600
                      }}>
                        {style.label}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          disabled
                          title="Chức năng sửa cần API hỗ trợ"
                          style={{
                            padding: '6px 8px',
                            background: '#e0e0e0',
                            color: '#777',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'not-allowed'
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Chức năng xóa cần API hỗ trợ"
                          style={{
                            padding: '6px 8px',
                            background: '#e0e0e0',
                            color: '#777',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'not-allowed'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ color: '#555', fontSize: '13px' }}>
                      {relation.targetCourseName}
                      {relation.credits ? ` • ${relation.credits} tín chỉ` : ''}
                      {relation.deptName ? ` • ${relation.deptName}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrerequisiteModal;
