import { create } from 'zustand';
import api from '@/lib/api';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await api.request('POST', '/auth/login', { email, password });
      set({
        token: response?.token,
        user: response?.user,
        isAuthenticated: true,
        isLoading: false,
      });
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