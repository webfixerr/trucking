import { create } from 'zustand';
import { openDatabase } from '@/services/db/migrations';
import { Refuel } from '@/types/refuel';
import {
  fetchRefuel,
  addRefuel,
  syncPendingRefuel,
} from '@/services/db/refuelService';
import { useServiceStationStore } from './serviceStationStore';

interface RefuelState {
  refuelLogs: Refuel[];
  isLoading: boolean;
  loadRefuel: () => Promise<void>;
  addRefuel: (refuel: Omit<Refuel, 'id' | 'created_at'>) => Promise<void>;
  syncPending: () => Promise<void>;
  debugPendingRefuel: () => void;
}

export const useRefuelStore = create<RefuelState>((set, get) => ({
  refuelLogs: [],
  isLoading: false,

  loadRefuel: async () => {
    set({ isLoading: true });
    try {
      const apiRefuels = await fetchRefuel();
      set({ refuelLogs: apiRefuels });
      console.log('Refuel loaded from API:', apiRefuels.length, apiRefuels);
    } catch (error) {
      console.error('Error loading refuels:', error);
      set({ refuelLogs: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addRefuel: async (refuel: Omit<Refuel, 'id' | 'created_at'>) => {
    const created_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
    try {
      const newRefuel = await addRefuel(refuel);
      if (newRefuel) {
        set((state) => ({
          refuelLogs: [...state.refuelLogs, newRefuel],
        }));
        console.log('Refuel added via API:', newRefuel);
      }
    } catch (error: any) {
      console.error('Error adding refuel:', error);
      const db = openDatabase();
      db.withTransactionSync(() => {
        db.runSync(
          `INSERT INTO pending_refuel (service_station_id, kilometers_at_refuel, litres_fueled, price_per_litre, created_at) VALUES (?, ?, ?, ?, ?);`,
          [
            refuel.service_station_id,
            refuel.kilometers_at_refuel,
            refuel.litres_fueled,
            refuel.price_per_litre,
            created_at,
          ]
        );
      });
      set((state) => ({
        refuelLogs: [
          ...state.refuelLogs,
          { ...refuel, id: `pending-${Date.now()}`, created_at },
        ],
      }));
      console.log('Refuel added to SQLite:', { ...refuel, created_at });
      throw error;
    }
  },

  syncPending: async () => {
    try {
      await syncPendingRefuel();
      await get().loadRefuel();
      console.log('Pending refuels synced');
    } catch (error) {
      console.error('Error syncing pending refuels:', error);
    }
  },

  debugPendingRefuel: () => {
    try {
      const db = openDatabase();
      db.withTransactionSync(() => {
        const pendingRefuels = db.getAllSync('SELECT * FROM pending_refuel;');
        console.log('Pending refuel table contents:', pendingRefuels);
      });
    } catch (error) {
      console.error('Error reading pending refuel table:', error);
    }
  },
}));
