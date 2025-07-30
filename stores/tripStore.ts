// src/stores/tripStore.ts
import { create } from 'zustand';
import api from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  isJourneyStarted: boolean;
  currentTripId: string | null;
  loadTrips: () => Promise<void>;
  addTrip: (
    trip: Omit<Trip, 'id' | 'created_at' | 'ending_kilometers' | 'ended_at'>
  ) => Promise<Trip>;
  finishTrip: (
    id: string,
    ending_kilometers: string,
    ended_at: string
  ) => Promise<void>;
  setJourneyStarted: (value: boolean) => void;
  setCurrentTripId: (id: string | null) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  isLoading: false,
  isJourneyStarted: false,
  currentTripId: null,

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
        currentTripId: newTrip.id,
        isJourneyStarted: true,
      }));
      console.log('Trip added via API:', newTrip);
      return newTrip;
    } catch (error: any) {
      console.error('Error adding trip via API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      // Fallback to local state
      const newTrip = {
        ...trip,
        id: Date.now().toString(),
        created_at,
        ending_kilometers: null,
        ended_at: null,
        started_at: formattedStartedAt,
      };
      set((state) => ({
        trips: [...state.trips, newTrip],
        currentTripId: newTrip.id,
        isJourneyStarted: true,
      }));
      console.log('Trip added locally:', newTrip);
      return newTrip;
    }
  },

  finishTrip: async (
    id: string,
    ending_kilometers: string,
    ended_at: string
  ) => {
    const formattedEndedAt = new Date(ended_at)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);
    try {
      const config = {
        headers: { Accept: 'application/json' },
      };
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
        isJourneyStarted: false,
        currentTripId: null,
      }));
      console.log('Trip finished via API:', updatedTrip);
    } catch (error: any) {
      console.error('Error finishing trip via API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      set((state) => ({
        trips: state.trips.map((t) =>
          t.id === id
            ? {
                ...t,
                active: false,
                ending_kilometers,
                ended_at: formattedEndedAt,
              }
            : t
        ),
        isJourneyStarted: false,
        currentTripId: null,
      }));
      console.log('Trip finished locally:', {
        id,
        ending_kilometers,
        ended_at,
      });
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

  setCurrentTripId: (id: string | null) => set({ currentTripId: id }),
}));
