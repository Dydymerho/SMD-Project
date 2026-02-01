import axiosClient from './axiosClient';
import { LoginResponse } from '../types/auth';
export const authApi = {
  login: (username: string, password: string): Promise<LoginResponse> =>
    axiosClient.post('/auth/login', {
      username,
      password,
    }),

  // Logout API call (optional - only if backend has logout endpoint)
  logout: async (): Promise<void> => {
    try {
      axiosClient.post('/auth/logout');
    } catch (error: any) {
      console.log('Logout endpoint not available or failed:', error.message);
    }
  }
};
