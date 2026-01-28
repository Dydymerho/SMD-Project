// backend/api/ReportApi.ts
import axiosClient from './axiosClient';
import { ReportRequest, ReportResponse } from '../types/Report';

export const ReportApi = {
    // Hàm gửi báo cáo
    createReport: (data: ReportRequest): Promise<ReportResponse> => {
        return axiosClient.post('/reports', data);
    }
};