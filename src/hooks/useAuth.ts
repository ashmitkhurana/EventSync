import { create } from 'zustand';

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
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

// Mock user data for demonstration purposes
const MOCK_USER: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in a real app, this would validate against a backend
    if (email && password) {
      set({ user: MOCK_USER, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock signup - in a real app, this would create a new user in the backend
    if (name && email && password) {
      const newUser = { ...MOCK_USER, name, email };
      set({ user: newUser, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true });
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({ isLoading: false });
    return !!email;
  },
}));