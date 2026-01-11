# Hướng Dẫn Sử Dụng Dữ Liệu Mẫu

## Tổng Quan

File `init-sample-data.sql` cung cấp dữ liệu mẫu đầy đủ để test và demo hệ thống Syllabus Management System.

## Nội Dung Dữ Liệu Mẫu

### 1. Workflow Steps (4 bước)

- Draft
- Pending Review
- Pending Approval
- Published

### 2. Departments (5 phòng ban)

- Computer Science (CS)
- Electrical Engineering (EE)
- Mechanical Engineering (ME)
- Business Administration (BA)
- Mathematics (MATH)

### 3. Users (9 người dùng)

| Username     | Role               | Password     | Email                   | Department |
| ------------ | ------------------ | ------------ | ----------------------- | ---------- |
| admin        | ADMIN              | Password123! | admin@smd.edu.vn        | -          |
| aa_manager   | ACADEMIC_AFFAIRS   | Password123! | aa.manager@smd.edu.vn   | -          |
| hod_cs       | HEAD_OF_DEPARTMENT | Password123! | hod.cs@smd.edu.vn       | CS         |
| hod_ee       | HEAD_OF_DEPARTMENT | Password123! | hod.ee@smd.edu.vn       | EE         |
| hod_ba       | HEAD_OF_DEPARTMENT | Password123! | hod.ba@smd.edu.vn       | BA         |
| lecturer_cs1 | LECTURER           | Password123! | lecturer.cs1@smd.edu.vn | CS         |
| lecturer_cs2 | LECTURER           | Password123! | lecturer.cs2@smd.edu.vn | CS         |
| lecturer_ee1 | LECTURER           | Password123! | lecturer.ee1@smd.edu.vn | EE         |
| lecturer_ba1 | LECTURER           | Password123! | lecturer.ba1@smd.edu.vn | BA         |

### 4. Programs (4 chương trình)

- Computer Science (Bachelor) - 140 credits
- Electrical Engineering (Bachelor) - 145 credits
- Business Administration (Bachelor) - 130 credits
- Computer Science (Master) - 60 credits

### 5. Courses (10 môn học)

- CS101: Introduction to Programming
- CS201: Data Structures
- CS202: Object-Oriented Programming
- CS301: Database Systems
- CS401: Software Engineering
- EE101: Circuit Analysis
- EE201: Digital Logic Design
- BA101: Principles of Management
- BA201: Marketing Management
- MATH101: Calculus I

### 6. Syllabuses (5 đề cương)

| Course | Lecturer     | Status           | Semester         |
| ------ | ------------ | ---------------- | ---------------- |
| CS101  | lecturer_cs1 | PUBLISHED        | Fall 2024-2025   |
| CS401  | lecturer_cs1 | PENDING_APPROVAL | Spring 2024-2025 |
| CS201  | lecturer_cs2 | PENDING_REVIEW   | Fall 2024-2025   |
| CS202  | lecturer_cs2 | DRAFT            | Spring 2025-2026 |
| BA101  | lecturer_ba1 | PUBLISHED        | Fall 2024-2025   |

## Cách Chạy Script

### Option 1: Sử dụng MySQL Command Line

```bash
# Đảm bảo đã tạo database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smd_core_db;"

# Chạy script init-roles.sql trước (nếu chưa chạy)
mysql -u root -p smd_core_db < init-roles.sql

# Chạy script sample data
mysql -u root -p smd_core_db < init-sample-data.sql
```

### Option 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến database server
3. Chọn database `smd_core_db`
4. File > Open SQL Script > Chọn `init-sample-data.sql`
5. Click Execute (⚡️) hoặc nhấn Ctrl+Shift+Enter

### Option 3: Sử dụng Docker

```bash
# Nếu dùng Docker Compose
docker-compose exec mysql mysql -u root -proot_password smd_core_db < init-sample-data.sql
```

### Option 4: Sử dụng PowerShell Script

Tạo file `init-sample-data.ps1`:

```powershell
# filepath: d:\Syllabus Management and Digitalization System of the University (SMD)\SMD-Project\core-service\init-sample-data.ps1

param(
    [string]$Host = "localhost",
    [string]$Port = "3306",
    [string]$User = "root",
    [string]$Password = "root_password",
    [string]$Database = "smd_core_db"
)

Write-Host "Initializing sample data for SMD System..." -ForegroundColor Green

# Check if MySQL client is available
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "Error: MySQL client not found. Please install MySQL or add it to PATH." -ForegroundColor Red
    exit 1
}

# Execute SQL script
Write-Host "Executing init-sample-data.sql..." -ForegroundColor Yellow

try {
    Get-Content "init-sample-data.sql" | mysql -h $Host -P $Port -u $User -p$Password $Database

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Sample data initialized successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error occurred during initialization." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
```

