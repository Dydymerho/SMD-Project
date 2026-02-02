# Audit Log API Documentation

## Tổng quan

API Audit Log cho phép Admin theo dõi và giám sát toàn bộ hoạt động trong hệ thống. Tất cả các endpoints yêu cầu quyền ADMIN.

## Authentication

Tất cả các endpoints yêu cầu Bearer token trong header:

```
Authorization: Bearer <your-token>
```

## Base URL

```
http://localhost:8080/api/audit-logs
```

---

## 📋 Endpoints

### 1. Lấy tất cả Audit Logs (có phân trang)

```http
GET /api/audit-logs
```

**Query Parameters:**

- `page` (optional): Số trang (default: 0)
- `size` (optional): Số lượng mỗi trang (default: 50)
- `sortBy` (optional): Sắp xếp theo field (default: timestamp)
- `sortDir` (optional): Hướng sắp xếp asc/desc (default: desc)

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": {
    "auditLogs": [
      {
        "id": 1,
        "syllabusId": 123,
        "actionType": "CREATE_SYLLABUS",
        "performedBy": "teacher1",
        "performedByRole": "TEACHER",
        "oldStatus": null,
        "newStatus": "DRAFT",
        "comments": "Created new syllabus",
        "changedFields": null,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-01-15T10:25:00",
        "additionalData": null,
        "courseCode": "CS101",
        "courseName": "Introduction to Programming",
        "academicYear": "2024-2025",
        "versionNo": 1
      }
    ],
    "currentPage": 0,
    "totalItems": 150,
    "totalPages": 3,
    "pageSize": 50
  }
}
```

**Example:**

```bash
# Lấy trang đầu tiên
curl -X GET "http://localhost:8080/api/audit-logs?page=0&size=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy trang 2, sắp xếp theo action type tăng dần
curl -X GET "http://localhost:8080/api/audit-logs?page=1&size=20&sortBy=actionType&sortDir=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Lấy Audit Logs theo khoảng thời gian

```http
GET /api/audit-logs/date-range
```

**Query Parameters:**

