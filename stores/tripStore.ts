import { create } from 'zustand';
import api from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// Custom SQLError interface since expo-sqlite doesn't export it
interface SQLError {
  code: number;
  message: string;
}

const db = SQLite.openDatabaseSync('truckersApp.db');

interface Trip {
  id: string;
  origin: string;
  destination: string;
  beginning_kilometers: string;
  ending_kilometers: string | null;
  started_at: string;
  ended_at: string | null;
  active: boolean;
  end_notification_sent: boolean;
  created_at: string;
}

interface PendingTrip {
  id: number;
  origin: string;
  destination: string;
  beginning_kilometers: string;
  started_at: string;
  active: number;
  end_notification_sent: number;
  created_at: string;
}

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  isJourneyStarted: boolean;
  loadTrips: () => void;
  addTrip: (
    trip: Omit<Trip, 'id' | 'created_at' | 'ending_kilometers' | 'ended_at'>
  ) => void;
  finishTrip: (id: string, ending_kilometers: string, ended_at: string) => void;
  syncPending: () => void;
  setJourneyStarted: (value: boolean) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  isLoading: false,
  isJourneyStarted: false,

  loadTrips: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/trips', {
        headers: { Accept: 'application/json' },
      });
      const apiTrips = response.data.data.map((trip: any) => ({
        id: trip.id.toString(),
        origin: trip.origin,
        destination: trip.destination,
        beginning_kilometers: trip.beginning_kilometers,
        ending_kilometers: trip.ending_kilometers || null,
        started_at: trip.started_at,
        ended_at: trip.ended_at || null,
        active: trip.active,
        end_notification_sent: trip.end_notification_sent,
        created_at: trip.created_at,
      }));
      set({ trips: apiTrips });
      // console.log('Trips loaded from API:', apiTrips.length, apiTrips);
    } catch (error: any) {
      console.error('Error fetching trips from API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      set({ trips: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addTrip: async (
    trip: Omit<Trip, 'id' | 'created_at' | 'ending_kilometers' | 'ended_at'>
  ) => {
    const created_at = new Date().toISOString();
    const formattedStartedAt = new Date(trip.started_at)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);
    try {
      const config = {
        headers: { Accept: 'application/json' },
      };
      // console.log('Sending POST request to /trips', {
      //   url: '/trips',
      //   headers: config.headers,
      //   data: {
      //     origin: trip.origin,
      //     destination: trip.destination,
      //     beginning_kilometers: Number(trip.beginning_kilometers),
      //     started_at: formattedStartedAt,
      //     active: trip.active,
      //     end_notification_sent: trip.end_notification_sent,
      //   },
      // });
      const response = await api.post(
        '/trips',
        {
          origin: trip.origin,
          destination: trip.destination,
          beginning_kilometers: Number(trip.beginning_kilometers),
          started_at: formattedStartedAt,
          active: trip.active,
          end_notification_sent: trip.end_notification_sent,
        },
        config
      );
      const newTrip = {
        ...trip,
        id: response.data.data.id.toString(),
        created_at,
        ending_kilometers: null,
        ended_at: null,
        started_at: formattedStartedAt,
      };
      set((state) => ({
        trips: [...state.trips, newTrip],
      }));
      // console.log('Trip added via API:', newTrip);
    } catch (error: any) {
      console.error('Error adding trip via API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      // Save to SQLite on network failure
      await new Promise<void>((resolve, reject) => {
        db.withTransactionSync(() => {
          try {
            db.runSync(
              `INSERT INTO pending_trips (origin, destination, beginning_kilometers, started_at, active, end_notification_sent, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                trip.origin,
                trip.destination,
                trip.beginning_kilometers,
                formattedStartedAt,
                trip.active ? 1 : 0,
                trip.end_notification_sent ? 1 : 0,
                created_at,
              ]
            );
            // console.log('Trip saved to SQLite for later sync:', {
            //   ...trip,
            //   started_at: formattedStartedAt,
            // });
            resolve();
          } catch (err: any) {
            console.error('Error saving trip to SQLite:', err);
            reject(err);
          }
        });
      });
      throw error;
    }
  },

  finishTrip: async (
    id: string,
    ending_kilometers: string,
    ended_at: string
  ) => {
    try {
      const formattedEndedAt = new Date(ended_at)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      const config = {
        headers: { Accept: 'application/json' },
      };
      // console.log('Sending PATCH request to /trips/' + id, {
      //   url: `/trips/${id}`,
      //   headers: config.headers,
      //   data: {
      //     ending_kilometers: Number(ending_kilometers),
      //     ended_at: formattedEndedAt,
      //     active: false,
      //   },
      // });
      const response = await api.patch(
        `/trips/${id}`,
        {
          ending_kilometers: Number(ending_kilometers),
          ended_at: formattedEndedAt,
          active: false,
        },
        config
      );
      const updatedTrip = {
        id,
        origin: response.data.data.origin,
        destination: response.data.data.destination,
        beginning_kilometers: response.data.data.beginning_kilometers,
        ending_kilometers: response.data.data.ending_kilometers.toString(),
        started_at: response.data.data.started_at,
        ended_at: response.data.data.ended_at,
        active: response.data.data.active,
        end_notification_sent: response.data.data.end_notification_sent,
        created_at: response.data.data.created_at,
      };
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? updatedTrip : t)),
        isJourneyStarted: false, // Update journey status
      }));
      // console.log('Trip finished via API:', updatedTrip);
    } catch (error: any) {
      console.error('Error finishing trip via API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      // Fallback to loadTrips on error to ensure consistency
      await get().loadTrips();
      throw error;
    }
  },

  syncPending: async () => {
    try {
      const pendingTrips = await new Promise<PendingTrip[]>(
        (resolve, reject) => {
          db.withTransactionSync(() => {
            try {
              const result = db.getAllSync<PendingTrip>(
                `SELECT * FROM pending_trips`,
                []
              );
              resolve(result);
            } catch (err: any) {
              console.error('Error fetching pending trips:', err);
              reject(err);
            }
          });
        }
      );

      for (const trip of pendingTrips) {
        try {
          const formattedStartedAt = new Date(trip.started_at)
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19);
          const response = await api.post(
            '/trips',
            {
              origin: trip.origin,
              destination: trip.destination,
              beginning_kilometers: Number(trip.beginning_kilometers),
              started_at: formattedStartedAt,
              active: Boolean(trip.active),
              end_notification_sent: Boolean(trip.end_notification_sent),
            },
            {
              headers: { Accept: 'application/json' },
            }
          );
          // console.log('Pending trip synced:', response.data.data);
          // Remove from SQLite
          db.withTransactionSync(() => {
            try {
              db.runSync(`DELETE FROM pending_trips WHERE id = ?`, [trip.id]);
              console.log('Pending trip deleted from SQLite:', trip.id);
            } catch (err: any) {
              console.error('Error deleting pending trip:', err);
            }
          });
        } catch (error) {
          console.error('Error syncing pending trip:', error);
        }
      }
      await get().loadTrips();
    } catch (error) {
      console.error('Error in syncPending:', error);
    }
  },

  setJourneyStarted: async (value: boolean) => {
    try {
      await AsyncStorage.setItem('isJourneyStarted', JSON.stringify(value));
      set({ isJourneyStarted: value });
      console.log('Journey started set to:', value);
    } catch (error) {
      console.error('Error setting journey started:', error);
    }
  },
}));
