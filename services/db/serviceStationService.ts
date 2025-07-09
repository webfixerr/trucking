import { ServiceStation } from '@/types/serviceStation';
import { openDatabase } from './index';

import api from '@/lib/api';

export function transformToServiceStation(station: any): ServiceStation {
  return {
    id: station.id.toString(),
    name: station.name,
    location: station.location,
    fuel_price: station.fuel_price,
    rating: station.rating.toString(),
    is_global: !!station.is_global,
  };
}

export function transformToServiceStationRequest(station: {
  name: string;
  location: string;
  fuel_price: string;
  rating: string;
  is_global: boolean;
}): any {
  return {
    name: station.name,
    location: station.location,
    fuel_price: station.fuel_price,
    rating: parseFloat(station.rating),
    is_global: station.is_global ? 1 : 0,
  };
}

export async function fetchServiceStations(): Promise<ServiceStation[]> {
  try {
    const response = await api.get('/service-stations');
    return response.data.map(transformToServiceStation);
  } catch (error) {
    console.error('Error fetching service stations from API:', error);
    return [];
  }
}

export async function addServiceStation(station: {
  name: string;
  location: string;
  fuel_price: string;
  rating: string;
  is_global: boolean;
}): Promise<ServiceStation | null> {
  const db = openDatabase();
  try {
    const response = await api.post(
      '/service-stations',
      transformToServiceStationRequest(station)
    );
    return transformToServiceStation(response.data);
  } catch (error: any) {
    console.error('Error posting service station:', error);
    db.runSync(
      'INSERT INTO pending_service_stations (name, location, fuel_price, rating, is_global, created_at) VALUES (?, ?, ?, ?, ?, ?);',
      [
        station.name,
        station.location,
        station.fuel_price,
        station.rating,
        station.is_global ? 1 : 0,
        new Date().toISOString(),
      ]
    );
    console.log('Service station stored in pending_service_stations:', station);
    throw error;
  }
}

export async function syncPendingServiceStations(): Promise<void> {
  const db = openDatabase();
  const pendingStations = db.getAllSync<{
    id: number;
    name: string;
    location: string;
    fuel_price: string;
    rating: string;
    is_global: number;
  }>('SELECT * FROM pending_service_stations;');

  for (const station of pendingStations) {
    try {
      const response = await api.post('/service-stations', {
        name: station.name,
        location: station.location,
        fuel_price: station.fuel_price,
        rating: parseFloat(station.rating),
        is_global: !!station.is_global,
      });
      console.log('Synced service station:', response.data);
      db.runSync('DELETE FROM pending_service_stations WHERE id = ?;', [
        station.id,
      ]);
    } catch (error) {
      console.error('Error syncing service station:', error);
    }
  }
}

// Commented for future use
/*
export async function getServiceStationById(id: string): Promise<ServiceStation | null> {
  try {
    const response = await api.get(`/service-stations/${id}`);
    return transformToServiceStation(response.data);
  } catch (error) {
    console.error(`Error fetching service station ${id}:`, error);
    return null;
  }
}

export async function updateServiceStation(id: string, data: Partial<ServiceStation>): Promise<ServiceStation | null> {
  try {
    const response = await api.patch(`/service-stations/${id}`, data);
    return transformToServiceStation(response.data);
  } catch (error) {
    console.error(`Error updating service station ${id}:`, error);
    return null;
  }
}

export async function deleteServiceStation(id: string): Promise<void> {
  try {
    await api.delete(`/service-stations/${id}`);
    console.log(`Service station ${id} deleted`);
  } catch (error) {
    console.error(`Error deleting service station ${id}:`, error);
  }
}
*/
