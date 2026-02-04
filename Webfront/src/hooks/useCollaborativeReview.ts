import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { fetchSyllabusById } from '../services/workflowService';

export interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
    fullName: string;
    email?: string;
  };
}

export interface CollaborativeReviewDetail {
  syllabusId: number;
  syllabusTitle: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  lecturerEmail?: string;
  status: string;
  createdDate: string;
  deadline: string;
  description: string;
  comments: Comment[];
}

const fetchAllComments = async (syllabusId: number): Promise<Comment[]> => {
  const response = await axiosClient.get(`/syllabuses/${syllabusId}/comments/all`);
  return Array.isArray(response.data) ? response.data : [];
};

const postComment = async (syllabusId: number, content: string) => {
  const response = await axiosClient.post(`/syllabuses/${syllabusId}/comments`, {
    content,
    type: 'REVIEW'
  });
  return response.data;
};

const removeComment = async (syllabusId: number, commentId: number) => {
  await axiosClient.delete(`/syllabuses/${syllabusId}/comments/${commentId}`);
  return true;
};

export const useCollaborativeReview = (syllabusId: number | undefined) => {
  const [review, setReview] = useState<CollaborativeReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      if (!syllabusId) return;

      // Get syllabus details
      const syllabusData = await fetchSyllabusById(syllabusId);
      
      // Get all comments for collaborative review
      const commentsData = await fetchAllComments(syllabusId);

      // Extract data from response
      const lecturerName = syllabusData?.lecturerName || 'Chưa rõ';
      const lecturerEmail = syllabusData?.lecturerEmail || '';
      const syllabusTitle = syllabusData?.courseName || 'Chưa rõ';
      const courseCode = syllabusData?.courseCode || 'N/A';
      const courseName = syllabusData?.courseName || 'Chưa rõ';

      setReview({
        syllabusId: syllabusData.syllabusId,
        syllabusTitle: syllabusTitle,
        courseCode: courseCode,
        courseName: courseName,
        lecturer: lecturerName,
        lecturerEmail: lecturerEmail,
        status: syllabusData.currentStatus || 'PENDING_REVIEW',
        createdDate: syllabusData.createdAt || new Date().toISOString(),
        deadline: syllabusData.updatedAt || new Date().toISOString(),
        description: 'Xin mời các thầy cô góp ý về nội dung giáo trình.',
        comments: commentsData
      });
    } catch (error) {
      console.error('Error loading review:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (onSuccess?: () => void, onError?: (msg: string) => void) => {
    if (!newComment.trim()) {
      onError?.('Vui lòng nhập nội dung góp ý');
      return;
    }

    if (!review) return;

    setIsSubmitting(true);
    try {
      await postComment(review.syllabusId, newComment);
      setNewComment('');
      await loadReviewDetail(); // Reload to get updated comments
      onSuccess?.();
    } catch (error) {
      console.error('Error posting comment:', error);
      onError?.('Có lỗi xảy ra khi gửi góp ý');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number, onSuccess?: () => void, onError?: (msg: string) => void) => {
    if (!review) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;

    try {
      await removeComment(review.syllabusId, commentId);
      await loadReviewDetail(); // Reload to get updated comments
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      onError?.('Không thể xóa góp ý');
    }
  };

  useEffect(() => {
    loadReviewDetail();
  }, [syllabusId]);

  return {
    review,
    loading,
    newComment,
    setNewComment,
    isSubmitting,
    handlePostComment,
    handleDeleteComment,
    reloadReview: loadReviewDetail
  };
};
