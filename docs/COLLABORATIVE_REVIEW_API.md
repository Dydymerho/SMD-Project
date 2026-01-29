# Collaborative Review API Documentation

## 📋 Tổng quan

Tài liệu này mô tả các API endpoint cho tính năng Collaborative Review đã được nâng cấp, bao gồm:

- ✏️ Chỉnh sửa phản hồi (Edit Comment)
- 💬 Thảo luận đa cấp (Reply/Thread)
- ✅ Trạng thái giải quyết (Resolve/Close)
- 🎯 Gắn ngữ cảnh cụ thể (Contextual Comments)

## 🔑 Base URL

```
/api/syllabuses/{syllabusId}/comments
```

---

## 1️⃣ Chỉnh sửa phản hồi (Edit Comment)

### PUT `/api/syllabuses/{syllabusId}/comments/{commentId}`

Chỉnh sửa nội dung của comment. Chỉ người tạo comment mới có quyền chỉnh sửa.

**Request Body:**

```json
{
  "content": "Nội dung comment đã được cập nhật"
}
```

**Response (200 OK):**

```json
{
  "commentId": 123,
  "syllabusId": 456,
  "userId": 789,
  "userName": "Nguyen Van A",
  "content": "Nội dung comment đã được cập nhật",
  "createdAt": "2026-01-29T10:00:00",
  "editedAt": "2026-01-29T14:30:00",
  "isEdited": true,
  "status": "OPEN",
  "replyCount": 2
}
```

**Lỗi có thể xảy ra:**

- `403 Forbidden`: Không phải chủ sở hữu comment
- `404 Not Found`: Comment không tồn tại

---

## 2️⃣ Thảo luận đa cấp (Reply/Thread)

### POST `/api/syllabuses/{syllabusId}/comments/{commentId}/replies`

Trả lời một comment để tạo thảo luận đa cấp.

**Request Body:**

```json
{
  "content": "Tôi đồng ý với quan điểm này..."
}
```

**Response (201 Created):**

```json
{
  "commentId": 124,
  "parentCommentId": 123,
  "syllabusId": 456,
  "userId": 790,
  "userName": "Tran Thi B",
  "content": "Tôi đồng ý với quan điểm này...",
  "createdAt": "2026-01-29T14:35:00",
  "isEdited": false,
  "status": "OPEN",
  "replyCount": 0
}
```

### GET `/api/syllabuses/{syllabusId}/comments/{commentId}/replies`

Lấy tất cả replies của một comment.

**Query Parameters:**

- `page` (default: 0): Số trang
- `size` (default: 10): Kích thước trang

**Response (200 OK):**

