import { create } from 'zustand';
import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
}

// Configure axios
axios.defaults.withCredentials = true;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    set({ isLoading: true });
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
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof AxiosError && error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      if (error instanceof AxiosError && error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/auth/logout`);
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