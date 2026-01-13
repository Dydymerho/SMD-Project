# 🚀 Setup Hướng Dẫn Cho Thành Viên Nhóm

## 📌 Mục đích

Hướng dẫn này giúp **BẤT KỲ THÀNH VIÊN NÀO** trong team có thể chạy được backend trên máy của họ **GIỐNG HỆT** như trên máy của bạn, không cần cài đặt Java, PostgreSQL, Redis, hay Elasticsearch trực tiếp.

---

## ✅ Yêu Cầu Tối Thiểu

### 1. Cài đặt Docker Desktop

- **Windows/Mac**: Tải về tại https://www.docker.com/products/docker-desktop
- **Linux**: Cài Docker Engine theo hướng dẫn official

### 2. Kiểm tra Docker đã cài đặt thành công

```bash
docker --version
docker-compose --version
```

Kết quả mong đợi:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## 🎯 Setup Nhanh (3 Bước)

### Bước 1: Clone Repository

```bash
git clone https://github.com/Dydymerho/SMD-Project.git
cd SMD-Project/core-service/core-service
```

### Bước 2: Copy file cấu hình

```bash
# Windows PowerShell
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Lưu ý:** File `.env` đã được thêm vào `.gitignore`, mỗi người có thể tùy chỉnh riêng mà không ảnh hưởng đến người khác.

### Bước 3: Chạy toàn bộ stack

```bash
docker-compose up -d
```

**Xong!** 🎉 Backend đã chạy tại: http://localhost:8080

---

## 🔍 Kiểm Tra Hệ Thống

### 1. Kiểm tra tất cả containers đang chạy

```bash
docker-compose ps
```

Bạn sẽ thấy 4 services:

```
NAME                IMAGE                               STATUS
smd_backend         core-service-backend               Up
smd_postgres        pgvector/pgvector:pg16             Up
smd_redis           redis:latest                        Up
smd_elastic         elasticsearch:8.11.1               Up
```

### 2. Kiểm tra logs của backend

```bash
docker-compose logs -f backend
```

Tìm dòng: `Started SmdCoreServiceApplication in X.XXX seconds` → Backend đã sẵn sàng!

### 3. Test API

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8080/actuator/health

# Linux/Mac hoặc Git Bash
curl http://localhost:8080/actuator/health
```

Kết quả mong đợi: `{"status":"UP"}`

---

## 🛠️ Các Lệnh Hữu Ích

### Dừng toàn bộ hệ thống

```bash
docker-compose down
```

### Xóa cả dữ liệu (để reset database từ đầu)

```bash
docker-compose down -v
```

### Rebuild backend sau khi thay đổi code

```bash
docker-compose up -d --build backend
```

### Xem logs real-time của một service cụ thể

```bash
docker-compose logs -f backend    # Backend
docker-compose logs -f postgresdb # Database
docker-compose logs -f redis      # Redis
```

### Restart một service cụ thể

```bash
docker-compose restart backend
```

### Truy cập vào container backend (debug)

```bash
docker exec -it smd_backend sh
```

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Port 8080 already in use"

**Nguyên nhân:** Có ứng dụng khác đang dùng port 8080

**Giải pháp 1:** Tắt ứng dụng đang dùng port đó

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Giải pháp 2:** Đổi port trong docker-compose.yml

```yaml
backend:
  ports:
    - "8081:8080" # Dùng port 8081 thay vì 8080
```

### ❌ Lỗi: "Cannot connect to Docker daemon"

**Giải pháp:** Khởi động Docker Desktop và đợi nó khởi động xong

### ❌ Backend bị crash liên tục

```bash
# Xem logs chi tiết
docker-compose logs backend

# Thường gặp: Database chưa sẵn sàng → Đợi 10-20s rồi restart
docker-compose restart backend
```

### ❌ Database không có dữ liệu

```bash
# Reset và chạy lại init scripts
docker-compose down -v
docker-compose up -d
```

---

## 📚 Làm Việc Với Code

### 1. Phát triển code mới

- Sửa code trong `src/` như bình thường
- **Không cần** restart Docker sau mỗi thay đổi nếu dùng Spring DevTools
- Nếu cần rebuild:
  ```bash
  docker-compose up -d --build backend
  ```

### 2. Thay đổi dependencies (pom.xml)

```bash
# Phải rebuild lại image
docker-compose down
docker-compose up -d --build
```

### 3. Thay đổi database schema

- Sửa file trong `init/` (nếu cần)
- Hoặc để Hibernate tự động update (đã config `ddl-auto=update`)

---

## 🌐 Làm Việc Với Team

### Khi pull code mới từ Git

```bash
git pull origin <branch-name>

# Nếu có thay đổi Dockerfile hoặc dependencies
docker-compose up -d --build
```

### Chia sẻ image qua Docker Hub (Optional)

Thay vì build trên mỗi máy, lead có thể push image lên Docker Hub:

```bash
# Lead build và push
docker-compose build backend
docker tag core-service-backend:latest <username>/smd-backend:latest
docker push <username>/smd-backend:latest
```

Các thành viên khác chỉ cần pull:

```bash
docker pull <username>/smd-backend:latest
docker-compose up -d
```

---

## 🎓 So Sánh: Trước và Sau Khi Dùng Docker

### ❌ Trước khi dùng Docker

```
Thành viên A: "Máy tôi chạy được nhưng máy bạn lỗi sao?"
Thành viên B: "Tôi cài Java 17 rồi mà vẫn lỗi?"
Thành viên C: "PostgreSQL của tôi port 5433, phải sửa config?"
Thành viên D: "Tôi dùng Mac M1 không chạy được?"
```

### ✅ Sau khi dùng Docker

```
Tất cả thành viên:
1. git clone
2. docker-compose up -d
3. Done! 🎉
```

**Lợi ích:**

- ✅ Môi trường nhất quán trên mọi máy (Windows, Mac, Linux)
- ✅ Không cần cài Java, PostgreSQL, Redis, Elasticsearch
- ✅ Không xung đột với phần mềm khác trên máy
- ✅ Dễ dàng reset về trạng thái ban đầu
- ✅ Mô phỏng production environment

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Xem lại phần **Troubleshooting** ở trên
2. Kiểm tra logs: `docker-compose logs -f`
3. Hỏi trong group chat của team
4. Tạo issue trên GitHub repository

---

## 🔐 Lưu Ý Bảo Mật

⚠️ **KHÔNG COMMIT** các file sau vào Git:

- `.env` (chứa credentials)
- `uploads/` (dữ liệu người dùng)
- Bất kỳ file có password, API keys, secrets

✅ Các file này đã được thêm vào `.gitignore`

---

**Chúc team làm việc hiệu quả! 💪**
