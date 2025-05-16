import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
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
  loadAuth: () => Promise<void>;
  clearAuthTable: () => void;
  debugAuthTable: () => void;
}

// Initialize SQLite database
const db = SQLite.openDatabaseSync('truckingExpo.db');

// Create auth table
const initDatabase = () => {
  try {
    db.runSync(
      `CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT
andoned
      );`,
      []
    );
    console.log('Auth table created');
  } catch (error) {
    console.error('Error creating auth table:', error);
  }
};

// Call this once to initialize the database
initDatabase();

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
        const token = 'demo-token';
        const user = DEMO_USER;

        // Save to SQLite
        db.runSync(
          `INSERT OR REPLACE INTO auth (id, token, user_id, user_name, user_email) VALUES (1, ?, ?, ?, ?);`,
          [token, user.id, user.name, user.email]
        );
        console.log('Auth data saved to SQLite');

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    try {
      // Clear SQLite
      db.runSync(`DELETE FROM auth WHERE id = 1;`, []);
      console.log('Auth data cleared from SQLite');

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadAuth: async () => {
    try {
      set({ isLoading: true });
      const result = db.getFirstSync<{
        token: string;
        user_id: string;
        user_name: string;
        user_email: string;
      }>(
        `SELECT token, user_id, user_name, user_email FROM auth WHERE id = 1;`
      );
      if (
        result &&
        result.token &&
        result.user_id &&
        result.user_name &&
        result.user_email
      ) {
        set({
          token: result.token,
          user: {
            id: result.user_id,
            name: result.user_name,
            email: result.user_email,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('Auth data loaded from SQLite:', result);
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
          token: null,
          user: null,
        });
        console.log('No valid auth data found in SQLite');
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        token: null,
        user: null,
      });
      console.error('Error loading auth data:', error);
    }
  },

  clearAuthTable: () => {
    try {
      db.runSync(`DELETE FROM auth;`, []);
      console.log('Auth table cleared');
    } catch (error) {
      console.error('Error clearing auth table:', error);
    }
  },

  debugAuthTable: () => {
    try {
      const result = db.getAllSync('SELECT * FROM auth;');
      console.log('Auth table contents:', result);
    } catch (error) {
      console.error('Error reading auth table:', error);
    }
  },
}));

export const getAuthStore = useAuthStore;
