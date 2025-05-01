import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

// Configure axios
axios.defaults.withCredentials = true;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        set({ user: response.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        set({ user: response.data.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  resetPassword: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
      });
      return response.data.success;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  },
}));