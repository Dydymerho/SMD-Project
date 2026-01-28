// File: backend/api/CourseInteractionApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const CourseInteractionApi = {
    followCourse: (courseId: number | string): Promise<any> => {
        return axiosClient.post(`/courses/${courseId}/follow`);
    },
    unfollowCourse: (courseId: number | string): Promise<any> => {
        return axiosClient.delete(`/courses/${courseId}/follow`);
    },
    getFollowedCourses: (): Promise<any[]> => {
        return axiosClient.get(`/courses/following`);
    }
};