import { create } from 'zustand';
import api from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDistance } from '@/utils/distanceUtils';
import * as Location from 'expo-location';

interface Location {
  latitude: string;
  longitude: string;
  timestamp: string;
  trip_id: string;
}

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
  start_latitude?: string;
  start_longitude?: string;
}

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  isJourneyStarted: boolean;
  currentTripId: string | null;
  loadTrips: () => Promise<void>;
  addTrip: (
    trip: Omit<
      Trip,
      | 'id'
      | 'created_at'
      | 'ending_kilometers'
      | 'ended_at'
      | 'start_latitude'
      | 'start_longitude'
    >
  ) => Promise<Trip>;
  finishTrip: (
    id: string,
    ending_kilometers: string,
    ended_at: string
  ) => Promise<{ trip: Trip; distance: number }>;
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
        start_latitude: trip.start_latitude || null,
        start_longitude: trip.start_longitude || null,
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
    trip: Omit<
      Trip,
      | 'id'
      | 'created_at'
      | 'ending_kilometers'
      | 'ended_at'
      | 'start_latitude'
      | 'start_longitude'
    >
  ) => {
    const created_at = new Date().toISOString();
    const formattedStartedAt = new Date(trip.started_at)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);
    try {
      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      console.log('Initial trip location:', { latitude, longitude });

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
          start_latitude: latitude.toString(),
          start_longitude: longitude.toString(),
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
        start_latitude: latitude.toString(),
        start_longitude: longitude.toString(),
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
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => ({
        coords: { latitude: 0, longitude: 0 },
      }));
      const { latitude, longitude } = location.coords;
      const newTrip = {
        ...trip,
        id: Date.now().toString(),
        created_at,
        ending_kilometers: null,
        ended_at: null,
        started_at: formattedStartedAt,
        start_latitude: latitude.toString(),
        start_longitude: longitude.toString(),
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
      // Get current location for end point
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      console.log('End trip location:', { latitude, longitude });

      // Calculate distance
      const trip = get().trips.find((t) => t.id === id);
      let distance = 0;
      if (trip && trip.start_latitude && trip.start_longitude) {
        distance = calculateDistance(
          parseFloat(trip.start_latitude),
          parseFloat(trip.start_longitude),
          latitude,
          longitude
        );
        console.log(
          `Calculated distance for trip ${id}: ${distance} km`,
          `Start: (${trip.start_latitude}, ${trip.start_longitude})`,
          `End: (${latitude}, ${longitude})`
        );
      } else {
        console.warn(`No start coordinates for trip ${id}`);
      }

      // Update trip on backend
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
        start_latitude:
          response.data.data.start_latitude || trip?.start_latitude,
        start_longitude:
          response.data.data.start_longitude || trip?.start_longitude,
      };
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? updatedTrip : t)),
        isJourneyStarted: false,
        currentTripId: null,
      }));
      console.log('Trip finished via API:', updatedTrip);
      return { trip: updatedTrip, distance };
    } catch (error: any) {
      console.error('Error finishing trip via API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
      const trip = get().trips.find((t) => t.id === id);
      let distance = 0;
      if (trip && trip.start_latitude && trip.start_longitude) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(() => ({
          coords: { latitude: 0, longitude: 0 },
        }));
        const { latitude, longitude } = location.coords;
        distance = calculateDistance(
          parseFloat(trip.start_latitude),
          parseFloat(trip.start_longitude),
          latitude,
          longitude
        );
        console.log(
          `Calculated distance for trip ${id} (local): ${distance} km`,
          `Start: (${trip.start_latitude}, ${trip.start_longitude})`,
          `End: (${latitude}, ${longitude})`
        );
      }
      const updatedTrip = {
        ...trip!,
        active: false,
        ending_kilometers,
        ended_at: formattedEndedAt,
      };
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? updatedTrip : t)),
        isJourneyStarted: false,
        currentTripId: null,
      }));
      console.log('Trip finished locally:', {
        id,
        ending_kilometers,
        ended_at,
      });
      return { trip: updatedTrip, distance };
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