Chạy script:

```powershell
.\init-sample-data.ps1 -User root -Password your_password
```

## Kiểm Tra Dữ Liệu

Sau khi chạy script, kiểm tra dữ liệu:

```sql
-- Kiểm tra tổng quan
SELECT
    (SELECT COUNT(*) FROM departments) AS Departments,
    (SELECT COUNT(*) FROM users) AS Users,
    (SELECT COUNT(*) FROM programs) AS Programs,
    (SELECT COUNT(*) FROM courses) AS Courses,
    (SELECT COUNT(*) FROM syllabuses) AS Syllabuses,
    (SELECT COUNT(*) FROM clos) AS CLOs,
    (SELECT COUNT(*) FROM plos) AS PLOs;

-- Kiểm tra users và roles
SELECT u.username, u.full_name, r.role_name, d.department_name
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
LEFT JOIN departments d ON u.department_id = d.department_id
ORDER BY r.role_name, u.username;

-- Kiểm tra syllabuses với status
SELECT
    s.syllabus_code,
    c.course_code,
    c.course_name,
    u.full_name AS lecturer,
    s.current_status,
    s.semester,
    s.academic_year
FROM syllabuses s
JOIN courses c ON s.course_id = c.course_id
JOIN users u ON s.lecturer_id = u.user_id
ORDER BY s.current_status, s.created_at DESC;
```

## Test Workflows

### Test Case 1: Login với các user khác nhau

```bash
# Login as Lecturer
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"lecturer_cs1","password":"Password123!"}'

# Login as HOD
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hod_cs","password":"Password123!"}'

# Login as Academic Affairs
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"aa_manager","password":"Password123!"}'
```

### Test Case 2: Xem danh sách syllabuses theo role

```bash
# Lecturer xem syllabuses của mình
GET /api/syllabuses/my-syllabuses

# HOD xem syllabuses pending review trong department
GET /api/syllabuses?status=PENDING_REVIEW

# AA xem syllabuses pending approval
GET /api/syllabuses?status=PENDING_APPROVAL
```

### Test Case 3: Test workflow transitions

```bash
# HOD approve syllabus (id=3) từ PENDING_REVIEW -> PENDING_APPROVAL
POST /api/workflows/approve-by-hod
{
  "syllabusId": 3,
  "comment": "Good content, approved"
}

# AA approve syllabus (id=2) từ PENDING_APPROVAL -> PUBLISHED
POST /api/workflows/approve-by-aa
{
  "syllabusId": 2,
  "comment": "Published"
}
```

## Reset Dữ Liệu

Nếu cần reset và chạy lại từ đầu:

```sql
-- Option 1: Drop và tạo lại database
DROP DATABASE IF EXISTS smd_core_db;
CREATE DATABASE smd_core_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sau đó chạy lại:
-- 1. Schema migrations
-- 2. init-roles.sql
-- 3. init-sample-data.sql
```

```sql
-- Option 2: Xóa dữ liệu nhưng giữ schema
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE syllabus_workflow_history;
TRUNCATE TABLE session_plans;
TRUNCATE TABLE materials;
TRUNCATE TABLE assessments;
TRUNCATE TABLE syllabus_clos;
TRUNCATE TABLE clos;
TRUNCATE TABLE syllabuses;
TRUNCATE TABLE courses;
TRUNCATE TABLE program_plos;
TRUNCATE TABLE plos;
TRUNCATE TABLE programs;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
TRUNCATE TABLE workflow_steps;
SET FOREIGN_KEY_CHECKS = 1;

-- Chạy lại init-sample-data.sql
```

## Lưu Ý

1. **Password**: Tất cả users có password: `Password123!`
2. **Prerequisite**: Phải chạy `init-roles.sql` trước
3. **Schema**: Đảm bảo đã chạy migrations để tạo tables
4. **Foreign Keys**: Script tự động xử lý foreign key constraints
5. **Timestamps**: Sử dụng NOW() và DATE_SUB() để tạo timestamps realistic

## Troubleshooting

### Lỗi "Table doesn't exist"

- Chạy migrations trước: `mvn flyway:migrate`

### Lỗi "Foreign key constraint fails"

- Chạy `init-roles.sql` trước
- Kiểm tra role_id trong user_roles insert

### Lỗi "Duplicate entry"

- Reset database hoặc xóa dữ liệu cũ trước

### Password không đúng

- Đảm bảo dùng BCrypt hash
- Hoặc update password sau: `UPDATE users SET password_hash = '$2a$10$...' WHERE username = 'xxx';`

## Tài Liệu Liên Quan

- [API Test Guide](API_TEST_GUIDE.md)
- [Role Management](ROLE_MANAGEMENT.md)
- [Versioning Guide](VERSIONING.md)
