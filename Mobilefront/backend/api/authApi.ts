import axiosClient from './axiosClient';
import { LoginResponse } from '../types/auth';
import { AxiosResponse } from 'axios';
export const authApi = {
  login: (username: string, password: string): Promise<LoginResponse> =>
    axiosClient.post('/auth/login', {
      username,
      password,
    }),

  // Logout API call (optional - only if backend has logout endpoint)
  logout: (): Promise<void> =>
    axiosClient.post('/auth/logout').catch(error => {
      // Nếu backend chưa có endpoint này, không báo lỗi
      console.log('Logout endpoint not available or failed:', error.message);
    }),
};
