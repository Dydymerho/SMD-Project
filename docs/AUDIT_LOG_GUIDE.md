# Audit Log Feature - Syllabus Management System

## Tổng quan

Tính năng Audit Log giúp theo dõi và ghi lại tất cả các thao tác được thực hiện trên hệ thống quản lý syllabus. Mỗi hành động quan trọng đều được lưu lại với đầy đủ thông tin về người thực hiện, thời gian, địa chỉ IP, và các chi tiết liên quan.

## Các thành phần đã triển khai

### 1. Database Schema

- **Table:** `syllabus_audit_logs`
- **Location:** `/init/init-audit-log.sql`
- **Indexes:** Đã tối ưu cho các truy vấn thường dùng

### 2. Entity Classes

- **SyllabusAuditLog** - Entity chính để lưu trữ audit logs
- **Location:** `entity/SyllabusAuditLog.java`

### 3. Repository

- **SyllabusAuditLogRepository** - Repository với các query methods
- **Location:** `repository/SyllabusAuditLogRepository.java`

### 4. Service Layer

- **AuditLogService** - Service xử lý logic audit logging
- **Location:** `service/AuditLogService.java`

### 5. DTO

- **AuditLogResponse** - DTO để format API response
- **Location:** `dto/AuditLogResponse.java`

### 6. API Endpoints

- Các endpoints đã được thêm vào **SyllabusController**

## Các loại Action được ghi log

### Workflow Actions

- `SUBMIT_FOR_REVIEW` - Giảng viên submit syllabus để review
- `HOD_APPROVE` - Trưởng khoa phê duyệt
- `HOD_REJECT` - Trưởng khoa từ chối
- `AA_APPROVE` - Phòng Đào tạo phê duyệt
- `AA_REJECT` - Phòng Đào tạo từ chối
- `PRINCIPAL_APPROVE` - Hiệu trưởng phê duyệt (xuất bản)
- `PRINCIPAL_REJECT` - Hiệu trưởng từ chối

### PDF Operations

- `UPLOAD_PDF` - Upload file PDF
- `DELETE_PDF` - Xóa file PDF
- `DOWNLOAD_PDF` - Tải file PDF

### CRUD Operations

- `CREATE_SYLLABUS` - Tạo syllabus mới
- `UPDATE_SYLLABUS` - Cập nhật syllabus
- `DELETE_SYLLABUS` - Xóa syllabus

### Version Operations

- `CREATE_VERSION` - Tạo phiên bản mới
- `ARCHIVE` - Lưu trữ syllabus
- `RESTORE` - Khôi phục syllabus

## API Endpoints

### 1. Get Audit Logs for a Syllabus

```http
GET /api/v1/syllabuses/{id}/audit-logs
```

Lấy tất cả audit logs của một syllabus cụ thể.

**Response:**

```json
[
  {
    "id": 1,
    "syllabusId": 123,
    "actionType": "SUBMIT_FOR_REVIEW",
    "performedBy": "lecturer1",
    "performedByRole": "LECTURER",
    "oldStatus": "DRAFT",
    "newStatus": "PENDING_REVIEW",
    "comments": "Ready for review",
    "ipAddress": "192.168.1.100",
    "timestamp": "2026-01-16T10:30:00",
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "academicYear": "2025-2026",
    "versionNo": 1
  }
]
```

### 2. Get Workflow History

```http
GET /api/v1/syllabuses/{id}/workflow-history
```

Lấy lịch sử workflow (chỉ các action submit, approve, reject).

### 3. Get My Audit Logs

```http
GET /api/v1/syllabuses/audit-logs/my-actions
```

Lấy tất cả audit logs của user hiện tại.

### 4. Get Audit Logs by User

```http
GET /api/v1/syllabuses/audit-logs/user/{username}
```

Lấy audit logs của một user cụ thể (dành cho admin).

### 5. Get Recent Audit Logs

```http
GET /api/v1/syllabuses/audit-logs/recent?days=7
```

Lấy audit logs trong N ngày gần đây (mặc định: 7 ngày).

### 6. Get Audit Logs by Date Range

```http
GET /api/v1/syllabuses/audit-logs/date-range?startDate=2026-01-01T00:00:00&endDate=2026-01-31T23:59:59
```

Lấy audit logs trong khoảng thời gian cụ thể.

## Thông tin được lưu trong Audit Log

| Field             | Description                                   |
| ----------------- | --------------------------------------------- |
| `id`              | ID của audit log                              |
| `syllabusId`      | ID của syllabus được thao tác                 |
| `actionType`      | Loại hành động (CREATE, UPDATE, SUBMIT, etc.) |
| `performedBy`     | Username của người thực hiện                  |
| `performedByRole` | Role của người thực hiện                      |
| `oldStatus`       | Trạng thái cũ (nếu có thay đổi status)        |
| `newStatus`       | Trạng thái mới (nếu có thay đổi status)       |
| `comments`        | Ghi chú/comment của người thực hiện           |
| `changedFields`   | JSON string các trường đã thay đổi            |
| `ipAddress`       | Địa chỉ IP của client                         |
| `userAgent`       | Browser/client user agent                     |
| `timestamp`       | Thời gian thực hiện action                    |
| `additionalData`  | Dữ liệu bổ sung (JSON format)                 |

