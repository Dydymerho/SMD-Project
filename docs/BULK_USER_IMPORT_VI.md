# Tính năng Tạo Tài Khoản Hàng Loạt (Bulk User Import)

## Tổng Quan

Tính năng này cho phép người dùng có quyền quản trị (Admin hoặc Principal) khởi tạo hàng loạt tài khoản mới thông qua việc tải lên tập tin Excel (.xlsx). Hệ thống sẽ tự động:

- ✅ Trích xuất và xác thực dữ liệu
- ✅ Kiểm tra tính duy nhất của Email
- ✅ Xác thực Role và Department tồn tại
- ✅ Tạo tài khoản và mật khẩu tự động
- ✅ Gán quyền truy cập
- ✅ Báo cáo chi tiết lỗi
- ✅ Tải xuống template Excel mẫu

## API Endpoints

### 1. GET /api/users/bulk-import/template

**Tải xuống file Excel mẫu**

**Yêu cầu:** Token Admin hoặc Principal

**Mô tả:** Tải xuống file Excel template có định dạng chuẩn với dữ liệu mẫu và hướng dẫn chi tiết.

**Ví dụ:**

```bash
curl -X GET "http://localhost:8080/api/users/bulk-import/template" \
  -H "Authorization: Bearer TOKEN" \
  -o user_import_template.xlsx
```

**Nội dung template:**

- **Sheet Users**: Chứa header và 5 dòng dữ liệu mẫu
- **Sheet Instructions**: Hướng dẫn chi tiết, danh sách role codes hợp lệ

---

### 2. POST /api/users/bulk-import

**Tải lên file Excel để import users**

**Yêu cầu:** Token Admin hoặc Principal

## Các Thành Phần Đã Triển Khai

### 1. Dependencies (pom.xml)

```xml
<!-- Apache POI for Excel processing -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

## Các Thành Phần Đã Triển Khai

### 1. Dependencies (pom.xml)

```xml
<!-- Apache POI for Excel processing -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### 2. Data Transfer Objects (DTOs)

#### UserImportRow.java

DTO đại diện cho một dòng dữ liệu người dùng từ Excel

#### UserImportError.java

DTO đại diện cho lỗi xác thực trong quá trình import

#### BulkUserImportResponse.java

DTO phản hồi kết quả import bao gồm số lượng thành công/lỗi và danh sách lỗi chi tiết

### 3. Service Layer

#### BulkUserImportService.java

Service xử lý logic chính:

- **parseExcelFile()**: Đọc và phân tích file Excel
- **validateAndCreateUser()**: Xác thực và tạo tài khoản
- **generateRandomPassword()**: Tạo mật khẩu ngẫu nhiên an toàn (12 ký tự)
- **generateExcelTemplate()**: Tạo file Excel template với dữ liệu mẫu
- Các phương thức hỗ trợ validate email, kiểm tra dòng trống, etc.

### 4. Controller Layer

#### UserController.java

Endpoints đã triển khai:

```
GET /api/users/bulk-import/template
  → Tải xuống Excel template

POST /api/users/bulk-import
  → Upload và import users từ Excel

Authorization: Bearer Token (ADMIN or PRINCIPAL)
```

### 5. Repository Updates

#### DepartmentRepository.java

Thêm method:

```java
Optional<Department> findByDeptName(String deptName);
```

## Định Dạng File Excel

### Khuyến nghị: Tải xuống template chính thức

Sử dụng endpoint `GET /api/users/bulk-import/template` để tải xuống template có định dạng chuẩn.

### Cấu trúc bắt buộc:

| Cột | Tên Cột         | Bắt Buộc | Mô Tả                              |
| --- | --------------- | -------- | ---------------------------------- |
| A   | Full Name       | ✅       | Họ và tên đầy đủ                   |
| B   | Email           | ✅       | Email (phải duy nhất)              |
| C   | Role Code       | ✅       | Mã vai trò (ADMIN, LECTURER, etc.) |
| D   | Department Code | ✅       | Tên phòng ban                      |

### Ví dụ:

```
| Full Name       | Email                      | Role Code           | Department Code    |
|-----------------|----------------------------|---------------------|--------------------|
| Nguyễn Văn A    | nguyenvana@university.edu  | LECTURER            | Computer Science   |
| Trần Thị B      | tranthib@university.edu    | ADMIN               | Administration     |
| Lê Văn C        | levanc@university.edu      | HEAD_OF_DEPARTMENT  | Mathematics        |
```

**Template tải xuống bao gồm:**

- Header row được định dạng đúng
- 5 dòng dữ liệu mẫu
- Sheet Instructions với hướng dẫn chi tiết
- Cột tự động điều chỉnh độ rộng

