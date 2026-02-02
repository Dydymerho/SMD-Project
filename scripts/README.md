# PowerShell Scripts Collection

Thư mục này chứa các PowerShell scripts hỗ trợ testing và quản lý database cho SMD Project.

## Danh sách Scripts

### 1. db-viewer.ps1

**Mô tả:** Script để xem và quản lý database

**Cách sử dụng:**

```powershell
.\scripts\db-viewer.ps1
```

### 2. test-api-quick.ps1

**Mô tả:** Script để test nhanh các API endpoints

**Cách sử dụng:**

```powershell
.\scripts\test-api-quick.ps1
```

**Yêu cầu:**

- Server phải đang chạy tại `http://localhost:8080`
- Có thể cần JWT token để test các protected endpoints

### 3. test-syllabus-crud.ps1

**Mô tả:** Script chuyên biệt để test đầy đủ các CRUD operations của Syllabus API

**Cách sử dụng:**

```powershell
.\scripts\test-syllabus-crud.ps1
```

**Chức năng:**

- Test đầy đủ CRUD operations cho Syllabus
- Kiểm tra validation
- Test search functionality
- Test update và delete operations

### 4. test-syllabus-create-view.ps1

**Mô tả:** Script test tính năng tạo mới và xem syllabus

**Cách sử dụng:**

```powershell
.\scripts\test-syllabus-create-view.ps1
```

**Chức năng:**

- Test tạo mới Syllabus
- Test xem chi tiết Syllabus theo ID
- Test xem danh sách tất cả Syllabuses
- Xác nhận Syllabus vừa tạo tồn tại trong danh sách
- Hiển thị thông tin chi tiết về Course, Lecturer, và Program

**Test Flow:**

1. Đăng nhập để lấy JWT token
2. Chuẩn bị dữ liệu phụ thuộc (Department, Program, Course)
3. Tạo mới Syllabus
4. Xem chi tiết Syllabus vừa tạo
5. Xem danh sách tất cả Syllabuses
6. Xác nhận Syllabus tồn tại

## Yêu cầu chung

- PowerShell 5.1 hoặc cao hơn
- Windows OS hoặc PowerShell Core trên Linux/macOS
- Quyền execute scripts (có thể cần chạy: `Set-ExecutionPolicy RemoteSigned`)

## Lưu ý

- Đảm bảo backend service đang chạy trước khi thực thi test scripts
- Kiểm tra connection string trong db-viewer.ps1 trước khi sử dụng
- Các test scripts có thể tạo dữ liệu test trong database

---

**Cập nhật:** 03/01/2026
