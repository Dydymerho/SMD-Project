# SMD API Testing Guide

Base URL: `http://localhost:8080/api/v1`

## 1️⃣ Đăng ký User mới

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "departmentId": 1
  }'
```

**Response mẫu:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "john_doe",
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

---

## 2️⃣ Đăng nhập

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

**Lưu JWT token từ response để dùng cho các request tiếp theo!**

---

## 3️⃣ Test endpoint yêu cầu authentication

**Thay YOUR_JWT_TOKEN bằng token nhận được từ login/register**

```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

✅ **Success Response:** "You are authenticated!"  
❌ **Without token:** 401 Unauthorized

---

## 4️⃣ Lấy danh sách Syllabuses

```bash
curl -X GET http://localhost:8080/api/v1/syllabuses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5️⃣ Lấy chi tiết Syllabus theo ID

```bash
curl -X GET http://localhost:8080/api/v1/syllabuses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6️⃣ Tìm kiếm Syllabus

```bash
curl -X GET "http://localhost:8080/api/v1/syllabuses/search?keyword=Java" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7️⃣ Test lỗi 401 (không có token)

```bash
curl -X GET http://localhost:8080/api/v1/syllabuses
```

**Expected:** HTTP 401 hoặc 403

---

## 8️⃣ Test lỗi 409 (trùng username)

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "anypassword",
    "fullName": "Another John",
    "email": "another@example.com"
  }'
```

**Expected:** HTTP 409 Conflict

---

## 🔍 Kiểm tra Services

### PostgreSQL

```bash
docker exec -it smd_postgres psql -U root -d smd_db -c "\dt"
```

### Redis

```bash
docker exec -it smd_redis redis-cli PING
```

### Elasticsearch

```bash
curl http://localhost:9200/_cluster/health?pretty
```

---

## 🧪 Run PowerShell Test Script

```powershell
cd "d:\Syllabus Management and Digitalization System of the University (SMD)\SMD-Project\core-service\core-service"
.\test-api.ps1
```

---

## 📊 Expected Results

✅ **Register:** HTTP 200, JWT token returned  
✅ **Login:** HTTP 200, JWT token returned  
✅ **Auth endpoints with token:** HTTP 200  
✅ **Auth endpoints without token:** HTTP 401/403  
✅ **Duplicate user:** HTTP 409  
✅ **Invalid credentials:** HTTP 400  
✅ **Resource not found:** HTTP 404

---

## 🐛 Troubleshooting

**Application không start:**

```bash
# Check logs
.\mvnw spring-boot:run

# Check port 8080 đã bị dùng chưa
netstat -ano | findstr :8080
```

**Database connection error:**

```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Check PostgreSQL logs
docker logs smd_postgres
```

**JWT validation error:**

- Kiểm tra `application.properties` có config `jwt.secret` và `jwt.expiration`
- Token có thể đã hết hạn (24h), login lại để lấy token mới
