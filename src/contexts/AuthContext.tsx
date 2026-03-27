import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import api, { setAuthToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await api.get('/auth/me');
          // Map backend user to frontend User type if needed
          // Backend returns { id, name, email, role, department }
          if (res.data) {
            const u = res.data;
            setUser({
              id: u.id,
              email: u.email,
              name: u.name,
              role: u.role as UserRole, // Cast to UserRole
              department: u.department,
              avatar: u.avatar,
              position: 'Employee', // Default or fetch from backend
              createdAt: new Date()
            });
          }
        } catch (error: any) {
          console.error("Failed to fetch user", error);
          // FORCE LOGOUT on any error to prevent 422 loops
          setAuthToken(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, name, role, id } = res.data;

      setAuthToken(access_token);

      const userData: User = {
        id,
        email,
        name,
        role: role as UserRole,
        department: 'Engineering', // You might want to return this from login API too
        avatar: undefined, // Login might not return avatar, usually /me does. But if it did...
        position: 'Employee',
        createdAt: new Date()
      };

      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: string, department: string) => {
    try {
      await api.post("/auth/register", { email, password, name, role, department });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
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
