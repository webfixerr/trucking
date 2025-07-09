import { create } from 'zustand';
import {
  fetchServiceStations,
  addServiceStation,
  syncPendingServiceStations,
} from '@/services/db/serviceStationService';
import { ServiceStation } from '@/types/serviceStation';

interface ServiceStationState {
  serviceStations: ServiceStation[];
  loadServiceStations: () => Promise<void>;
  addServiceStation: (station: {
    name: string;
    location: string;
    fuel_price: string;
    rating: string;
    is_global: boolean;
  }) => Promise<ServiceStation | null>;
  syncPending: () => Promise<void>;
  debugPendingServiceStations: () => void;
}

export const useServiceStationStore = create<ServiceStationState>((set) => ({
  serviceStations: [],
  loadServiceStations: async () => {
    const serviceStations = await fetchServiceStations();
    set({ serviceStations });
    console.log('Service stations loaded from API:', serviceStations.length);
  },
  addServiceStation: async (station) => {
    const newStation = await addServiceStation(station);
    if (newStation) {
      const serviceStations = await fetchServiceStations();
      set({ serviceStations });
      console.log(
        'Service station added and list refreshed:',
        serviceStations.length
      );
      return newStation;
    }
    return null;
  },
  syncPending: async () => {
    await syncPendingServiceStations();
    const serviceStations = await fetchServiceStations();
    set({ serviceStations });
    console.log('Pending service stations synced:', serviceStations.length);
  },
  debugPendingServiceStations: () => {
    const db = require('@/services/db').openDatabase();
    const result = db.getAllSync('SELECT * FROM pending_service_stations;');
    console.log('Pending service stations table contents:', result);
  },
}));