## Quy Tắc Xác Thực

### 1. Email

- ✅ Định dạng email hợp lệ
- ✅ Duy nhất trong hệ thống
- ❌ Không được để trống

### 2. Full Name

- ✅ Không được để trống
- ✅ Hỗ trợ tiếng Việt có dấu

### 3. Role Code

- ✅ Phải tồn tại trong hệ thống
- Các giá trị hợp lệ:
  - `ADMIN` - Quản trị viên hệ thống
  - `LECTURER` - Giảng viên
  - `HEAD_OF_DEPARTMENT` - Trưởng khoa
  - `ACADEMIC_AFFAIRS` - Phòng đào tạo
  - `PRINCIPAL` - Hiệu trưởng
  - `STUDENT` - Sinh viên

### 4. Department Code

- ✅ Phải tồn tại trong database
- ✅ So khớp chính xác tên phòng ban
- ⚠️ Phân biệt chữ hoa/chữ thường

## Quy Trình Xử Lý

### Bước 1: Tải xuống Template

```bash
# Tải template Excel
curl -X GET "http://localhost:8080/api/users/bulk-import/template" \
  -H "Authorization: Bearer TOKEN" \
  -o user_import_template.xlsx
```

Hoặc sử dụng PowerShell:

```powershell
.\scripts\test-download-template.ps1
```

### Bước 2: Chuẩn bị Dữ liệu

1. Mở file `user_import_template.xlsx` vừa tải
2. Xem sheet **Instructions** để hiểu rõ yêu cầu
3. Chỉnh sửa sheet **Users**:
   - Xóa các dòng dữ liệu mẫu
   - Thêm dữ liệu người dùng thật
   - Đảm bảo điền đầy đủ các trường
4. Lưu file

### Bước 3: Upload File

```bash
curl -X POST "http://localhost:8080/api/users/bulk-import" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@user_import_template.xlsx"
```

Hoặc chạy quy trình hoàn chỉnh:

```powershell
.\scripts\test-complete-workflow.ps1
```

Script này sẽ tự động:

- Tải template
- Mở file cho bạn chỉnh sửa
- Upload và import
- Hiển thị kết quả chi tiết

### Bước 4: Hệ Thống Xử Lý

1. Kiểm tra định dạng file (.xlsx)
2. Đọc và phân tích dữ liệu Excel
3. Với mỗi dòng:
   - Xác thực các trường bắt buộc
   - Kiểm tra email duy nhất
   - Xác thực Role Code tồn tại
   - Xác thực Department Code tồn tại
   - Tạo username từ email (phần trước @)
   - Tạo mật khẩu ngẫu nhiên an toàn
   - Tạo tài khoản và gán quyền

### Bước 5: Nhận Kết Quả

```json
{
  "totalRows": 10,
  "successCount": 8,
  "errorCount": 2,
  "message": "Successfully imported 8 users, 2 errors",
  "errors": [
    {
      "rowNumber": 3,
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@university.edu",
      "roleCode": "INVALID_ROLE",
      "departmentCode": "IT",
      "errorMessage": "Invalid role code: INVALID_ROLE"
    }
  ]
}
```

## Xử Lý Username và Password

### Username

- Tự động tạo từ email (phần trước @)
- Ví dụ: `john.doe@university.edu` → username: `john.doe`
- Nếu trùng lặp, thêm số thứ tự: `john.doe1`, `john.doe2`

### Password

- Tạo ngẫu nhiên 12 ký tự
- Bao gồm: chữ hoa, chữ thường, số, ký tự đặc biệt
- **Lưu ý**: Hiện tại password được in ra console (cần implement gửi email trong production)

## Bảo Mật

### Kiểm Soát Truy Cập

```java
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
```

Chỉ ADMIN và PRINCIPAL mới được phép thực hiện bulk import

### Mã Hóa Mật Khẩu

```java
passwordEncoder.encode(password)
```

Mật khẩu được mã hóa bằng BCrypt trước khi lưu database

### Password Generator

```java
SecureRandom random = new SecureRandom();
// Generate 12-character password with mixed characters
```

## Xử Lý Lỗi

### Lỗi Thường Gặp

| Lỗi                       | Nguyên Nhân              | Giải Pháp                        |
| ------------------------- | ------------------------ | -------------------------------- |
| "Email already exists"    | Email đã tồn tại         | Sử dụng email khác               |
| "Invalid role code"       | Role không tồn tại       | Kiểm tra danh sách role hợp lệ   |
| "Invalid department code" | Department không tồn tại | Kiểm tra tên phòng ban chính xác |
| "Invalid email format"    | Email sai định dạng      | Sửa lại định dạng email          |
| "Email is required"       | Thiếu email              | Điền đầy đủ thông tin            |

