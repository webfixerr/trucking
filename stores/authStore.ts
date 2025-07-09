import AsyncStorage  from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { login, logout, loadAuth } from '@/services/db/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tenant: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, tenant: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string, tenant: string) => {
        try {
          set({ isLoading: true });
          const response = await login(email, password, tenant);
          set({
            token: response.access_token,
            user: response.user,
            tenant,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('Login successful, token and tenant set');
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: async () => {
        try {
          await logout();
          set({
            token: null,
            user: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false,
          });
          console.log('Logout successful');
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },
      loadAuth: async () => {
        try {
          set({ isLoading: true });
          const authData = await loadAuth();
          if (authData) {
            set({
              token: authData.access_token,
              user: authData.user,
              tenant: authData.tenant,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log('Auth data loaded:', authData);
          } else {
            set({
              token: null,
              user: null,
              tenant: null,
              isAuthenticated: false,
              isLoading: false,
            });
            console.log('No auth data found');
          }
        } catch (error) {
          set({
            token: null,
            user: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false,
          });
          console.error('Error loading auth data:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const getAuthStore = useAuthStore;
