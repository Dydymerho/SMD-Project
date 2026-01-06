# Hướng dẫn Quản lý Quyền (Role Management)

## 📋 Tổng quan

Hệ thống sử dụng 3 bảng để quản lý quyền:

- **`role`**: Lưu danh sách các quyền (ADMIN, LECTURER, HEAD_OF_DEPARTMENT, ACADEMIC_AFFAIRS, STUDENT)
- **`user`**: Lưu thông tin người dùng
- **`user_role`**: Bảng liên kết giữa user và role (many-to-many)

## 🔐 Các Quyền Mặc Định

1. **ADMIN**: Quản trị viên - có toàn quyền trong hệ thống
2. **LECTURER**: Giảng viên - quản lý syllabuses của mình
3. **HEAD_OF_DEPARTMENT**: Trưởng khoa - quản lý syllabuses trong khoa
4. **ACADEMIC_AFFAIRS**: Phòng Đào tạo - quản lý và phê duyệt syllabuses
5. **STUDENT**: Sinh viên - xem syllabuses đã được publish

## 🚀 Cách Khởi Tạo Roles

### Phương pháp 1: Sử dụng API (Khuyến nghị)

```bash
# 1. Khởi tạo các role mặc định
POST http://localhost:8080/api/v1/roles/initialize

# 2. Xem danh sách roles
GET http://localhost:8080/api/v1/roles
```

### Phương pháp 2: Chạy SQL Script

```bash
# Chạy trong Docker container
docker exec -i smd_postgres psql -U root -d smd_db < init-roles.sql

# Hoặc connect trực tiếp và paste SQL
psql -U root -d smd_db
# Paste nội dung file init-roles.sql
```

## 👤 Cách Gán Quyền Cho User

### Phương pháp 1: Qua API (Khuyến nghị)

#### Gán quyền:

```bash
POST http://localhost:8080/api/v1/roles/assign
Content-Type: application/json

{
  "userId": 1,
  "roleName": "ADMIN"
}
```

#### Xem quyền của user:

```bash
GET http://localhost:8080/api/v1/roles/user/1
```

#### Xóa quyền:

```bash
DELETE http://localhost:8080/api/v1/roles/remove?userId=1&roleName=ADMIN
```

### Phương pháp 2: Qua SQL

```sql
-- Gán ADMIN role cho user có username 'admin'
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.username = 'admin' AND r.role_name = 'ADMIN';

-- Gán nhiều roles cho một user
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM "user" u, role r
WHERE u.username = 'john.doe'
  AND r.role_name IN ('LECTURER', 'ACADEMIC_AFFAIRS');
```

## 📝 Ví Dụ Thực Tế

### Scenario 1: Tạo Admin đầu tiên

```bash
# 1. Register user qua API
POST /api/v1/auth/register
{
  "username": "admin",
  "password": "admin123",
  "fullName": "System Administrator",
  "email": "admin@university.edu"
}

# 2. Khởi tạo roles (chỉ cần làm 1 lần)
POST /api/v1/roles/initialize

# 3. Gán ADMIN role
POST /api/v1/roles/assign
{
  "userId": 1,
  "roleName": "ADMIN"
}
```

### Scenario 2: Tạo Lecturer

```bash
# 1. Register
POST /api/v1/auth/register
{
  "username": "john.doe",
  "password": "password123",
  "fullName": "John Doe",
  "email": "john.doe@university.edu",
  "departmentId": 1
}

# 2. Gán LECTURER role
POST /api/v1/roles/assign
{
  "userId": 2,
  "roleName": "LECTURER"
}
```

### Scenario 3: Tạo Head of Department

```bash
# 1. Register với department
POST /api/v1/auth/register
{
  "username": "dept.head",
  "password": "password123",
  "fullName": "Department Head",
  "email": "head@university.edu",
  "departmentId": 1
}

# 2. Gán HEAD_OF_DEPARTMENT role
POST /api/v1/roles/assign
{
  "userId": 3,
  "roleName": "HEAD_OF_DEPARTMENT"
}
```