### Partial Success

- ✅ Các dòng hợp lệ vẫn được import thành công
- ❌ Các dòng lỗi được báo cáo chi tiết
- 🔄 Có thể sửa lỗi và import lại các dòng thất bại

## Testing

### Tải xuống Template

```powershell
cd scripts
.\test-download-template.ps1
```

### Quy trình Hoàn chỉnh

```powershell
cd scripts
.\test-complete-workflow.ps1
```

Script này sẽ:

1. Tải template tự động
2. Mở file Excel cho bạn
3. Đợi bạn chỉnh sửa dữ liệu
4. Upload và import
5. Hiển thị kết quả chi tiết

### Import đơn lẻ

```powershell
cd scripts
.\test-bulk-user-import.ps1
```

### Sử dụng Postman

1. Method: POST
2. URL: `http://localhost:8080/api/users/bulk-import`
3. Authorization: Bearer Token
4. Body: form-data
   - Key: `file` (type: File)
   - Value: Chọn file Excel

### Sử dụng cURL

```bash
curl -X POST "http://localhost:8080/api/users/bulk-import" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/users.xlsx"
```

## Best Practices

### 1. Tải Template Trước

- ✅ **Luôn tải template chính thức** từ `/api/users/bulk-import/template`
- ✅ Sử dụng định dạng chuẩn đã được cung cấp

### 2. Chuẩn Bị Dữ Liệu

- ✅ Kiểm tra tất cả Role và Department tồn tại
- ✅ Đảm bảo email duy nhất
- ✅ Xóa dòng trống
- ✅ Định dạng file .xlsx

### 2. Import Theo Batch

- ✅ Import 50-100 users mỗi lần
- ✅ Kiểm tra kết quả trước khi tiếp tục
- ✅ Backup file Excel gốc

### 3. Xử Lý Lỗi

- ✅ Đọc kỹ error messages
- ✅ Sửa dữ liệu lỗi
- ✅ Import lại các dòng thất bại

### 4. Bảo Mật

- ✅ Chỉ cấp quyền cho Admin/Principal
- ✅ Log tất cả import activities
- ✅ Gửi email thông báo cho users (implement sau)

## Tài Liệu Tham Khảo

- [BULK_USER_IMPORT.md](./BULK_USER_IMPORT.md) - Chi tiết API và validation (English)
- [USER_IMPORT_TEMPLATE.md](./USER_IMPORT_TEMPLATE.md) - Hướng dẫn template Excel
- [QUICK_START_BULK_IMPORT.md](./QUICK_START_BULK_IMPORT.md) - Quick start guide
- [test-download-template.ps1](../scripts/test-download-template.ps1) - Script tải template
- [test-complete-workflow.ps1](../scripts/test-complete-workflow.ps1) - Script test workflow hoàn chỉnh
- [test-bulk-user-import.ps1](../scripts/test-bulk-user-import.ps1) - Script test import

## Quy Trình Khuyến Nghị

```
1. Tải Template → 2. Chỉnh sửa → 3. Upload → 4. Xem kết quả
```

**Sử dụng script tự động:**

```powershell
.\scripts\test-complete-workflow.ps1
```

## Future Enhancements

### Priority 1 (Quan Trọng)

- [x] **Tải xuống template** - ✅ Đã hoàn thành
- [ ] Email notification với credentials
- [ ] Email confirmation/verification
- [ ] Audit logging cho bulk import

### Priority 2 (Tiện Ích)

- [ ] Download Excel template từ UI
- [ ] Dry-run mode (validate không tạo account)
- [ ] CSV file support
- [ ] Import history và rollback

### Priority 3 (Nâng Cao)

- [ ] Bulk update users
- [ ] Scheduled imports
- [ ] Advanced validation rules
- [ ] Multi-language support

## Troubleshooting

### Lỗi Build

```bash
mvn clean install
```

### Lỗi Runtime

```bash
# Check logs
tail -f logs/application.log

# Verify database
psql -d your_database -c "SELECT * FROM \"user\" ORDER BY user_id DESC LIMIT 10;"
```

### Lỗi Import

1. Kiểm tra file format (.xlsx)
2. Xác minh header row chính xác
3. Kiểm tra dữ liệu validation
4. Review error response chi tiết

## Support

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs hệ thống
2. Review documentation
3. Test với file nhỏ trước
4. Liên hệ team support

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 01/02/2026  
**Tác giả**: SMD Development Team
