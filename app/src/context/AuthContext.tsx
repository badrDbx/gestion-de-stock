import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// بيانات تجريبية للمستخدمين
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'المشرف العام',
    email: 'admin@hospital.ma',
    role: 'admin',
    department: 'مركز المعلومات',
    phone: '0612345678',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'أحمد العلي',
    email: 'ahmed@hospital.ma',
    role: 'user',
    department: 'قسم الطوارئ',
    phone: '0623456789',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'فاطمة الزهراء',
    email: 'fatima@hospital.ma',
    role: 'user',
    department: 'قسم الجراحة',
    phone: '0634567890',
    createdAt: '2024-02-01',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USERS[0]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // محاكاة تسجيل الدخول - في الواقع سيكون هناك اتصال بالـ API
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  // التحقق من وجود مستخدم مخزن
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
