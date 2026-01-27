// api/AssessmentApi.ts
import { Assessment } from '../types/Assessment';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const AssessmentApi = {
    getAssessment(): Promise<ApiResponse<Assessment[]>> {
        return axiosClient.get("/assessments");
    },
};