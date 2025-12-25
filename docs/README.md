# SMD Project Documentation

Thư mục này chứa tất cả tài liệu kỹ thuật cho SMD (Syllabus Management and Digitalization) Project.

## 📚 Tài liệu có sẵn

### [API_ENDPOINTS.md](./API_ENDPOINTS.md)

Tài liệu đầy đủ về tất cả các REST API endpoints của hệ thống, bao gồm:

- Authentication APIs
- Department, Program, Course Management
- Syllabus Management
- CLO/PLO Management
- Assessment, Material, Session Plan Management
- Request/Response examples
- Error handling

## 📋 Cấu trúc Project

```
SMD-Project/
├── core-service/           # Backend Spring Boot service
├── Mobilefront/           # React Native mobile app
├── docs/                  # Tài liệu kỹ thuật (folder này)
│   ├── API_ENDPOINTS.md  # API documentation
│   └── README.md         # File này
├── scripts/              # PowerShell scripts
└── README.md             # Project README
```

## 🚀 Quick Start Guide

### 1. Setup Backend

```bash
cd core-service/core-service
./mvnw spring-boot:run
```

### 2. Access API Documentation

- Swagger UI (nếu có): `http://localhost:8080/swagger-ui.html`
- API Endpoints: Xem [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### 3. Testing APIs

Sử dụng các PowerShell scripts trong folder `scripts/`:

```powershell
.\scripts\test-api-quick.ps1
.\scripts\test-syllabus-api.ps1
```

## 🔧 Configuration

### Database Configuration

File: `core-service/src/main/resources/application.properties`

### Security Configuration

- JWT-based authentication
- Token expiration: Xem SecurityConfig.java
- CORS configuration: Xem SecurityConfig.java

## 📝 Entity Relationships

```
Department
    ↓
Program → PLO
    ↓
Syllabus → CLO → CLO-PLO Mapping
    ↓
    ├── Assessment
    ├── Material
    └── SessionPlan
```

## 🎯 Main Features

1. **Department Management**: Quản lý các khoa
2. **Program Management**: Quản lý các chương trình đào tạo
3. **Course Management**: Quản lý môn học
4. **Syllabus Management**: Quản lý đề cương chi tiết
5. **Learning Outcomes**: Quản lý CLO (Course) và PLO (Program)
6. **Assessment**: Quản lý đánh giá
7. **Materials**: Quản lý tài liệu học tập
8. **Session Plans**: Quản lý kế hoạch giảng dạy

## 🔐 Security

- JWT authentication required for most endpoints
- Role-based access control
- Password encryption using BCrypt

## 📊 API Response Codes

- `200 OK`: Request thành công
- `201 CREATED`: Tạo mới thành công
- `204 NO CONTENT`: Xóa thành công
- `400 BAD REQUEST`: Dữ liệu không hợp lệ
- `401 UNAUTHORIZED`: Chưa xác thực
- `403 FORBIDDEN`: Không có quyền
- `404 NOT FOUND`: Không tìm thấy resource
- `409 CONFLICT`: Conflict (duplicate)
- `500 INTERNAL SERVER ERROR`: Lỗi server

## 🛠️ Development Tools

- **IDE**: IntelliJ IDEA, VS Code
- **API Testing**: Postman, PowerShell scripts
- **Database**: MySQL/PostgreSQL
- **Version Control**: Git

## 📞 Support

Để được hỗ trợ, vui lòng:

1. Kiểm tra documentation này trước
2. Xem API_ENDPOINTS.md để biết chi tiết về APIs
3. Kiểm tra error logs trong console
4. Liên hệ team nếu cần hỗ trợ thêm

---

**Last Updated:** 23/12/2025
**Version:** 1.0.0
