# Hoàn thiện chức năng Đăng xuất - Logout Implementation

## 📋 Tổng quan các thay đổi

Đã hoàn thiện chức năng đăng xuất cho ứng dụng mobile với các cải tiến sau:

### 1. ✅ Cập nhật RootNavigator

**File:** `frontend/src/navigation/RootNavigator.tsx`

**Thay đổi:**

- Loại bỏ việc sử dụng local state `isLoggedIn`
- Sử dụng `AuthContext` để quản lý trạng thái đăng nhập tập trung
- Thêm màn hình loading khi kiểm tra trạng thái xác thực
- Tự động chuyển hướng giữa Login và Tabs dựa trên `isLoggedIn` từ context

**Lợi ích:**

- Quản lý state tập trung, tránh lỗi đồng bộ
- Tự động redirect khi logout mà không cần navigation thủ công
- Loading screen khi app khởi động

### 2. ✅ Cập nhật LoginScreen

**File:** `frontend/src/screens/Login/LoginScreen.tsx`

**Thay đổi:**

- Loại bỏ props `setIsLoggedIn`
- Sử dụng `login()` function từ `useAuth()` hook
- Tự động chuyển màn hình sau khi login thành công

**Code trước:**

```typescript
export default function LoginScreen({ setIsLoggedIn }: LoginScreenProps) {
  await AsyncStorage.setItem('AUTH_TOKEN', res.token);
  setIsLoggedIn(true);
}
```

**Code sau:**

```typescript
export default function LoginScreen() {
  const { login } = useAuth();
  await login(res.token); // Tự động update context và navigate
}
```

### 3. ✅ Cải thiện SettingScreen Logout

**File:** `frontend/src/screens/settingpage/SettingScreen.tsx`

**Thay đổi:**

- Đơn giản hóa logout handler
- Loại bỏ navigation thủ công
- RootNavigator tự động xử lý redirect

**Cách hoạt động:**

```typescript
const handleLogout = async () => {
  await logout(); // Chỉ cần gọi logout từ context
  // RootNavigator tự động chuyển về LoginScreen
};
```

### 4. ✅ Nâng cấp AuthContext

**File:** `backend/Contexts/AuthContext.tsx`

**Thay đổi:**

- Thêm việc gọi API logout (nếu backend hỗ trợ)
- Xóa tất cả dữ liệu người dùng khi logout:
  - `AUTH_TOKEN`
  - `USER_DATA`
  - `USER_PROFILE`
- Cập nhật `isLoggedIn` state

**Code:**

```typescript
const logout = async () => {
  await authApi.logout(); // Gọi API
  await AsyncStorage.removeItem('AUTH_TOKEN');
  await AsyncStorage.removeItem('USER_DATA');
  await AsyncStorage.removeItem('USER_PROFILE');
  setIsLoggedIn(false);
};
```

### 5. ✅ Thêm Logout API

**File:** `backend/api/authApi.ts`

**Thay đổi:**

- Thêm function `logout()` để gọi API
- Xử lý gracefully nếu backend chưa có endpoint

**Code:**

```typescript
export const authApi = {
    login: (username, password) => axiosClient.post("/auth/login", {...}),
    logout: () => axiosClient.post("/auth/logout").catch(error => {
        console.log("Logout endpoint not available");
    }),
};
```

### 6. ✅ Cải thiện Axios Interceptor

**File:** `backend/api/axiosClient.ts`

**Thay đổi:**

- Xóa token khi nhận 401 Unauthorized
- Thêm comment giải thích tránh circular dependency
- RootNavigator sẽ tự động kiểm tra và redirect

## 🎯 Luồng hoạt động (Flow)

### Khi người dùng đăng xuất:

```
1. User nhấn nút "Đăng xuất" trong SettingScreen
   ↓
2. Hiện Alert xác nhận
   ↓
3. Gọi logout() từ AuthContext
   ↓
4. AuthContext:
   - Gọi API logout (nếu có)
   - Xóa AUTH_TOKEN
   - Xóa USER_DATA, USER_PROFILE
   - Set isLoggedIn = false
   ↓
5. RootNavigator phát hiện isLoggedIn = false
   ↓
6. Tự động render LoginScreen
```

### Khi nhận 401 (Token hết hạn):

```
1. API response 401 Unauthorized
   ↓
2. Axios interceptor xóa AUTH_TOKEN
   ↓
3. AuthContext checkAuthStatus() khi app refocus
   ↓
4. Phát hiện không có token → isLoggedIn = false
   ↓
5. RootNavigator tự động chuyển về LoginScreen
```

## 🚀 Cách sử dụng

### Trong bất kỳ component nào:

```typescript
import { useAuth } from '../../../../backend/Contexts/AuthContext';

function MyComponent() {
  const { logout, isLoggedIn } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Xong! RootNavigator sẽ tự redirect
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };
}
```

## 📝 Ghi chú Backend

Nếu bạn có backend endpoint `/api/auth/logout`, nó sẽ được gọi tự động.

**Không bắt buộc** - ứng dụng vẫn hoạt động tốt nếu chưa có endpoint này vì:

- Token được xóa ở client
- API call bị catch và không throw error

## ✨ Tính năng đã thêm

1. ✅ Đăng xuất hoàn toàn (clear all data)
2. ✅ Auto-redirect về login
3. ✅ Loading screen khi check auth
4. ✅ Xử lý 401 tự động logout
5. ✅ Alert xác nhận trước khi logout
6. ✅ Error handling đầy đủ
7. ✅ Centralized state management

## 🔒 Bảo mật

- Token được xóa hoàn toàn khi logout
- Tất cả user data được clear
- Không thể quay lại màn hình trước sau khi logout
- Tự động logout khi token hết hạn (401)

## 🎨 UI/UX

- Nút đăng xuất màu đỏ (destructive)
- Alert xác nhận trước khi logout
- Loading state trong quá trình xử lý
- Smooth transition giữa màn hình

---

**Hoàn thành:** ✅ Chức năng đăng xuất đã được hoàn thiện đầy đủ
**Kiểm tra:** Đã test các trường hợp: logout thủ công, 401 auto-logout, reload app
