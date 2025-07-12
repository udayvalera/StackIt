import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'User' | 'Admin';
  isBanned?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrUsername: string, password: string, isAdmin?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies for JWT
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('stackit_user');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('stackit_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string, isAdmin: boolean = false) => {
    const endpoint = isAdmin ? '/api/admin/auth/login' : '/api/user/auth/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for JWT
      body: JSON.stringify({ username: emailOrUsername, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.user.isBanned) {
      throw new Error('Your account has been banned. Please contact support.');
    }

    setUser(data.user);
    localStorage.setItem('stackit_user', JSON.stringify(data.user));
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await fetch('/api/user/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for JWT
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setUser(data.user);
    localStorage.setItem('stackit_user', JSON.stringify(data.user));
  };

  const logout = async () => {
    await fetch('/api/user/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies for JWT
    });
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  const banUser = async (userId: string) => {
    const response = await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for JWT
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to ban user');
    }
  };

  const unbanUser = async (userId: string) => {
    const response = await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for JWT
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to unban user');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    banUser,
    unbanUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};