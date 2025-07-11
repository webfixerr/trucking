import { ServiceStation } from '@/types/serviceStation';
import { openDatabase } from './migrations';
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
    fuel_price: parseFloat(station.fuel_price),
    rating: parseFloat(station.rating),
    is_global: station.is_global ? 1 : 0,
  };
}

export async function fetchServiceStations(): Promise<ServiceStation[]> {
  try {
    const response = await api.get('/service-stations', {
      headers: { 'Accept': 'application/json' },
    });
    return response.data.map(transformToServiceStation);
  } catch (error: any) {
    console.error('Error fetching service stations from API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers,
      url: error.config?.url,
    });
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
  const created_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
  try {
    const config = { headers: { 'Accept': 'application/json' } };
    console.log('Sending POST request to /service-stations', {
      url: '/service-stations',
      headers: config.headers,
      data: transformToServiceStationRequest(station),
    });
    const response = await api.post('/service-stations', transformToServiceStationRequest(station), config);
    return transformToServiceStation(response.data);
  } catch (error: any) {
    console.error('Error posting service station:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers,
      url: error.config?.url,
    });
    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO pending_service_stations (name, location, fuel_price, rating, is_global, created_at) VALUES (?, ?, ?, ?, ?, ?);',
        [
          station.name,
          station.location,
          station.fuel_price,
          station.rating,
          station.is_global ? 1 : 0,
          created_at,
        ]
      );
    });
    console.log('Service station stored in pending_service_stations:', { ...station, created_at });
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
    created_at: string;
  }>('SELECT * FROM pending_service_stations;');

  for (const station of pendingStations) {
    try {
      const stationRequest = {
        name: station.name,
        location: station.location,
        fuel_price: station.fuel_price,
        rating: station.rating,
        is_global: !!station.is_global, // Convert number to boolean
      };
      const response = await api.post('/service-stations', transformToServiceStationRequest(stationRequest), {
        headers: { 'Accept': 'application/json' },
      });
      console.log('Synced service station:', response.data);
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM pending_service_stations WHERE id = ?;', [station.id]);
      });
    } catch (error: any) {
      console.error('Error syncing service station:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
    }
  }
}