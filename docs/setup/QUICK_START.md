# 🚀 Quick Start Guide

## Dành cho thành viên nhóm muốn chạy backend

### 1. Cài Docker Desktop

- Download: https://www.docker.com/products/docker-desktop
- Khởi động Docker Desktop sau khi cài

### 2. Clone & Setup (3 lệnh)

```bash
git clone https://github.com/Dydymerho/SMD-Project.git
cd SMD-Project/core-service/core-service
copy .env.example .env
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

---

**Xem hướng dẫn chi tiết:** [TEAM_SETUP.md](TEAM_SETUP.md)

**Hướng dẫn Docker nâng cao:** [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
