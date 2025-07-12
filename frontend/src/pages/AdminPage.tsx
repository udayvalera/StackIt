import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, MessageSquare, Tag, BarChart3, UserX, UserCheck, Archive, CheckCircle, Search, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'User' | 'Admin';
  isBanned: boolean;
  questionsCount: number;
  answersCount: number;
  joinedDate: string;
}

interface Question {
  _id: string;
  title: string;
  author: string;
  isArchived: boolean;
  createdAt: string;
  answerCount: number;
  upvoteCount: number;
}

// Mock data for admin panel
const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'User',
    isBanned: false,
    questionsCount: 5,
    answersCount: 12,
    joinedDate: '2024-01-15'
  },
  {
    id: 'user-002',
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'User',
    isBanned: false,
    questionsCount: 3,
    answersCount: 8,
    joinedDate: '2024-02-20'
  },
  {
    id: 'user-003',
    username: 'alex_dev',
    email: 'alex@example.com',
    role: 'User',
    isBanned: true,
    questionsCount: 2,
    answersCount: 1,
    joinedDate: '2024-03-10'
  },
  {
    id: 'user-004',
    username: 'sarah_tech',
    email: 'sarah@example.com',
    role: 'User',
    isBanned: false,
    questionsCount: 8,
    answersCount: 15,
    joinedDate: '2024-01-05'
  },
  {
    id: 'user-005',
    username: 'mike_backend',
    email: 'mike@example.com',
    role: 'User',
    isBanned: false,
    questionsCount: 4,
    answersCount: 9,
    joinedDate: '2024-02-28'
  }
];

const mockQuestions: Question[] = [
  {
    _id: 'question-1',
    title: 'How to implement JWT authentication in React?',
    author: 'john_doe',
    isArchived: false,
    createdAt: '2024-12-01',
    answerCount: 3,
    upvoteCount: 15
  },
  {
    _id: 'question-2',
    title: 'Best practices for MongoDB schema design?',
    author: 'jane_smith',
    isArchived: false,
    createdAt: '2024-12-02',
    answerCount: 2,
    upvoteCount: 8
  },
  {
    _id: 'question-3',
    title: 'How to optimize React component re-renders?',
    author: 'alex_dev',
    isArchived: false,
    createdAt: '2024-11-30',
    answerCount: 5,
    upvoteCount: 23
  },
  {
    _id: 'question-4',
    title: 'TypeScript vs JavaScript for large projects?',
    author: 'sarah_tech',
    isArchived: true,
    createdAt: '2024-11-28',
    answerCount: 7,
    upvoteCount: 31
  },
  {
    _id: 'question-5',
    title: 'How to handle file uploads in Node.js?',
    author: 'mike_backend',
    isArchived: false,
    createdAt: '2024-11-25',
    answerCount: 4,
    upvoteCount: 12
  }
];

const AdminPage: React.FC = () => {
  const { user, banUser, unbanUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'questions'>('overview');
  const [users, setUsers] = useState(mockUsers);
  const [questions, setQuestions] = useState(mockQuestions);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');

  if (!user || user.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleBanUser = async (userId: string) => {
    await banUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
  };

  const handleUnbanUser = async (userId: string) => {
    await unbanUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u));
  };

  const handleArchiveQuestion = async (questionId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    setQuestions(prev => prev.map(q => 
      q._id === questionId ? { ...q, isArchived: !q.isArchived } : q
    ));
  };

  const handleUserRedirect = (userId: string) => {
    // For demo purposes, redirect to profile page
    navigate(`/profile`);
  };

  const handleQuestionRedirect = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter questions based on search query
  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
    question.author.toLowerCase().includes(questionSearchQuery.toLowerCase())
  );

  const stats = [
    { name: 'Total Users', value: users.length.toString(), icon: Users, color: 'bg-blue-500' },
    { name: 'Total Questions', value: questions.length.toString(), icon: MessageSquare, color: 'bg-green-500' },
    { name: 'Banned Users', value: users.filter(u => u.isBanned).length.toString(), icon: UserX, color: 'bg-red-500' },
    { name: 'Archived Questions', value: questions.filter(q => q.isArchived).length.toString(), icon: Archive, color: 'bg-orange-500' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage and moderate the StackIt community</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New question posted</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by john_doe • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New user registered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">jane_smith • 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Archive className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Question archived</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">TypeScript vs JavaScript • 6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('users')}
                className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Manage Users</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">View and moderate user accounts</div>
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Moderate Content</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Review and archive questions</div>
              </button>
              <Link
                to="/"
                className="block w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">View Public Site</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">See the platform as users do</div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-80"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.questionsCount} questions, {user.answersCount} answers
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Unban</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Ban</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleUserRedirect(user.id)}
                          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {userSearchQuery ? 'No users found matching your search.' : 'No users found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Question Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search questions by title or author..."
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-80"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredQuestions.map((question) => (
                  <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-md">
                        {question.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{question.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {question.answerCount} answers
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {question.upvoteCount} votes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        question.isArchived 
                          ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      }`}>
                        {question.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleArchiveQuestion(question._id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            question.isArchived
                              ? 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                              : 'text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300'
                          }`}
                        >
                          {question.isArchived ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Unarchive</span>
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4" />
                              <span>Archive</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleQuestionRedirect(question._id)}
                          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Question</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {questionSearchQuery ? 'No questions found matching your search.' : 'No questions found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;