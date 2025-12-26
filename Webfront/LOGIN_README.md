# Hệ thống Quản lý & Tra cứu Giáo trình - SMD System

## 📚 Giới thiệu

Hệ thống quản lý và tra cứu giáo trình với các tính năng:
- Đăng nhập phân quyền theo vai trò
- Quản trị hệ thống (Admin)
- Dashboard cho giảng viên/sinh viên
- Tra cứu giáo trình
- Phê duyệt giáo trình

## 🚀 Cài đặt

```bash
cd Webfront
npm install
npx react-scripts start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 👤 Tài khoản Demo

### Admin
- **Mã người dùng**: 001
- **Mật khẩu**: admin123
- **Quyền truy cập**: Trang quản trị hệ thống

### Giảng viên
- **Mã người dùng**: 002
- **Mật khẩu**: teacher123
- **Quyền truy cập**: Dashboard, Quản lý giáo trình

### Sinh viên
- **Mã người dùng**: 003
- **Mật khẩu**: student123
- **Quyền truy cập**: Dashboard, Tra cứu giáo trình

## 📱 Tính năng theo vai trò

### 🔐 Trang Login (`/login`)
- Form đăng nhập với mã người dùng và mật khẩu
- Tự động điều hướng theo vai trò sau khi đăng nhập thành công
- Hiển thị danh sách tài khoản demo

### 👑 Admin - Quản trị Hệ thống (`/admin/system-management`)
**Chỉ dành cho Admin**

Tính năng:
- Xem thống kê hệ thống (người dùng, hoạt động, lưu trữ)
- Quản lý người dùng (xem, thêm, sửa, xóa)
- Quản lý giáo trình
- Báo cáo hệ thống

Giao diện:
- Sidebar navigation
- Dashboard thống kê
- Bảng quản lý người dùng
- Chức năng thêm/sửa/xóa

### 👨‍🏫 Giảng viên - Dashboard (`/dashboard`)
**Dành cho Giảng viên và Sinh viên**

#### Tab: Giáo trình của tôi
- Danh sách giáo trình đang giảng dạy
- Trạng thái: Hoạt động, Chờ duyệt
- Xem chi tiết và chỉnh sửa

#### Tab: Phê duyệt (Giảng viên)
- Giáo trình chờ phê duyệt
- Giáo trình đã phê duyệt
- Chức năng duyệt/từ chối

#### Tab: Tra cứu giáo trình
- Tìm kiếm giáo trình theo môn học
- Lọc theo khoa
- Xem thông tin chi tiết
- Giao diện card đẹp mắt

## 🎨 Giao diện

### Màu sắc chủ đạo
- Primary: Gradient tím-xanh (#667eea → #764ba2)
- Background: #f5f5f5
- Text: #333 (đậm), #666 (nhạt)

### Component chính
1. **Sidebar Navigation**: Menu điều hướng với icon
2. **Stats Cards**: Thẻ thống kê với hiệu ứng hover
3. **Data Tables**: Bảng dữ liệu responsive
4. **Status Badges**: Hiển thị trạng thái (Hoạt động, Chờ duyệt, Đã khóa)
5. **Syllabus Cards**: Thẻ giáo trình với gradient header

## 🔒 Phân quyền & Bảo mật

### Authentication
- Login với mã người dùng và mật khẩu
- JWT Token lưu trong localStorage
- Auto-redirect nếu chưa đăng nhập

### Authorization
- **Admin**: Truy cập tất cả trang admin
- **Teacher**: Truy cập dashboard + phê duyệt
- **Student**: Truy cập dashboard + tra cứu
- **Protected Routes**: Tự động redirect theo role

### Route Protection
```tsx
<PrivateRoute allowedRoles={['ADMIN']}>
  <SystemManagementPage />
</PrivateRoute>
```

## 📂 Cấu trúc File

```
Webfront/
├── src/
│   ├── components/
│   │   ├── PrivateRoute.tsx      # Bảo vệ route theo role
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx       # Quản lý authentication
│   ├── pages/
│   │   ├── LoginPage.tsx         # Trang đăng nhập
│   │   ├── LoginPage.css
│   │   ├── admin/
│   │   │   ├── SystemManagementPage.tsx
│   │   │   └── SystemManagementPage.css
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── DashboardPage.css
│   │   └── ...
│   ├── services/
│   │   └── api.ts                # API calls với interceptor
│   └── App.tsx                   # Routes configuration
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Admin
- `GET /api/admin/users` - Danh sách người dùng
- `POST /api/admin/users` - Tạo người dùng mới
- `PUT /api/admin/users/:id` - Cập nhật người dùng
- `DELETE /api/admin/users/:id` - Xóa người dùng
- `GET /api/admin/stats` - Thống kê hệ thống

### Syllabus
- `GET /api/syllabus/my-syllabi` - Giáo trình của tôi
- `GET /api/syllabus/pending` - Giáo trình chờ duyệt
- `GET /api/syllabus/approved` - Giáo trình đã duyệt
- `POST /api/syllabus/:id/approve` - Phê duyệt
- `POST /api/syllabus/:id/reject` - Từ chối

## 🌐 Trình duyệt hỗ trợ

- Chrome (khuyến nghị)
- Firefox
- Edge
- Safari

## 📱 Responsive

- Desktop: Full layout với sidebar
- Tablet: Sidebar thu gọn
- Mobile: Stack layout, sidebar collapse

## 🔄 Luồng hoạt động

1. **Đăng nhập** → Nhập mã người dùng + mật khẩu
2. **Authentication** → Kiểm tra và lưu token
3. **Redirect** → Điều hướng theo role:
   - Admin → `/admin/system-management`
   - Teacher → `/dashboard`
   - Student → `/dashboard`
4. **Protected Routes** → Tự động bảo vệ các trang cần đăng nhập
5. **Logout** → Xóa token và redirect về `/login`

## 🎯 Roadmap

- [ ] Kết nối API thực tế
- [ ] Upload file giáo trình
- [ ] Chat/Comment trong giáo trình
- [ ] Thông báo realtime
- [ ] Export PDF
- [ ] Dark mode
- [ ] Multi-language

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Node.js version >= 16
2. npm install đã chạy thành công
3. Port 3000 chưa bị sử dụng
4. Console log trong Developer Tools

---

Made with ❤️ by SMD Team
