import axiosClient from './axiosClient';
import { CourseNode } from '../types/CourseRelationShip'
export const CourseRelationApi = {
    /**
     * Lấy cây quan hệ môn học (Tree Structure)
     */
    getTree: async (courseId: number | string): Promise<CourseNode> => {
        const url = `/v1/course-relations/tree/${courseId}`;
        return axiosClient.get(url);
    }
};