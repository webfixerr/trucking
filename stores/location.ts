import { create } from 'zustand';

type Location = {
  latitude: number;
  longitude: number;
} | null;

type LocationState = {
  currentLocation: Location;
  setCurrentLocation: (location: Location) => void;
  resetLocation: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  resetLocation: () => set({ currentLocation: null }),
}));
