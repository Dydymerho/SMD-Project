# 🚀 Quick Start Guide

## Dành cho thành viên nhóm muốn chạy backend

### 1. Cài Docker Desktop

- Download: https://www.docker.com/products/docker-desktop
- Khởi động Docker Desktop sau khi cài

### 2. Clone & Setup

- clone repo ve may
- mo thu muc SMD-Project/core-service/core-service
- chay lenh nay de mo chay docker:

```bash
docker-compose up -d
```

### 3. Kiểm tra

- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 4. Xem logs

```bash
docker-compose logs -f backend
```

### 5. Dừng hệ thống

```bash
docker-compose down
```

- dung va xoa db

```bash
docker-compose down -v
```

---

### 6. them du lieu mau ban dau vao db (tuy chon ko thich thi khoi lam cung duoc)

- xem thu muc SMD-Project/core-service/core-service/init
- chay lan luot:

1. init-role-user.sql
2. init-course.sql
3. init-syllabus.sql

- mo file bam ctrl+a -> chuot phai -> run all sql statement

### 7. xem bang db (local)

- cai extension 'database client jdbc'
- add connections:
  name:smd
  server type: postgresql
  host: 127.0.0.1
  port: 5432
  username: root
  password: rootpassword

```

```
