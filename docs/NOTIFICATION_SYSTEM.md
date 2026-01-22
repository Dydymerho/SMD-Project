# Notification System Implementation

## Overview

Tính năng notification đã được triển khai thành công cho hệ thống SMD. Notification sẽ tự động được gửi khi có các sự kiện workflow chuyển đổi trạng thái syllabus.

## Files Created

### 1. Entity Layer

- **[Notification.java](core-service/src/main/java/com/smd/core/entity/Notification.java)**
  - Entity chứa thông tin notification
  - 11 loại notification types (SYLLABUS_SUBMITTED, SYLLABUS_APPROVED_BY_HOD, etc.)
  - Quan hệ với User (recipient) và Syllabus

### 2. DTO Layer

- **[NotificationResponse.java](core-service/src/main/java/com/smd/core/dto/NotificationResponse.java)**
  - DTO response cho notification API
  - Bao gồm thông tin syllabus liên quan
  - Static factory method `fromEntity()`

- **[NotificationStats.java](core-service/src/main/java/com/smd/core/dto/NotificationStats.java)**
  - DTO cho thống kê notifications
  - Hiển thị: total unread, pending reviews, pending approvals, rejected syllabuses

### 3. Repository Layer

- **[NotificationRepository.java](core-service/src/main/java/com/smd/core/repository/NotificationRepository.java)**
  - JPA Repository với các query methods
  - Find by user, unread status, type
  - Mark as read operations
  - Delete old notifications

### 4. Service Layer

- **[NotificationService.java](core-service/src/main/java/com/smd/core/service/NotificationService.java)**
  - Business logic cho notification system
  - Các methods:
    - `notifySyllabusSubmitted()` - Notify HOD khi lecturer submit
    - `notifyHODApproved()` - Notify lecturer và AA khi HOD approve
    - `notifyHODRejected()` - Notify lecturer khi HOD reject
    - `notifyAAApproved()` - Notify lecturer và Principal khi AA approve
    - `notifyAARejected()` - Notify lecturer khi AA reject
    - `notifySyllabusPublished()` - Notify lecturer khi Principal publish
    - `notifyPrincipalRejected()` - Notify lecturer khi Principal reject
    - `getUserNotifications()` - Get paginated notifications
    - `getUnreadNotifications()` - Get unread only
    - `markAsRead()` - Mark single notification
    - `markAllAsRead()` - Mark all as read
    - `getNotificationStats()` - Get statistics
    - `deleteOldNotifications()` - Cleanup job

### 5. Controller Layer

- **[NotificationController.java](core-service/src/main/java/com/smd/core/controller/NotificationController.java)**
  - REST API endpoints:
    - `GET /api/v1/notifications` - Get paginated notifications
    - `GET /api/v1/notifications/unread` - Get unread notifications
    - `GET /api/v1/notifications/stats` - Get statistics
    - `PUT /api/v1/notifications/{id}/read` - Mark as read
    - `PUT /api/v1/notifications/read-all` - Mark all as read

### 6. Database Migration

- **[init-notification.sql](core-service/init/init-notification.sql)**
  - Create `notifications` table
  - Indexes for performance optimization
  - Check constraints for notification types

### 7. Integration

- **[WorkflowService.java](core-service/src/main/java/com/smd/core/service/WorkflowService.java)** (Updated)
  - Integrated NotificationService
  - Automatic notifications on all workflow transitions:
    - Submit for review → Notify HOD
    - HOD approve → Notify lecturer & AA
    - HOD reject → Notify lecturer
    - AA approve → Notify lecturer & Principal
    - AA reject → Notify lecturer
    - Principal approve → Notify lecturer
    - Principal reject → Notify lecturer

## Workflow Notification Flow

```
LECTURER submits → HOD receives notification
    ↓
HOD approves → LECTURER & ACADEMIC_AFFAIRS receive notifications
HOD rejects → LECTURER receives notification
    ↓
AA approves → LECTURER & PRINCIPAL receive notifications
AA rejects → LECTURER receives notification
    ↓
PRINCIPAL approves → LECTURER receives notification (Published!)
PRINCIPAL rejects → LECTURER receives notification
```

## API Usage Examples

### 1. Get User Notifications (Paginated)

```bash
GET /api/v1/notifications?page=0&size=20
Authorization: Bearer <token>

Response:
{
  "content": [...],
  "pageable": {...},
  "totalElements": 45,
  "totalPages": 3
}
```

