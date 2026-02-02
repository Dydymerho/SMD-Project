# Course Relationship Management - Quản lý cây quan hệ môn học

## Tổng quan

Tính năng quản lý quan hệ giữa các môn học, hỗ trợ:

- **Prerequisites**: Môn học tiên quyết (phải học trước)
- **Corequisites**: Môn học song hành (học cùng lúc)
- **Equivalents**: Môn học tương đương

## Kiến trúc

```
CourseRelationController
    ↓
CourseRelationService
    ↓
CourseRelationRepository
    ↓
CourseRelation Entity
```

## API Endpoints

### 1. Tạo quan hệ

```http
POST /api/v1/course-relations
Authorization: Bearer {token}
Content-Type: application/json

{
  "courseId": 2,
  "relatedCourseId": 1,
  "relationType": "PREREQUISITE"
}
```

**Relation Types:**

- `PREREQUISITE`: Môn học tiên quyết
- `COREQUISITE`: Môn học song hành
- `EQUIVALENT`: Môn tương đương

**Response:**

```json
{
  "relationId": 1,
  "courseId": 2,
  "courseCode": "CS202",
  "courseName": "Data Structures",
  "relatedCourseId": 1,
  "relatedCourseCode": "CS101",
  "relatedCourseName": "Programming Fundamentals",
  "relationType": "PREREQUISITE"
}
```

### 2. Lấy tất cả relationships của môn học

```http
GET /api/v1/course-relations/course/{courseId}
```

### 3. Lấy cây quan hệ

```http
GET /api/v1/course-relations/tree/{courseId}
```

**Response Example:**

```json
{
  "courseId": 2,
  "courseCode": "CS202",
  "courseName": "Data Structures",
  "credits": 3,
  "courseType": "BAT_BUOC",
  "level": 0,
  "prerequisites": [
    {
      "courseId": 1,
      "courseCode": "CS101",
      "courseName": "Programming Fundamentals",
      "credits": 4,
      "level": 1,
      "prerequisites": [
        {
          "courseId": 50,
          "courseCode": "MATH101",
          "courseName": "Discrete Math",
          "credits": 3,
          "level": 2,
          "prerequisites": []
        }
      ]
    }
  ],
  "corequisites": [],
  "equivalents": []
}
```

### 4. Kiểm tra circular dependency

```http
GET /api/v1/course-relations/check-circular?courseId=1&relatedCourseId=2
```

**Response:**

```json
{
  "hasCircularDependency": false
}
```

### 5. Lấy danh sách môn có thể làm prerequisite

```http
GET /api/v1/course-relations/available-prerequisites/{courseId}
```

Trả về danh sách các môn học:

- Trong cùng department
- Chưa là prerequisite
- Không tạo vòng lặp

### 6. Thống kê relationships

```http
GET /api/v1/course-relations/statistics/department/{departmentId}
```

**Response:**

```json
{
  "totalRelationships": 25,
  "byType": {
    "PREREQUISITE": 18,
    "COREQUISITE": 5,
    "EQUIVALENT": 2
  }
}
```

### 7. Xóa relationship

```http
DELETE /api/v1/course-relations/{relationId}
Authorization: Bearer {token}
```

## Thuật toán

### 1. Xây dựng cây (DFS - Depth First Search)

```java
private CourseTreeNodeDto buildCourseTree(Long courseId, Set<Long> visited, int level) {
    // 1. Kiểm tra visited để tránh vòng lặp
    if (visited.contains(courseId)) {
        return null;
    }
    visited.add(courseId);

    // 2. Tạo node hiện tại
    CourseTreeNodeDto node = createNode(courseId, level);

    // 3. Đệ quy build cho prerequisites
    node.setPrerequisites(buildPrerequisites(courseId, visited, level + 1));

    // 4. Đệ quy build cho corequisites
    node.setCorequisites(buildCorequisites(courseId, visited, level + 1));

    return node;
}
```

### 2. Kiểm tra vòng lặp (DFS)

```java
private boolean dfsCheckCycle(Long currentId, Long targetId, Set<Long> visited) {
    if (currentId.equals(targetId)) {
        return true; // Tìm thấy vòng lặp!
    }

    if (visited.contains(currentId)) {
        return false;
    }
    visited.add(currentId);

    // Kiểm tra đệ quy cho tất cả prerequisites
    for (CourseRelation rel : getPrerequisites(currentId)) {
        if (dfsCheckCycle(rel.getRelatedCourse().getId(), targetId, visited)) {
            return true;
        }
    }

    return false;
}
```

## Validation Rules

1. **Không self-reference**: Môn học không thể có relationship với chính nó
2. **No circular dependencies**: Không được tạo vòng lặp
   - Ví dụ không hợp lệ: A → B → C → A
3. **No duplicates**: Mỗi cặp (course, relatedCourse, type) là duy nhất
4. **Same department**: Prerequisites nên trong cùng department (recommended)

## Use Cases

### Use Case 1: Sinh viên kiểm tra môn học cần học trước

```
Student clicks on "Data Structures"
→ GET /api/v1/course-relations/tree/2
→ Hiển thị: Cần học "Programming Fundamentals" trước
→ Nếu chưa học, không thể đăng ký
```

### Use Case 2: Admin tạo curriculum

```
1. Admin tạo course "Advanced Algorithms"
2. Chọn prerequisite "Data Structures"
3. System kiểm tra circular dependency
4. Nếu OK → POST /api/v1/course-relations
```

### Use Case 3: Hiển thị lộ trình học tập

```
GET /api/v1/course-relations/tree/{programId}
→ Tạo visualization cây môn học
→ Sinh viên thấy roadmap từ năm 1 → năm 4
```

## Testing

Chạy test script:

```powershell
cd scripts
.\test-course-relationships.ps1
```

## Roles & Permissions

- **ADMIN**: Full access
- **CURRICULUM_MANAGER**: Tạo, sửa, xóa relationships
- **DEPARTMENT_HEAD**: Quản lý relationships trong department
- **TEACHER**: Chỉ xem
- **STUDENT**: Chỉ xem

## Database Schema

```sql
CREATE TABLE course_relation (
    relation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    related_course_id BIGINT NOT NULL,
    relation_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (related_course_id) REFERENCES course(course_id),
    UNIQUE KEY uk_course_relation (course_id, related_course_id, relation_type)
);

CREATE INDEX idx_course_id ON course_relation(course_id);
CREATE INDEX idx_related_course_id ON course_relation(related_course_id);
CREATE INDEX idx_relation_type ON course_relation(relation_type);
```

## Performance Considerations

1. **Caching**: Cache course trees với Redis
2. **Lazy Loading**: Chỉ load khi cần
3. **Pagination**: Với programs lớn, phân trang results
4. **Indexing**: Index trên course_id, related_course_id, relation_type

## Future Enhancements

- [ ] Visualize course tree dạng graph interactive
- [ ] Recommend optimal học sequence cho sinh viên
- [ ] Import/Export curriculum structure
- [ ] Validate với academic calendar
- [ ] Integration với student registration system
- [ ] AI suggest prerequisites based on course content

## Troubleshooting

### Lỗi: "Creating this relationship would cause a circular dependency"

**Nguyên nhân**: Đang cố tạo vòng lặp
**Giải pháp**: Review lại cấu trúc curriculum, remove relationships không cần thiết

### Lỗi: "Relationship already exists"

**Nguyên nhân**: Đã có relationship giống hệt
**Giải pháp**: Check existing relationships trước khi tạo mới

## Contact

- Backend Team
- Email: backend@university.edu.vn
