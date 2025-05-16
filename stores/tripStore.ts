import { create } from 'zustand';
import { getAllTrips, insertTrip } from '@/services/db/tripService';
import { Trip } from '@/types/trip';

interface TripState {
  trips: Trip[];
  loadTrips: () => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  debugTrips: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  loadTrips: () => {
    const trips = getAllTrips();
    set({ trips });
    console.log('Trips loaded:', trips.length);
  },
  addTrip: (trip) => {
    insertTrip(trip);
    const trips = getAllTrips();
    set({ trips });
  },
  debugTrips: () => {
    const db = require('@/services/db').openDatabase();
    const result = db.getAllSync('SELECT * FROM trips;');
    console.log('Trips table contents:', result);
  },
}));