- `startDate` (required): Ngày bắt đầu (ISO format: 2024-01-01T00:00:00)
- `endDate` (required): Ngày kết thúc (ISO format: 2024-12-31T23:59:59)

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 45 audit logs in the specified date range",
  "data": [
    {
      "id": 1,
      "syllabusId": 123,
      "actionType": "HOD_APPROVE",
      "performedBy": "hod1",
      "performedByRole": "HOD",
      "oldStatus": "PENDING_HOD_APPROVAL",
      "newStatus": "PENDING_AA_APPROVAL",
      "comments": "Approved by HOD",
      "timestamp": "2024-01-10T14:20:00"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/date-range?startDate=2024-01-01T00:00:00&endDate=2024-01-31T23:59:59" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Lấy Audit Logs theo loại hành động

```http
GET /api/audit-logs/action-type/{actionType}
```

**Path Parameters:**

- `actionType`: Loại hành động (CREATE_SYLLABUS, UPLOAD_PDF, HOD_APPROVE, etc.)

**Action Types có sẵn:**

- `CREATE_SYLLABUS` - Tạo syllabus mới
- `UPDATE_SYLLABUS` - Cập nhật syllabus
- `DELETE_SYLLABUS` - Xóa syllabus
- `UPLOAD_PDF` - Upload PDF
- `DELETE_PDF` - Xóa PDF
- `DOWNLOAD_PDF` - Download PDF
- `SUBMIT_FOR_REVIEW` - Nộp để xét duyệt
- `HOD_APPROVE` - HOD phê duyệt
- `HOD_REJECT` - HOD từ chối
- `AA_APPROVE` - Academic Affairs phê duyệt
- `AA_REJECT` - Academic Affairs từ chối
- `PRINCIPAL_APPROVE` - Principal phê duyệt
- `PRINCIPAL_REJECT` - Principal từ chối
- `CREATE_VERSION` - Tạo version mới
- `ARCHIVE` - Lưu trữ
- `RESTORE` - Khôi phục

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 12 audit logs for action type: HOD_APPROVE",
  "data": [
    {
      "id": 5,
      "actionType": "HOD_APPROVE",
      "performedBy": "hod1",
      "timestamp": "2024-01-10T14:20:00"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/action-type/HOD_APPROVE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Lấy Audit Logs theo người dùng

```http
GET /api/audit-logs/user/{username}
```

**Path Parameters:**

- `username`: Tên đăng nhập của người dùng

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 25 audit logs for user: teacher1",
  "data": [
    {
      "id": 1,
      "actionType": "CREATE_SYLLABUS",
      "performedBy": "teacher1",
      "performedByRole": "TEACHER",
      "timestamp": "2024-01-10T10:00:00"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/user/teacher1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Lấy Audit Logs theo Syllabus

```http
GET /api/audit-logs/syllabus/{syllabusId}
```

**Path Parameters:**

- `syllabusId`: ID của syllabus

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 8 audit logs for syllabus ID: 123",
  "data": [
    {
      "id": 1,
      "syllabusId": 123,
      "actionType": "CREATE_SYLLABUS",
      "performedBy": "teacher1",
      "timestamp": "2024-01-05T10:00:00"
    },
    {
      "id": 2,
      "syllabusId": 123,
      "actionType": "SUBMIT_FOR_REVIEW",
      "performedBy": "teacher1",
      "timestamp": "2024-01-08T14:30:00"
    },
    {
      "id": 3,
      "syllabusId": 123,
      "actionType": "HOD_APPROVE",
      "performedBy": "hod1",
      "timestamp": "2024-01-10T09:15:00"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/syllabus/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Lấy Audit Logs gần đây

```http
GET /api/audit-logs/recent
```

**Query Parameters:**

- `days` (optional): Số ngày gần đây (default: 7)

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 42 audit logs from the last 7 days",
  "data": [
    {
      "id": 150,
      "actionType": "UPLOAD_PDF",
      "performedBy": "teacher5",
      "timestamp": "2024-01-14T16:45:00"
    }
  ]
}
```

**Example:**

```bash
# Lấy logs 7 ngày gần đây
curl -X GET "http://localhost:8080/api/audit-logs/recent?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy logs 30 ngày gần đây
curl -X GET "http://localhost:8080/api/audit-logs/recent?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Lấy thống kê Audit Logs

```http
GET /api/audit-logs/statistics
```

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Audit log statistics retrieved successfully",
  "data": {
    "totalLogs": 1250,
    "countByActionType": {
      "CREATE_SYLLABUS": 150,
      "UPDATE_SYLLABUS": 320,
      "DELETE_SYLLABUS": 25,
      "UPLOAD_PDF": 180,
      "SUBMIT_FOR_REVIEW": 145,
      "HOD_APPROVE": 120,
      "HOD_REJECT": 30,
      "AA_APPROVE": 100,
      "AA_REJECT": 20,
      "PRINCIPAL_APPROVE": 80,
      "PRINCIPAL_REJECT": 10
    },
    "logsLast24Hours": 45,
    "logsLast7Days": 285,
    "logsLast30Days": 890
  }
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Lấy Audit Logs theo năm học

```http
GET /api/audit-logs/academic-year/{academicYear}
```

**Path Parameters:**

- `academicYear`: Năm học (format: 2024-2025)

**Response:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "success": true,
  "message": "Found 380 audit logs for academic year: 2024-2025",
  "data": [
    {
      "id": 1,
      "syllabusId": 123,
      "academicYear": "2024-2025",
      "actionType": "CREATE_SYLLABUS",
      "timestamp": "2024-09-01T10:00:00"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:8080/api/audit-logs/academic-year/2024-2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Bảo mật

Tất cả các endpoints yêu cầu:

1. **Authentication**: Bearer token hợp lệ
2. **Authorization**: Role ADMIN

Nếu không có quyền, API sẽ trả về:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied - Admin role required",
  "path": "/api/audit-logs"
}
```

---

## 📊 Use Cases

### 1. Theo dõi hoạt động hệ thống

```bash
# Xem tất cả hoạt động trong 24 giờ qua
curl -X GET "http://localhost:8080/api/audit-logs/recent?days=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Kiểm tra workflow của một syllabus

```bash
# Xem toàn bộ lịch sử của syllabus ID 123
curl -X GET "http://localhost:8080/api/audit-logs/syllabus/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Audit user activity

```bash
# Xem tất cả hoạt động của teacher1
curl -X GET "http://localhost:8080/api/audit-logs/user/teacher1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Báo cáo định kỳ

```bash
# Xem hoạt động trong tháng 1/2024
curl -X GET "http://localhost:8080/api/audit-logs/date-range?startDate=2024-01-01T00:00:00&endDate=2024-01-31T23:59:59" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Phân tích hệ thống

```bash
# Xem thống kê tổng quan
curl -X GET "http://localhost:8080/api/audit-logs/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Tips

1. **Sử dụng phân trang**: Với số lượng logs lớn, luôn sử dụng pagination để tránh timeout
2. **Filter theo date range**: Khi cần báo cáo cụ thể, nên lọc theo khoảng thời gian
3. **Monitor statistics**: Sử dụng endpoint statistics để có cái nhìn tổng quan nhanh chóng
4. **Track workflow**: Sử dụng endpoint syllabus để theo dõi workflow cụ thể
5. **Audit users**: Định kỳ kiểm tra hoạt động của users để phát hiện bất thường

---

## 🔍 Troubleshooting

### 403 Forbidden

- Kiểm tra token có hợp lệ không
- Đảm bảo user có role ADMIN

### 400 Bad Request (Date Range)

- Kiểm tra format ngày tháng đúng ISO 8601
- Đảm bảo startDate < endDate

### Empty Response

- Kiểm tra tham số query có chính xác không
- Xem log hệ thống để biết chi tiết

---

## 📝 Notes

- Audit logs không bao giờ bị xóa, ngay cả khi syllabus bị xóa
- Tất cả timestamps theo múi giờ server
- IP address và User Agent được ghi lại tự động
- Audit logs giúp compliance và security auditing
