// backend/types/Report.ts

// Dữ liệu gửi đi (Request)
export interface ReportRequest {
    title: string;       // Tiêu đề báo cáo (Ví dụ: "Lỗi tài liệu X")
    description: string; // Chi tiết lỗi (Ví dụ: "Link hỏng")
}

// Dữ liệu nhận về (Response) - Khớp với mẫu JSON bạn cung cấp
export interface ReportResponse {
    reportId: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    reporterId: number;
    reporterName: string;
    reporterEmail: string;
}