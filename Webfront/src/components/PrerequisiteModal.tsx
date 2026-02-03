import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Edit, Loader, Plus, Trash2, X } from 'lucide-react';
import * as api from '../services/api';
import './PrerequisiteModal.css';

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
  const [availableCourses, setAvailableCourses] = useState<api.AvailablePrerequisiteResponse[]>([]);
  const [selectedTargetCourseId, setSelectedTargetCourseId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

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

  useEffect(() => {
    if (!isOpen || !courseId || !showAddForm) return;

    const loadAvailableCourses = async () => {
      try {
        const courses = await api.getAvailablePrerequisites(courseId);
        console.log('Available courses loaded:', courses);
        setAvailableCourses(courses);
      } catch (err) {
        console.error('Failed to load available courses:', err);
        setError('Không thể tải danh sách môn học.');
      }
    };

    loadAvailableCourses();
  }, [isOpen, courseId, showAddForm]);

  const handleAddRelation = async () => {
    if (!courseId || !selectedTargetCourseId) return;

    setAdding(true);
    setError(null);

    try {
      // Try to check for circular dependency, but don't block if it fails
      try {
        const circularCheck = await api.checkCircularDependency(
          courseId,
          selectedTargetCourseId,
          selectedType
        );

        if (circularCheck.circular) {
          setError(circularCheck.message || 'Thêm quan hệ này sẽ tạo vòng lặp phụ thuộc!');
          setAdding(false);
          return;
        }
      } catch (checkErr) {
        console.warn('Circular check failed, continuing anyway:', checkErr);
        // Continue to create the relation even if check fails
      }

      // Create the relation
      const newRelation = await api.createCourseRelation({
        sourceCourseId: courseId,
        targetCourseId: selectedTargetCourseId,
        relationType: selectedType
      });

      setRelations([...relations, newRelation]);
      setShowAddForm(false);
      setSelectedTargetCourseId(null);
    } catch (err: any) {
      console.error('Failed to create relation:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Không thể thêm quan hệ môn học.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRelation = async (relationId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa quan hệ này?')) return;

    setDeleting(relationId);
    setError(null);

    try {
      await api.deleteCourseRelation(relationId);
      setRelations(relations.filter(r => r.relationId !== relationId));
    } catch (err: any) {
      console.error('Failed to delete relation:', err);
      setError(err.response?.data?.message || 'Không thể xóa quan hệ môn học.');
    } finally {
      setDeleting(null);
    }
  };

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
              
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  style={{
                    padding: '8px 12px',
                    background: '#008f81',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} />
                  Thêm quan hệ
                </button>
              ) : (
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '12px', 
                        color: '#666', 
                        marginBottom: '4px',
                        fontWeight: 600
                      }}>
                        Loại quan hệ
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as any)}
                        style={{
                          width: '100%',
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
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '12px', 
                        color: '#666', 
                        marginBottom: '4px',
                        fontWeight: 600
                      }}>
                        Chọn môn học
                      </label>
                      <select
                        value={selectedTargetCourseId || ''}
                        onChange={(e) => setSelectedTargetCourseId(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}
                      >
                        <option value="">-- Chọn môn học --</option>
                        {availableCourses.map((course, index) => (
                          <option key={`course-${course.courseId}-${index}`} value={course.courseId}>
                            {course.courseCode} - {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleAddRelation}
                        disabled={!selectedTargetCourseId || adding}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: selectedTargetCourseId && !adding ? '#4caf50' : '#e0e0e0',
                          color: selectedTargetCourseId && !adding ? 'white' : '#999',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: selectedTargetCourseId && !adding ? 'pointer' : 'not-allowed',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {adding ? (
                          <>
                            <Loader size={14} className="spin" />
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Xác nhận
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setSelectedTargetCourseId(null);
                          setError(null);
                        }}
                        disabled={adding}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: adding ? '#e0e0e0' : '#f44336',
                          color: adding ? '#999' : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: adding ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={14} />
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                          onClick={() => handleDeleteRelation(relation.relationId)}
                          disabled={deleting === relation.relationId}
                          style={{
                            padding: '6px 8px',
                            background: deleting === relation.relationId ? '#e0e0e0' : '#f44336',
                            color: deleting === relation.relationId ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: deleting === relation.relationId ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {deleting === relation.relationId ? (
                            <Loader size={14} className="spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
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
