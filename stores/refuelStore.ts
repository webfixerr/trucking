import { create } from 'zustand';
import { openDatabase } from '@/services/db/migrations';
import api from '@/lib/api';

interface Refuel {
  id: string;
  service_station_id: string;
  kilometers_at_refuel: string;
  litres_fueled: string;
  price_per_litre: string;
  created_at: string;
}

interface RefuelState {
  refuelLogs: Refuel[];
  isLoading: boolean;
  loadRefuel: () => void;
  addRefuel: (refuel: Omit<Refuel, 'id' | 'created_at'>) => void;
  syncPending: () => void;
  debugPendingRefuel: () => void;
}

export const useRefuelStore = create<RefuelState>((set, get) => ({
  refuelLogs: [],
  isLoading: false,

  loadRefuel: () => {
    set({ isLoading: true });
    try {
      // Load from API
      try {
        api.get('/refueling-logs').then((response) => {
          const apiRefuels = response.data.map((refuel: any) => ({
            id: refuel.id.toString(),
            service_station_id: refuel.service_station_id,
            kilometers_at_refuel: refuel.kilometers_at_refuel,
            litres_fueled: refuel.litres_fueled,
            price_per_litre: refuel.price_per_litre,
            created_at: refuel.created_at,
          }));
          set({ refuelLogs: apiRefuels });
          console.log('Refuel loaded from API:', apiRefuels.length);
        });
      } catch (error) {
        console.error('Error fetching refuel from API:', error);
      }

      // Load pending refuels from SQLite
      try {
        const db = openDatabase();
        db.withTransactionSync(() => {
          try {
            const pendingRefuels = db.getAllSync<Refuel>(
              `SELECT id, service_station_id, kilometers_at_refuel, litres_fueled, price_per_litre, created_at FROM pending_refuel;`
            );
            set((state) => ({
              refuelLogs: [...state.refuelLogs, ...pendingRefuels],
            }));
            console.log(
              'Pending refuels loaded from SQLite:',
              pendingRefuels.length
            );
          } catch (error) {
            console.error('Error querying pending_refuel table:', error);
            // Ensure table exists
            db.runSync(`
              CREATE TABLE IF NOT EXISTS pending_refuel (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_station_id TEXT,
                kilometers_at_refuel TEXT,
                litres_fueled TEXT,
                price_per_litre TEXT,
                created_at TEXT
              );
            `);
            console.log('Pending refuel table recreated');
          }
        });
      } catch (error) {
        console.error('Error loading pending refuels from SQLite:', error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addRefuel: (refuel: Omit<Refuel, 'id' | 'created_at'>) => {
    try {
      const created_at = new Date().toISOString();
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
      console.log('Refuel added to SQLite:', refuel);
      set((state) => ({
        refuelLogs: [
          ...state.refuelLogs,
          { ...refuel, id: 'pending-' + Date.now(), created_at },
        ],
      }));
    } catch (error) {
      console.error('Error adding refuel to SQLite:', error);
      throw error;
    }
  },

  syncPending: () => {
    try {
      const db = openDatabase();
      db.withTransactionSync(() => {
        const pendingRefuels = db.getAllSync<Refuel>(
          `SELECT id, service_station_id, kilometers_at_refuel, litres_fueled, price_per_litre, created_at FROM pending_refuel;`
        );
        if (pendingRefuels.length === 0) return;

        for (const refuel of pendingRefuels) {
          try {
            api
              .post('/refueling-logs', {
                service_station_id: refuel.service_station_id,
                kilometers_at_refuel: refuel.kilometers_at_refuel,
                litres_fueled: refuel.litres_fueled,
                price_per_litre: refuel.price_per_litre,
                created_at: refuel.created_at,
              })
              .then(() => {
                db.runSync(`DELETE FROM pending_refuel WHERE id = ?;`, [
                  refuel.id,
                ]);
                console.log('Synced refuel:', refuel.id);
              });
          } catch (error) {
            console.error('Error syncing refuel:', error);
          }
        }
      });
      get().loadRefuel();
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
