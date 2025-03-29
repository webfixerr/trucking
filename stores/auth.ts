import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const DEMO_USER = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      // Demo authentication logic
      if (email === 'demo@example.com' && password === 'demo123') {
        set({
          token: 'demo-token',
          user: DEMO_USER,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

// Selector to get auth store state from anywhere
export const getAuthStore = useAuthStore;