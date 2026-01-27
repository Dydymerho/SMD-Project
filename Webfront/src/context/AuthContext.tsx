import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLecturer: boolean;
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

 const login = async (apiData: any): Promise<void> => {
  try {
    // Map backend role name to frontend role type
    const mapRoleName = (roleName: string): 'ADMIN' | 'LECTURER' | 'STUDENT' => {
      if (!roleName) return 'STUDENT';
      
      const roleMap: { [key: string]: 'ADMIN' | 'LECTURER' | 'STUDENT' } = {
        'ADMIN': 'ADMIN',
        'LECTURER': 'LECTURER',
        'HEAD_OF_DEPARTMENT': 'LECTURER',
        'ACADEMIC_AFFAIRS': 'ADMIN',
        'PRINCIPAL': 'ADMIN',
        'STUDENT': 'STUDENT'
      };
      
      return roleMap[roleName] || 'STUDENT';
    };

    const mappedUser: User = {
      id: (apiData.userId || apiData.id || apiData.userID || '').toString(), 
      username: apiData.username,
      name: apiData.fullName || apiData.fullFullName || apiData.username,
      role: mapRoleName(apiData.roleName),
      email: apiData.email
    };
    
    setUser(mappedUser);
    localStorage.setItem('user', JSON.stringify(mappedUser));
  } catch (error) {
    console.error("Lỗi khi map dữ liệu user:", error);
    throw error;
  }
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
    isLecturer: user?.role === 'LECTURER',
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
