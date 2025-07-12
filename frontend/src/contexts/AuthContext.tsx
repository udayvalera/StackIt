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
  login: (emailOrUsername: string, password: string) => Promise<void>;
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

// Hardcoded users - 3 regular users + 1 admin
const hardcodedUsers = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@stackit.com',
    password: 'admin123',
    role: 'Admin' as const,
    isBanned: false
  },
  {
    id: 'user-001',
    username: 'john_doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'User' as const,
    isBanned: false
  },
  {
    id: 'user-002',
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'User' as const,
    isBanned: false
  },
  {
    id: 'user-003',
    username: 'alex_dev',
    email: 'alex@example.com',
    password: 'user123',
    role: 'User' as const,
    isBanned: false
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check localStorage for saved session
      const savedUser = localStorage.getItem('stackit_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Check if user is banned
        const currentUser = hardcodedUsers.find(u => u.id === userData.id);
        if (currentUser && !currentUser.isBanned) {
          setUser(userData);
        } else {
          localStorage.removeItem('stackit_user');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = hardcodedUsers.find(u => 
      (u.email === emailOrUsername || u.username === emailOrUsername) && 
      u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    if (foundUser.isBanned) {
      throw new Error('Your account has been banned. Please contact support.');
    }

    const userData: User = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
      isBanned: foundUser.isBanned
    };

    setUser(userData);
    localStorage.setItem('stackit_user', JSON.stringify(userData));
  };

  const register = async (username: string, email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = hardcodedUsers.find(u => u.email === email || u.username === username);
    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      role: 'User' as const,
      isBanned: false
    };

    hardcodedUsers.push(newUser);

    // Auto-login after registration
    await login(email, password);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  const banUser = async (userId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userIndex = hardcodedUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      hardcodedUsers[userIndex].isBanned = true;
    }
  };

  const unbanUser = async (userId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userIndex = hardcodedUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      hardcodedUsers[userIndex].isBanned = false;
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