import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', {
        username: username,
        password: password
      });

      const data = response.data;
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        await login(data);
        if (data.username === 'admin') {
          navigate('/admin/system-management');
        } else if (data.username === 'student') {
          navigate('/student/dashboard');
        } else {
          alert('Vai trò không hợp lệ');
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const message = err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng nhập.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon"></div>
          </div>
          <h1>SMD System</h1>
          <p>Hệ thống quản lý & tra cứu Giáo trình</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Mã người dùng</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập mã người dùng"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="login-footer">
            <a href="/forgot-password">Quên mật khẩu?</a>
          </div>
        </form>

        <div className="demo-accounts">
          <p><strong>Demo accounts:</strong></p>
          <p>Admin: 001 / admin123</p>
          <p>Giảng viên: 002 / teacher123</p>
          <p>Sinh viên: 003 / student123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
