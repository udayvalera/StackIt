import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  type: 'NEW_ANSWER' | 'NEW_COMMENT' | 'MENTION';
  message: string;
  questionId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

// Mock notifications for testing
const mockNotifications: Notification[] = [
  {
    _id: 'notif-1',
    type: 'NEW_ANSWER',
    message: 'john_doe answered your question: "How to implement JWT authentication in React?"',
    questionId: 'question-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    _id: 'notif-2',
    type: 'NEW_COMMENT',
    message: 'jane_smith commented on your answer',
    questionId: 'question-2',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    _id: 'notif-3',
    type: 'MENTION',
    message: 'You were mentioned in a question by alex_dev',
    questionId: 'question-3',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  }
];

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!user) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // For demo purposes, show notifications for admin user
    if (user.role === 'Admin') {
      setNotifications(mockNotifications);
    } else {
      setNotifications(mockNotifications.slice(0, 1)); // Show fewer for regular users
    }
  };

  const markAllAsRead = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAllAsRead,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};