### Scenario 4: Tạo Academic Affairs Staff

```bash
# 1. Register
POST /api/v1/auth/register
{
  "username": "academic.staff",
  "password": "password123",
  "fullName": "Academic Affairs Staff",
  "email": "academic@university.edu"
}

# 2. Gán ACADEMIC_AFFAIRS role
POST /api/v1/roles/assign
{
  "userId": 4,
  "roleName": "ACADEMIC_AFFAIRS"
}
```

### Scenario 5: Tạo Student

```bash
# 1. Register
POST /api/v1/auth/register
{
  "username": "student1",
  "password": "password123",
  "fullName": "Student Name",
  "email": "student@university.edu"
}

# 2. Gán STUDENT role
POST /api/v1/roles/assign
{
  "userId": 5,
  "roleName": "STUDENT"
}
```

## 🔍 Kiểm Tra Quyền

### Xem tất cả users và roles của họ:

```sql
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.email,
    d.dept_name,
    STRING_AGG(r.role_name, ', ') as roles
FROM "user" u
LEFT JOIN department d ON u.department_id = d.department_id
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
GROUP BY u.user_id, u.username, u.full_name, u.email, d.dept_name
ORDER BY u.username;
```

### Qua API:

```bash
# Xem roles của user ID = 1
GET /api/v1/roles/user/1

# Response:
{
  "userId": 1,
  "username": "admin",
  "fullName": "System Administrator",
  "roles": ["ADMIN"]
}
```

## 📚 API Endpoints

| Method | Endpoint                      | Description                | Auth Required |
| ------ | ----------------------------- | -------------------------- | ------------- |
| GET    | `/api/v1/roles`               | Lấy danh sách tất cả roles | Yes           |
| POST   | `/api/v1/roles`               | Tạo role mới               | Yes (Admin)   |
| POST   | `/api/v1/roles/initialize`    | Khởi tạo roles mặc định    | Yes           |
| POST   | `/api/v1/roles/assign`        | Gán role cho user          | Yes (Admin)   |
| DELETE | `/api/v1/roles/remove`        | Xóa role của user          | Yes (Admin)   |
| GET    | `/api/v1/roles/user/{userId}` | Xem roles của user         | Yes           |

## 🛡️ Phân Quyền Upload PDF

Sau khi gán role, hệ thống tự động áp dụng quyền:

| Role                   | Upload/Delete PDF                 |
| ---------------------- | --------------------------------- |
| **ADMIN**              | ✅ Tất cả syllabuses              |
| **HEAD_OF_DEPARTMENT** | ✅ Syllabuses trong khoa của mình |
| **LECTURER**           | ✅ Syllabuses của mình            |
| **ACADEMIC_AFFAIRS**   | ✅ Tất cả syllabuses (read-only)  |
| **STUDENT**            | ❌ Không có quyền                 |

## ⚠️ Lưu Ý

1. **Chỉ ADMIN mới có thể gán/xóa roles cho users**
2. Một user có thể có nhiều roles
3. Head of Department cần có `department_id` trùng với department của course trong syllabus
4. Roles phân biệt chữ hoa/thường (nên dùng CHỮ HOA)
5. **STUDENT** chỉ có quyền xem syllabuses đã được published
6. **ACADEMIC_AFFAIRS** có quyền xem tất cả syllabuses và phê duyệt

## 🔧 Troubleshooting

### Không thể gán role?

- Kiểm tra user và role có tồn tại không
- Kiểm tra token JWT có quyền admin không

### Head of Department không có quyền upload?

- Kiểm tra user có `department_id` chưa
- Kiểm tra department của course trong syllabus
- Đảm bảo user có role "HEAD_OF_DEPARTMENT"

### Xem log để debug:

```bash
# Xem log khi upload PDF
tail -f logs/spring.log | grep "PERMISSION"
```
