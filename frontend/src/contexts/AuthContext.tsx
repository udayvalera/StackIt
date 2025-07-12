import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import apiClient from "../services/api/apiClient";
import { User } from "../types/user";
import { LoginCredentials, RegisterCredentials } from "../types/credentials";

// --- TYPE DEFINITIONS ---

/**
 * @interface AuthContextType
 * Describes the shape of the authentication context.
 * This includes the authentication state and methods to update it.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * @interface AuthProviderProps
 * Defines the props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

// --- CONTEXT CREATION ---

/**
 * @context AuthContext
 * React context to provide authentication state and functions to the component tree.
 * Initialized with a default value of `undefined`.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AUTH PROVIDER COMPONENT ---

/**
 * @component AuthProvider
 * This component wraps parts of the application that need access to authentication context.
 * It manages the user's authentication state and provides login, register, and logout functionalities.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function checkAuthStatus
   * A memoized function to check the user's authentication status on initial load.
   * It makes an API call to the `/user/auth/verify` endpoint to get the current user's data
   * if a session is active.
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      // This endpoint verifies the current session and returns the logged-in user's data.
      const response = await apiClient.get<User>("/user/auth/verify");
      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      // If the request fails, it likely means the user is not authenticated.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * @function login
   * Handles the user login process.
   * @param {LoginCredentials} credentials - The user's login credentials (email/username and password).
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<User>(
        "/user/auth/login",
        credentials
      );
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      throw err; // Re-throw the error to be caught in the component
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function register
   * Handles the user registration process.
   * @param {RegisterCredentials} credentials - The user's registration details.
   */
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<User>(
        "/user/auth/register",
        credentials
      );
      setUser(response.data); // Automatically log in the user after successful registration
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function logout
   * Handles the user logout process.
   * It calls the logout endpoint and clears the user state.
   */
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This endpoint should handle the session invalidation on the server side.
      await apiClient.post("/user/auth/logout");
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed.");
      // Even if logout API fails, we clear the user from the client-side state.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// --- CUSTOM HOOK ---

/**
 * @hook useAuth
 * A custom hook for consuming the AuthContext.
 * It provides a convenient way to access the authentication state and methods.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
