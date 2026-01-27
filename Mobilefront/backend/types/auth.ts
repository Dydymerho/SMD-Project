export type LoginResponse = {
  token: string;
  type: string;
  userId: number; // Đổi id -> userId
  username: string;
  fullName: string;
  email: string;
  roleName: string; // Đổi role -> roleName
  roleId: number;
};
