import { PaginatedResponse } from './Pagination';

// Định nghĩa đối tượng Notification
export type Notification = {
    notificationId: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    actionUrl: string;
    triggeredBy: string;
    createdAt: string;
    syllabusId: number;
    courseName: string;
    courseCode: string;
    academicYear: string;
    versionNo: number;
};

// Sử dụng lại Generic Type
export type NotificationListResponse = PaginatedResponse<Notification>;