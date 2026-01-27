import axiosClient from "./axiosClient";
import { NotificationListResponse } from "../types/Notification"; // Nhớ tạo file Type này nhé

export const NotificationApi = {
    getAll(page: number = 0, size: number = 20): Promise<NotificationListResponse> {
        return axiosClient.get(`/notifications?page=${page}&size=${size}&sort=createdAt,desc`);
    },

    markAsRead(id: number): Promise<void> {
        return axiosClient.put(`/notifications/${id}/read`);
    }
};