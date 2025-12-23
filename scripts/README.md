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

### 3. test-syllabus-api.ps1

**Mô tả:** Script chuyên biệt để test Syllabus API endpoints

**Cách sử dụng:**

```powershell
.\scripts\test-syllabus-api.ps1
```

**Chức năng:**

- Test CRUD operations cho Syllabus
- Kiểm tra validation
- Test search functionality

## Yêu cầu chung

- PowerShell 5.1 hoặc cao hơn
- Windows OS hoặc PowerShell Core trên Linux/macOS
- Quyền execute scripts (có thể cần chạy: `Set-ExecutionPolicy RemoteSigned`)

## Lưu ý

- Đảm bảo backend service đang chạy trước khi thực thi test scripts
- Kiểm tra connection string trong db-viewer.ps1 trước khi sử dụng
- Các test scripts có thể tạo dữ liệu test trong database

---

**Cập nhật:** 23/12/2025