```json
{
  "content": [
    {
      "commentId": 124,
      "parentCommentId": 123,
      "content": "Reply 1...",
      "userName": "User A"
    },
    {
      "commentId": 125,
      "parentCommentId": 123,
      "content": "Reply 2...",
      "userName": "User B"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

---

## 3️⃣ Trạng thái giải quyết (Resolve/Close)

### PATCH `/api/syllabuses/{syllabusId}/comments/{commentId}/resolve`

Cập nhật trạng thái của comment. Chỉ HoD, Syllabus owner, hoặc Admin mới có quyền.

**Request Body:**

```json
{
  "status": "RESOLVED",
  "resolutionNote": "Đã cập nhật theo góp ý"
}
```

**Status Values:**

- `OPEN`: Chưa xử lý
- `RESOLVED`: Đã giải quyết
- `CLOSED`: Đóng (không cần xử lý)

**Response (200 OK):**

```json
{
  "commentId": 123,
  "status": "RESOLVED",
  "resolvedById": 789,
  "resolvedByName": "Nguyen Van A",
  "resolvedAt": "2026-01-29T15:00:00",
  "resolutionNote": "Đã cập nhật theo góp ý"
}
```

### GET `/api/syllabuses/{syllabusId}/comments/status/{status}`

Lọc comments theo trạng thái.

**Path Parameters:**

- `status`: OPEN | RESOLVED | CLOSED

**Query Parameters:**

- `page` (default: 0)
- `size` (default: 20)

**Response (200 OK):**

```json
{
  "content": [...],
  "totalElements": 12,
  "totalPages": 1
}
```

### GET `/api/syllabuses/{syllabusId}/comments/unresolved-count`

Đếm số lượng comments chưa giải quyết.

**Response (200 OK):**

```json
8
```

---

## 4️⃣ Gắn ngữ cảnh cụ thể (Contextual Comments)

### POST `/api/syllabuses/{syllabusId}/comments`

Tạo comment với context cụ thể.

**Request Body:**

```json
{
  "content": "CLO này cần rõ ràng hơn về mặt đo lường",
  "contextType": "CLO",
  "contextId": 45,
  "contextSection": "CLO 1.2"
}
```

**Context Types:**

- `SYLLABUS_GENERAL`: Comment chung cho toàn bộ đề cương
- `CLO`: Comment trên Course Learning Outcome
- `PLO`: Comment trên Program Learning Outcome
- `ASSESSMENT`: Comment trên Assessment
- `MATERIAL`: Comment trên Material/Tài liệu
- `SESSION_PLAN`: Comment trên Session Plan/Kế hoạch tuần

**Response (201 Created):**

```json
{
  "commentId": 126,
  "content": "CLO này cần rõ ràng hơn về mặt đo lường",
  "contextType": "CLO",
  "contextId": 45,
  "contextSection": "CLO 1.2"
}
```

### GET `/api/syllabuses/{syllabusId}/comments/context`

Lọc comments theo context.

**Query Parameters:**

- `contextType` (optional): Loại context (CLO, ASSESSMENT, etc.)
- `contextId` (optional): ID cụ thể của entity
- `page` (default: 0)
- `size` (default: 20)

**Examples:**

1. Lấy tất cả comments trên CLOs:

```
GET /api/syllabuses/456/comments/context?contextType=CLO
```

2. Lấy comments trên CLO cụ thể:

```
GET /api/syllabuses/456/comments/context?contextType=CLO&contextId=45
```

3. Lấy comments trên tất cả Assessments:

```
GET /api/syllabuses/456/comments/context?contextType=ASSESSMENT
```

**Response (200 OK):**

```json
{
  "content": [
    {
      "commentId": 126,
      "contextType": "CLO",
      "contextId": 45,
      "contextSection": "CLO 1.2",
      "content": "...",
      "replyCount": 3
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

## 📊 Các API hiện có (đã có từ trước)

### GET `/api/syllabuses/{syllabusId}/comments`

Lấy tất cả comments (có phân trang)

### GET `/api/syllabuses/{syllabusId}/comments/all`

Lấy tất cả comments (không phân trang)

### GET `/api/syllabuses/{syllabusId}/comments/recent`

Lấy 5 comments gần nhất

### GET `/api/syllabuses/{syllabusId}/comments/count`

Đếm tổng số comments

### DELETE `/api/syllabuses/{syllabusId}/comments/{commentId}`

Xóa comment (chỉ owner hoặc admin)

---

## 🔒 Phân quyền (Permissions)

| Hành động       | Owner         | HoD | Admin | Reviewer |
| --------------- | ------------- | --- | ----- | -------- |
| Tạo comment     | ✅            | ✅  | ✅    | ✅       |
| Edit comment    | ✅ (của mình) | ❌  | ❌    | ❌       |
| Reply comment   | ✅            | ✅  | ✅    | ✅       |
| Resolve comment | ✅            | ✅  | ✅    | ❌       |
| Delete comment  | ✅ (của mình) | ❌  | ✅    | ❌       |

---

## 💡 Use Cases

### Use Case 1: Bình luận trên CLO cụ thể

```bash
# 1. Tạo comment trên CLO
POST /api/syllabuses/456/comments
{
  "content": "CLO 1.2 chưa rõ về tiêu chí đánh giá",
  "contextType": "CLO",
  "contextId": 12,
  "contextSection": "CLO 1.2"
}

# 2. Giảng viên khác reply
POST /api/syllabuses/456/comments/127/replies
{
  "content": "Tôi đề xuất thêm rubric chi tiết"
}

# 3. HoD resolve sau khi cập nhật
PATCH /api/syllabuses/456/comments/127/resolve
{
  "status": "RESOLVED",
  "resolutionNote": "Đã thêm rubric vào CLO 1.2"
}
```

### Use Case 2: Xem tất cả góp ý chưa giải quyết

```bash
# 1. Kiểm tra số lượng unresolved
GET /api/syllabuses/456/comments/unresolved-count

# 2. Lấy danh sách comments OPEN
GET /api/syllabuses/456/comments/status/OPEN?page=0&size=20

# 3. Xử lý từng comment và resolve
PATCH /api/syllabuses/456/comments/{id}/resolve
{
  "status": "RESOLVED"
}
```

### Use Case 3: Chỉnh sửa comment

```bash
# 1. Tạo comment
POST /api/syllabuses/456/comments
{
  "content": "Nội dung ban đầu"
}

# 2. Edit comment (trong vòng 24h)
PUT /api/syllabuses/456/comments/128
{
  "content": "Nội dung đã được sửa lại"
}
```

---

## 🚀 Migration Guide

### Chạy Migration Script

```bash
# Script sẽ tự động chạy khi khởi động ứng dụng (Flyway)
# Hoặc chạy thủ công:
psql -U username -d database_name -f V3__add_collaborative_review_features.sql
```

### Kiểm tra Migration

```sql
-- Kiểm tra các cột mới đã được thêm
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'review_comment';

-- Kiểm tra indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'review_comment';
```

---

## 📝 Notes

1. **Thread Depth**: Hệ thống hỗ trợ 1 cấp reply (parent → child), không hỗ trợ nested replies sâu hơn
2. **Edit History**: System lưu `editedAt` và `isEdited` flag, nhưng không lưu lịch sử các lần edit
3. **Soft Delete**: Comments có thể được xóa vĩnh viễn, replies sẽ bị xóa cascade
4. **Notifications**: Tất cả actions (create, reply, resolve) đều trigger notification
5. **Context Validation**: Hệ thống không validate `contextId` có tồn tại hay không

---

## 🧪 Testing với Postman/cURL

### Example: Create contextual comment

```bash
curl -X POST http://localhost:8080/api/syllabuses/1/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Assessment này cần điều chỉnh tỷ trọng",
    "contextType": "ASSESSMENT",
    "contextId": 5,
    "contextSection": "Midterm Exam"
  }'
```

### Example: Resolve comment

```bash
curl -X PATCH http://localhost:8080/api/syllabuses/1/comments/123/resolve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "resolutionNote": "Đã điều chỉnh tỷ trọng từ 30% xuống 25%"
  }'
```

---

## 📚 Related Documentation

- [API Endpoints](./API_ENDPOINTS.md)
- [Workflow Guide](./WORKFLOW_GUIDE.md)
- [Notification System](./NOTIFICATION_SYSTEM.md)
