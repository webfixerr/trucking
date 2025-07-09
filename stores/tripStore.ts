import { create } from 'zustand';
import { openDatabase } from '@/services/db/migrations';
import api from '@/lib/api';

interface Trip {
  id: string;
  starting_point: string;
  ending_point: string;
  starting_kilometers: string;
  created_at: string;
}

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  loadTrips: () => void;
  addTrip: (trip: Omit<Trip, 'id' | 'created_at'>) => void;
  syncPending: () => void;
  debugPendingTrips: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  isLoading: false,

  loadTrips: () => {
    set({ isLoading: true });
    try {
      // Load from API
      try {
        api.get('/trips').then((response) => {
          const apiTrips = response.data.map((trip: any) => ({
            id: trip.id.toString(),
            starting_point: trip.starting_point,
            ending_point: trip.ending_point,
            starting_kilometers: trip.starting_kilometers,
            created_at: trip.created_at,
          }));
          set({ trips: apiTrips });
          console.log('Trips loaded from API:', apiTrips.length);
        });
      } catch (error) {
        console.error('Error fetching trips from API:', error);
      }

      // Load pending trips from SQLite
      try {
        const db = openDatabase();
        db.withTransactionSync(() => {
          try {
            const pendingTrips = db.getAllSync<Trip>(
              `SELECT id, starting_point, ending_point, starting_kilometers, created_at FROM pending_trips;`
            );
            set((state) => ({
              trips: [...state.trips, ...pendingTrips],
            }));
            console.log(
              'Pending trips loaded from SQLite:',
              pendingTrips.length
            );
          } catch (error) {
            console.error('Error querying pending_trips table:', error);
            // Ensure table exists
            db.runSync(`
              CREATE TABLE IF NOT EXISTS pending_trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                starting_point TEXT,
                ending_point TEXT,
                starting_kilometers TEXT,
                created_at TEXT
              );
            `);
            console.log('Pending trips table recreated');
          }
        });
      } catch (error) {
        console.error('Error loading pending trips from SQLite:', error);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addTrip: (trip: Omit<Trip, 'id' | 'created_at'>) => {
    try {
      const created_at = new Date().toISOString();
      const db = openDatabase();
      db.withTransactionSync(() => {
        db.runSync(
          `INSERT INTO pending_trips (starting_point, ending_point, starting_kilometers, created_at) VALUES (?, ?, ?, ?);`,
          [
            trip.starting_point,
            trip.ending_point,
            trip.starting_kilometers,
            created_at,
          ]
        );
      });
      console.log('Trip added to SQLite:', trip);
      set((state) => ({
        trips: [
          ...state.trips,
          { ...trip, id: 'pending-' + Date.now(), created_at },
        ],
      }));
    } catch (error) {
      console.error('Error adding trip to SQLite:', error);
      throw error;
    }
  },

  syncPending: () => {
    try {
      const db = openDatabase();
      db.withTransactionSync(() => {
        const pendingTrips = db.getAllSync<Trip>(
          `SELECT id, starting_point, ending_point, starting_kilometers, created_at FROM pending_trips;`
        );
        if (pendingTrips.length === 0) return;

        for (const trip of pendingTrips) {
          try {
            api
              .post('/trips', {
                starting_point: trip.starting_point,
                ending_point: trip.ending_point,
                starting_kilometers: trip.starting_kilometers,
                created_at: trip.created_at,
              })
              .then(() => {
                db.runSync(`DELETE FROM pending_trips WHERE id = ?;`, [
                  trip.id,
                ]);
                console.log('Synced trip:', trip.id);
              });
          } catch (error) {
            console.error('Error syncing trip:', error);
          }
        }
      });
      get().loadTrips();
    } catch (error) {
      console.error('Error syncing pending trips:', error);
    }
  },

  debugPendingTrips: () => {
    try {
      const db = openDatabase();
      db.withTransactionSync(() => {
        const pendingTrips = db.getAllSync('SELECT * FROM pending_trips;');
        console.log('Pending trips table contents:', pendingTrips);
      });
    } catch (error) {
      console.error('Error reading pending trips table:', error);
    }
  },
}));
