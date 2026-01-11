# Syllabus Workflow Documentation

## Tổng quan Workflow

Workflow phê duyệt syllabus gồm 4 trạng thái chính:

```
DRAFT → PENDING_REVIEW → PENDING_APPROVAL → PUBLISHED
   ↑          |                |
   └──────────┴────────────────┘
     (Rejection paths)
```

## Các trạng thái (Status)

1. **DRAFT**: Syllabus đang được soạn thảo bởi Lecturer
2. **PENDING_REVIEW**: Chờ HOD (Head of Department) xem xét
3. **PENDING_APPROVAL**: Chờ AA (Academic Affairs) phê duyệt cuối cùng
4. **PUBLISHED**: Đã được xuất bản và có hiệu lực
5. **ARCHIVED**: Đã lưu trữ (không còn sử dụng)

## Quyền hạn theo Role

### LECTURER (Giảng viên)

- Tạo syllabus mới (status: DRAFT)
- Submit syllabus để HOD xem xét: `DRAFT → PENDING_REVIEW`
- Chỉ có thể submit syllabus của chính mình
- Xem danh sách syllabus của riêng mình theo status

### HEAD_OF_DEPARTMENT (Trưởng khoa)

- Xem tất cả syllabus trong khoa theo status
- Phê duyệt syllabus: `PENDING_REVIEW → PENDING_APPROVAL`
- Từ chối và trả về cho Lecturer: `PENDING_REVIEW → DRAFT`
- Phải có comment khi từ chối

### ACADEMIC_AFFAIRS (Phòng Đào tạo)

- Xem tất cả syllabus trong trường theo status
- Phê duyệt để xuất bản: `PENDING_APPROVAL → PUBLISHED`
- Từ chối và trả về cho HOD: `PENDING_APPROVAL → PENDING_REVIEW`
- Phải có comment khi từ chối

### ADMIN

- Có quyền xem tất cả syllabus
- Không tham gia workflow phê duyệt

## API Endpoints

### 1. Submit for Review (LECTURER)

```
POST /api/v1/syllabuses/{id}/submit-for-review
Authorization: Bearer <lecturer_token>

Body (optional):
{
  "comment": "Please review my syllabus"
}

Response:
{
  "syllabusId": 1,
  "previousStatus": "DRAFT",
  "newStatus": "PENDING_REVIEW",
  "actionBy": "lecturer1",
  "action": "SUBMIT",
  "comment": "Please review my syllabus",
  "actionTime": "2024-01-06T10:30:00",
  "message": "Syllabus submitted for HOD review successfully"
}
```

### 2. HOD Approve (HEAD_OF_DEPARTMENT)

```
POST /api/v1/syllabuses/{id}/hod-approve
Authorization: Bearer <hod_token>

Body (optional):
{
  "comment": "Approved, looks good"
}

Response:
{
  "syllabusId": 1,
  "previousStatus": "PENDING_REVIEW",
  "newStatus": "PENDING_APPROVAL",
  "actionBy": "hod1",
  "action": "APPROVE",
  "comment": "Approved, looks good",
  "actionTime": "2024-01-06T11:00:00",
  "message": "Syllabus approved by HOD, now pending Academic Affairs approval"
}
```

### 3. HOD Reject (HEAD_OF_DEPARTMENT)

```
POST /api/v1/syllabuses/{id}/hod-reject
Authorization: Bearer <hod_token>

Body (optional):
{
  "comment": "Need more details"
}

Response:
{
  "syllabusId": 1,
  "previousStatus": "PENDING_REVIEW",
  "newStatus": "DRAFT",
  "actionBy": "hod1",
  "action": "REJECT",
  "comment": "Need more details",
  "actionTime": "2024-01-06T11:00:00",
  "message": "Syllabus rejected by HOD, returned to DRAFT for revision"
}
```

### 4. AA Approve (ACADEMIC_AFFAIRS)

```
POST /api/v1/syllabuses/{id}/aa-approve
Authorization: Bearer <aa_token>

Body (optional):
{
  "comment": "Approved for publication"
}

Response:
{
  "syllabusId": 1,
  "previousStatus": "PENDING_APPROVAL",
  "newStatus": "PUBLISHED",
  "actionBy": "aa1",
  "action": "PUBLISH",
  "comment": "Approved for publication",
  "actionTime": "2024-01-06T14:00:00",
  "message": "Syllabus published successfully by Academic Affairs"
}
```

