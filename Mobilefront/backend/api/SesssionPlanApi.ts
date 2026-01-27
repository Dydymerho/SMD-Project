import { SessionPlan } from '../types/SessionPlan';
import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../../backend/types/ApiResponse';
export const SessionPlanApi = {
    getSessionPlan(): Promise<AxiosResponse<ApiResponse<SessionPlan>>> {
        return axiosClient.get("/session-plans");
    },
};