## Cách sử dụng trong Code

### 1. Log một action đơn giản

```java
auditLogService.logAction(
    syllabus,
    SyllabusAuditLog.AuditAction.UPLOAD_PDF.name(),
    username,
    "Uploaded syllabus PDF"
);
```

### 2. Log thay đổi status

```java
auditLogService.logStatusChange(
    syllabus,
    SyllabusAuditLog.AuditAction.HOD_APPROVE.name(),
    username,
    "PENDING_REVIEW",  // old status
    "PENDING_APPROVAL", // new status
    "Looks good, approved"
);
```

### 3. Log với additional data

```java
Map<String, Object> additionalData = new HashMap<>();
additionalData.put("fileName", "syllabus.pdf");
additionalData.put("fileSize", 1024000);

auditLogService.logAction(
    syllabus,
    SyllabusAuditLog.AuditAction.UPLOAD_PDF.name(),
    username,
    null,
    null,
    "Uploaded PDF",
    additionalData
);
```

### 4. Log field changes

```java
Map<String, String> changedFields = new HashMap<>();
changedFields.put("courseName", "old name -> new name");
changedFields.put("credits", "3 -> 4");

auditLogService.logFieldChanges(
    syllabus,
    SyllabusAuditLog.AuditAction.UPDATE_SYLLABUS.name(),
    username,
    changedFields,
    "Updated course information"
);
```

## Database Setup

### 1. Chạy Migration Script

```bash
# Connect to PostgreSQL
psql -U your_username -d your_database

# Run the migration
\i init/init-audit-log.sql
```

### 2. Verify Installation

```sql
-- Check table exists
\dt syllabus_audit_logs

-- Check indexes
\di syllabus_audit_logs*

-- Count records
SELECT COUNT(*) FROM syllabus_audit_logs;
```

## Queries mẫu

### 1. Xem lịch sử workflow của một syllabus

```sql
SELECT
    action_type,
    performed_by,
    performed_by_role,
    old_status,
    new_status,
    comments,
    timestamp
FROM syllabus_audit_logs
WHERE syllabus_id = 1
  AND action_type IN ('SUBMIT_FOR_REVIEW', 'HOD_APPROVE', 'HOD_REJECT',
                      'AA_APPROVE', 'AA_REJECT', 'PRINCIPAL_APPROVE', 'PRINCIPAL_REJECT')
ORDER BY timestamp ASC;
```

### 2. Thống kê action theo user

```sql
SELECT
    performed_by,
    performed_by_role,
    action_type,
    COUNT(*) as action_count
FROM syllabus_audit_logs
GROUP BY performed_by, performed_by_role, action_type
ORDER BY action_count DESC;
```

### 3. Tìm các action trong giờ làm việc

```sql
SELECT *
FROM syllabus_audit_logs
WHERE EXTRACT(HOUR FROM timestamp) BETWEEN 8 AND 17
  AND EXTRACT(DOW FROM timestamp) BETWEEN 1 AND 5
ORDER BY timestamp DESC;
```

### 4. Audit report theo tháng

```sql
SELECT
    TO_CHAR(timestamp, 'YYYY-MM') as month,
    action_type,
    COUNT(*) as total_actions
FROM syllabus_audit_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month, action_type
ORDER BY month DESC, total_actions DESC;
```

## Best Practices

1. **Không bao giờ xóa audit logs** - Đây là dữ liệu quan trọng cho compliance và troubleshooting

2. **Regular backups** - Backup audit logs riêng biệt với dữ liệu chính

3. **Monitoring** - Theo dõi kích thước bảng và performance của các query

4. **Retention policy** - Xem xét archive logs cũ hơn 1-2 năm vào cold storage

5. **Privacy** - Cẩn thận với thông tin nhạy cảm trong comments và additionalData

## Troubleshooting

### Audit log không được tạo

- Kiểm tra xem AuditLogService có được inject đúng không
- Xem logs để tìm exceptions
- Verify database connection và permissions

### Performance issues

- Kiểm tra indexes có được tạo đầy đủ không
- Consider partitioning table theo timestamp nếu có quá nhiều records
- Review và optimize queries

### Missing data

- Audit logging sử dụng `REQUIRES_NEW` transaction propagation để đảm bảo logs được lưu ngay cả khi transaction chính fail
- Nếu vẫn thiếu data, check application logs

## Tích hợp với Frontend

Frontend có thể hiển thị audit logs dưới dạng:

- Timeline view cho workflow history
- Activity feed cho user actions
- Detailed audit trail cho compliance reports
- Filtered views theo action type, user, date range

## Security Considerations

- Audit logs chứa thông tin nhạy cảm (IP addresses, user actions)
- Hạn chế quyền truy cập endpoints audit logs
- Consider implementing role-based access control
- Log retention phải tuân thủ GDPR và các quy định về privacy

## Future Enhancements

- [ ] Export audit logs to CSV/Excel
- [ ] Real-time notifications for critical actions
- [ ] Advanced filtering and search capabilities
- [ ] Dashboard với charts và statistics
- [ ] Integration với external audit systems
- [ ] Automated compliance reports