### 5. AA Reject (ACADEMIC_AFFAIRS)

```
POST /api/v1/syllabuses/{id}/aa-reject
Authorization: Bearer <aa_token>

Body (optional):
{
  "comment": "Assessment needs revision"
}

Response:
{
  "syllabusId": 1,
  "previousStatus": "PENDING_APPROVAL",
  "newStatus": "PENDING_REVIEW",
  "actionBy": "aa1",
  "action": "REJECT",
  "comment": "Assessment needs revision",
  "actionTime": "2024-01-06T14:00:00",
  "message": "Syllabus rejected by Academic Affairs, returned to PENDING_REVIEW"
}
```

### 6. Get Syllabuses by Status

```
GET /api/v1/syllabuses/by-status/{status}
Authorization: Bearer <token>

Parameters:
- status: DRAFT | PENDING_REVIEW | PENDING_APPROVAL | PUBLISHED | ARCHIVED

Response: List of syllabuses filtered by user role
```

### 7. Get Workflow History

```
GET /api/v1/syllabuses/{id}/workflow-history
Authorization: Bearer <token>

Response:
[
  {
    "historyId": 1,
    "action": "SUBMIT",
    "comment": "Please review",
    "actionTime": "2024-01-06T10:30:00",
    "actionBy": {
      "userId": 2,
      "username": "lecturer1",
      "fullName": "John Doe"
    },
    "workflowStep": {
      "stepId": 2,
      "stepName": "Pending Review",
      "stepOrder": 2
    }
  },
  ...
]
```

## Workflow Rules

### Validation Rules

1. **Submit for Review**:

   - Chỉ LECTURER mới có thể submit
   - Chỉ submit được syllabus của chính mình
   - Syllabus phải ở trạng thái DRAFT

2. **HOD Approve**:

   - Chỉ HEAD_OF_DEPARTMENT mới có thể approve
   - Syllabus phải ở trạng thái PENDING_REVIEW

3. **HOD Reject**:

   - Chỉ HEAD_OF_DEPARTMENT mới có thể reject
   - Syllabus phải ở trạng thái PENDING_REVIEW
   - Trả về trạng thái DRAFT

4. **AA Approve**:

   - Chỉ ACADEMIC_AFFAIRS mới có thể approve
   - Syllabus phải ở trạng thái PENDING_APPROVAL
   - Chuyển sang PUBLISHED và set publishedAt timestamp

5. **AA Reject**:
   - Chỉ ACADEMIC_AFFAIRS mới có thể reject
   - Syllabus phải ở trạng thái PENDING_APPROVAL
   - Trả về trạng thái PENDING_REVIEW (để HOD xem lại)

### Error Handling

- **401 Unauthorized**: Không có token hoặc token không hợp lệ
- **403 Forbidden**: Không có quyền thực hiện hành động (role không đúng)
- **404 Not Found**: Syllabus không tồn tại
- **400 Bad Request**: Trạng thái không hợp lệ hoặc dữ liệu không đúng

## Database Schema

### syllabus_workflow_history Table

```sql
CREATE TABLE syllabus_workflow_history (
    history_id BIGSERIAL PRIMARY KEY,
    syllabus_id BIGINT NOT NULL REFERENCES syllabus(syllabus_id),
    step_id BIGINT NOT NULL REFERENCES workflow_step(step_id),
    action_by BIGINT NOT NULL REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL,  -- SUBMIT, APPROVE, REJECT, PUBLISH
    comment TEXT,
    action_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### workflow_step Table

```sql
CREATE TABLE workflow_step (
    step_id BIGSERIAL PRIMARY KEY,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL
);
```

## Testing

Sử dụng script test:

```powershell
cd scripts
.\test-workflow.ps1
```

Script sẽ:

1. Login với 3 users: lecturer, hod, aa
2. Tạo draft syllabus
3. Submit for review
4. HOD approve
5. AA approve và publish
6. Xem workflow history

## Notes

- Mỗi chuyển đổi trạng thái được lưu lại trong `syllabus_workflow_history`
- Comment là optional nhưng nên có khi reject
- Workflow history được sắp xếp theo thời gian giảm dần
- Filter theo role được áp dụng khi xem danh sách theo status