### 2. Get Unread Notifications

```bash
GET /api/v1/notifications/unread
Authorization: Bearer <token>

Response: [
  {
    "notificationId": 1,
    "type": "SYLLABUS_SUBMITTED",
    "title": "New Syllabus Submitted for Review",
    "message": "Syllabus for Introduction to Programming (CS101) v1 has been submitted...",
    "isRead": false,
    "syllabusId": 5,
    "courseName": "Introduction to Programming",
    "courseCode": "CS101",
    ...
  }
]
```

### 3. Get Notification Statistics

```bash
GET /api/v1/notifications/stats
Authorization: Bearer <token>

Response:
{
  "totalUnread": 12,
  "pendingReviews": 3,
  "pendingApprovals": 2,
  "rejectedSyllabuses": 1
}
```

### 4. Mark Notification as Read

```bash
PUT /api/v1/notifications/5/read
Authorization: Bearer <token>

Response: 204 No Content
```

### 5. Mark All Notifications as Read

```bash
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>

Response: 204 No Content
```

## Database Schema

```sql
Table: notifications
- notification_id: BIGSERIAL PRIMARY KEY
- user_id: BIGINT (FK to users)
- syllabus_id: BIGINT (FK to syllabuses, optional)
- type: VARCHAR(50) - notification type enum
- title: VARCHAR(255)
- message: TEXT
- is_read: BOOLEAN (default false)
- read_at: TIMESTAMP
- action_url: VARCHAR(500)
- triggered_by: VARCHAR(100)
- created_at: TIMESTAMP

Indexes:
- idx_notifications_user_id
- idx_notifications_syllabus_id
- idx_notifications_is_read
- idx_notifications_created_at
- idx_notifications_type
- idx_notifications_user_unread (composite)
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Execute the init script
psql -U postgres -d smd_db -f core-service/init/init-notification.sql
```

### 2. Rebuild Application

```bash
cd core-service
./mvnw clean install
```

### 3. Restart Services

```bash
# Docker
docker-compose down
docker-compose up -d

# Or manual
./mvnw spring-boot:run
```

## Testing

### Test Notification Flow

1. Login as LECTURER
2. Create and submit a syllabus
3. Login as HOD → Check notifications endpoint
4. Approve the syllabus
5. Login back as LECTURER → Check notification
6. Login as ACADEMIC_AFFAIRS → Check notification
7. Continue the workflow...

### Test API Endpoints

```bash
# Get unread notifications
curl -X GET http://localhost:8080/api/v1/notifications/unread \
  -H "Authorization: Bearer <token>"

# Get stats
curl -X GET http://localhost:8080/api/v1/notifications/stats \
  -H "Authorization: Bearer <token>"

# Mark as read
curl -X PUT http://localhost:8080/api/v1/notifications/1/read \
  -H "Authorization: Bearer <token>"
```

## Next Steps / Future Enhancements

### Phase 1 (Completed) ✅

- ✅ Database schema and entity
- ✅ Repository layer
- ✅ Service layer with all notification methods
- ✅ REST API endpoints
- ✅ Integration with WorkflowService

### Phase 2 (Optional - Future)

- [ ] WebSocket for real-time notifications
- [ ] Email notifications
- [ ] Push notifications for mobile app
- [ ] Notification preferences per user
- [ ] Notification templates
- [ ] Scheduled notifications (deadline reminders)
- [ ] Notification grouping
- [ ] Mark as read on view (auto-read)

## Notes

1. **Auto Notification**: Notifications are automatically created when workflow state changes
2. **Security**: Only notification recipients can mark them as read
3. **Performance**: Indexed queries for fast retrieval
4. **Cleanup**: Use `deleteOldNotifications()` in scheduled job to clean old notifications
5. **Extensibility**: Easy to add new notification types by adding enum values

## Troubleshooting

### Notifications not appearing

- Check if NotificationService is properly autowired in WorkflowService
- Verify database table exists with correct schema
- Check logs for any exceptions during notification creation

### Permission errors

- Ensure user has proper authentication
- Verify user exists in database
- Check role assignments

### Performance issues

- Add more indexes if needed
- Implement pagination for large result sets
- Consider caching for frequently accessed data

## Contact

For any issues or questions, please contact the development team.
