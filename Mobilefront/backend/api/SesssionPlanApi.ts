import { SessionPlan } from '../types/SessionPlan';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/ApiResponse';

export const SessionPlanApi = {
    getSessionPlan(): Promise<ApiResponse<SessionPlan[]>> {
        return axiosClient.get("/session-plans");
    },
};