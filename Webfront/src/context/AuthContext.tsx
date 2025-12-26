import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  status?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra localStorage khi load app
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    // Demo authentication - replace with actual API call
    const demoUsers: { [key: string]: { password: string; user: User } } = {
      '001': {
        password: 'admin123',
        user: {
          id: '001',
          username: '001',
          name: 'Admin',
          role: 'ADMIN',
          status: 'Hoạt động',
        },
      },
      '002': {
        password: 'teacher123',
        user: {
          id: '002',
          username: '002',
          name: 'Nguyễn Văn A',
          role: 'TEACHER',
          status: 'Hoạt động',
        },
      },
      '003': {
        password: 'student123',
        user: {
          id: '003',
          username: '003',
          name: 'Nguyễn Văn B',
          role: 'STUDENT',
          status: 'Hoạt động',
        },
      },
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const account = demoUsers[username];
    if (!account || account.password !== password) {
      throw new Error('Mã người dùng hoặc mật khẩu không đúng');
    }

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(account.user));
    localStorage.setItem('token', 'demo-token-' + username);

    setUser(account.user);
    return account.user;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
