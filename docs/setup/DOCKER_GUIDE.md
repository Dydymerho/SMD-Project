# 🐳 Hướng Dẫn Docker - SMD Core Service

## 📋 Mục Lục

- [Yêu cầu](#yêu-cầu)
- [Build Docker Image](#build-docker-image)
- [Chạy Container Locally](#chạy-container-locally)
- [Push Image lên Docker Hub](#push-image-lên-docker-hub)
- [Sử dụng Docker Compose](#sử-dụng-docker-compose)

---

## ✅ Yêu cầu

1. **Docker Desktop** đã được cài đặt và chạy
2. **Tài khoản Docker Hub** (đăng ký miễn phí tại: https://hub.docker.com/)

---

## 🔨 Build Docker Image

### Bước 1: Mở Terminal/PowerShell

```bash
cd "d:\Syllabus Management and Digitalization System of the University (SMD)\SMD-Project\core-service\core-service"
```

### Bước 2: Build Image

```bash
# Cú pháp: docker build -t <tên-image>:<tag> .
docker build -t smd-core-service:latest .
```

**Giải thích:**

- `-t smd-core-service:latest`: Đặt tên và tag cho image
- `.`: Build từ thư mục hiện tại (nơi có Dockerfile)

### Bước 3: Kiểm tra Image đã được tạo

```bash
docker images | grep smd-core-service
```

Kết quả mong đợi:

```
smd-core-service   latest   abc123def456   2 minutes ago   450MB
```

---

## 🚀 Chạy Container Locally

### Chạy Container đơn lẻ (không dùng Docker Compose)

```bash
docker run -d \
  --name smd-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/smd_db \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=rootpassword \
  -e SPRING_DATA_REDIS_HOST=host.docker.internal \
  -e SPRING_ELASTICSEARCH_URIS=http://host.docker.internal:9200 \
  smd-core-service:latest
```

**Lưu ý Windows:** Sử dụng `host.docker.internal` để kết nối với services chạy trên máy host.

### Kiểm tra container đang chạy

```bash
docker ps
```

### Xem logs

```bash
docker logs -f smd-backend
```

### Dừng và xóa container

```bash
docker stop smd-backend
docker rm smd-backend
```

---

## 📤 Push Image lên Docker Hub

### Bước 1: Đăng nhập Docker Hub

```bash
docker login
```

Nhập **Username** và **Password** (hoặc Access Token) của Docker Hub.

### Bước 2: Tag Image với tên Docker Hub của bạn

```bash
# Cú pháp: docker tag <image-local> <dockerhub-username>/<repository>:<tag>
docker tag smd-core-service:latest <your-dockerhub-username>/smd-core-service:latest

# Ví dụ:
docker tag smd-core-service:latest johndoe/smd-core-service:latest
```

**Lưu ý:** Thay `<your-dockerhub-username>` bằng username Docker Hub của bạn.

### Bước 3: Push Image lên Docker Hub

```bash
docker push <your-dockerhub-username>/smd-core-service:latest

# Ví dụ:
docker push johndoe/smd-core-service:latest
```

Quá trình upload sẽ hiển thị progress bar:

```
latest: digest: sha256:abc123... size: 1234
```

### Bước 4: Xác nhận trên Docker Hub

- Truy cập: https://hub.docker.com/
- Vào **Repositories** → Bạn sẽ thấy repository `smd-core-service`

---

## 🐳 Sử dụng Docker Compose (Recommended cho Team)

### ⚡ Setup lần đầu

```bash
cd "d:\Syllabus Management and Digitalization System of the University (SMD)\SMD-Project\core-service\core-service"

# Copy file environment template
copy .env.example .env

# Chạy toàn bộ stack (PostgreSQL, Redis, Elasticsearch, Backend)
docker-compose up -d
```

**Lưu ý:** Backend service đã được tích hợp vào docker-compose.yml, team chỉ cần chạy 1 lệnh!

### Xem logs tất cả services

```bash
docker-compose logs -f

# Hoặc xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f postgresdb
```

### Dừng tất cả services

```bash
docker-compose down
```

### Dừng và xóa cả volumes (dữ liệu database) - Reset toàn bộ

```bash
docker-compose down -v
```

### Rebuild backend sau khi thay đổi code

```bash
docker-compose up -d --build backend
```

---

## 🛠️ Các Lệnh Hữu Ích

### Kiểm tra dung lượng Docker

```bash
docker system df
```

### Dọn dẹp images/containers không dùng

```bash
docker system prune -a
```

### Build lại không cache (khi có lỗi)

```bash
docker build --no-cache -t smd-core-service:latest .
```

### Chạy container ở chế độ tương tác (interactive)

```bash
docker run -it --rm smd-core-service:latest /bin/sh
```

---

## 📝 Cập Nhật Image trên Docker Hub

Khi có thay đổi code:

```bash
# 1. Build lại image
docker build -t smd-core-service:latest .

# 2. Tag với version mới
docker tag smd-core-service:latest <your-username>/smd-core-service:v1.0.1
docker tag smd-core-service:latest <your-username>/smd-core-service:latest

# 3. Push cả 2 tags
docker push <your-username>/smd-core-service:v1.0.1
docker push <your-username>/smd-core-service:latest
```

---

## 🌐 Pull Image từ Docker Hub (trên máy khác)

```bash
# Pull image
docker pull <your-username>/smd-core-service:latest

# Chạy container
docker run -d \
  --name smd-backend \
  -p 8080:8080 \
  <your-username>/smd-core-service:latest
```

---

## 🔧 Troubleshooting

### Lỗi "Cannot connect to database"

- Đảm bảo PostgreSQL đang chạy
- Kiểm tra connection string trong environment variables
- Trên Windows, dùng `host.docker.internal` thay vì `localhost`

### Lỗi "Port 8080 already in use"

```bash
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F
```

### Container bị crash ngay sau khi start

```bash
# Xem logs chi tiết
docker logs <container-id>

# Xem logs real-time
docker logs -f <container-id>
```

---

## 📞 Liên Hệ & Hỗ Trợ

- Repository: https://github.com/Dydymerho/SMD-Project
- Issues: https://github.com/Dydymerho/SMD-Project/issues

---

**Chúc bạn build và deploy thành công! 🎉**
