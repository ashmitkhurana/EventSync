import { create } from 'zustand';
import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, phone: string, password: string, options?: { 
    education?: string;
    bio?: string;
    avatar?: File;
    resume?: File;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  checkAuth: () => Promise<void>;
}

// Configure axios
axios.defaults.withCredentials = true;

// Local storage keys
const AUTH_USER_KEY = 'eventSync_user';
const AUTH_STATE_KEY = 'eventSync_authenticated';

// Try to restore auth state from localStorage
const storedUser = typeof window !== 'undefined' ? localStorage.getItem(AUTH_USER_KEY) : null;
const storedAuth = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STATE_KEY) : null;

export const useAuth = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: storedAuth === 'true',
  isLoading: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        const userData = response.data.user;
        // Store authentication state
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        // Clear authentication state
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_STATE_KEY);
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      // Clear authentication state
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_STATE_KEY); 
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const userData = response.data.user;
        // Store authentication state
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { 
        success: false, 
        error: response.data.message,
        code: response.data.code
      };
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof AxiosError && error.response?.data) {
        return { 
          success: false, 
          error: error.response.data.message,
          code: error.response.data.code
        };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  signup: async (name: string, email: string, phone: string, password: string, options = {}) => {
    set({ isLoading: true });
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      
      // Add optional fields if provided
      if (options.education) {
        formData.append('education', options.education);
      }
      
      if (options.bio) {
        formData.append('bio', options.bio);
      }
      
      if (options.avatar) {
        formData.append('avatar', options.avatar);
      }
      
      if (options.resume) {
        formData.append('resume', options.resume);
      }
      
      const response = await axios.post(`${API_URL}/auth/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        const userData = response.data.user;
        // Store authentication state
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { 
        success: false, 
        error: response.data.message,
        code: response.data.code
      };
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof AxiosError && error.response?.data) {
        return { 
          success: false, 
          error: error.response.data.message,
          code: error.response.data.code
        };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/auth/logout`);
      // Clear authentication state
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_STATE_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Logout error:', error);
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
      });
      set({ isLoading: false });
      return { success: response.data.success, error: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof AxiosError && error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      return { success: false, error: 'Failed to reset password' };
    }
  },
}));