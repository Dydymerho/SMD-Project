import { Assessment } from '../types/Assessment';
import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../../backend/types/ApiResponse';
export const AssessmentApi = {
    getAssessment(): Promise<AxiosResponse<ApiResponse<Assessment>>> {
        return axiosClient.get("/assessments");
    },
};