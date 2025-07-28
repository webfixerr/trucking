// src/services/locationService.ts
import { openDatabase } from './migrations';
import api from '@/lib/api';

export interface LocationData {
  id: string;
  latitude: string;
  longitude: string;
  timestamp: string;
  trip_id: string;
}

export async function addLocation(location: { latitude: string; longitude: string; timestamp: string; trip_id: string }): Promise<LocationData | null> {
  const db = openDatabase();
  const created_at = new Date().toISOString();
  try {
    const response = await api.post('/locations', { ...location, created_at }, {
      headers: { 'Accept': 'application/json' },
    });
    return { ...location, id: response.data.id };
  } catch (error: any) {
    console.error('Error posting location:', error);
    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO pending_locations (latitude, longitude, timestamp, trip_id, created_at) VALUES (?, ?, ?, ?, ?);',
        [location.latitude, location.longitude, location.timestamp, location.trip_id, created_at]
      );
    });
    console.log('Stored location in pending_locations:', { ...location, created_at });
    return null;
  }
}

export async function syncPendingLocations(): Promise<void> {
  const db = openDatabase();
  const pendingLocations = db.getAllSync<{
    id: number;
    latitude: string;
    longitude: string;
    timestamp: string;
    trip_id: string;
    created_at: string;
  }>('SELECT * FROM pending_locations;');

  for (const location of pendingLocations) {
    try {
      const response = await api.post('/locations', {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        trip_id: location.trip_id,
        created_at: location.created_at,
      }, {
        headers: { 'Accept': 'application/json' },
      });
      console.log('Synced location:', response.data);
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM pending_locations WHERE id = ?;', [location.id]);
      });
    } catch (error: any) {
      console.error('Error syncing location:', error);
    }
  }
}