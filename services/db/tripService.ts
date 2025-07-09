import { openDatabase } from './index';
import { Trip } from '@/types/trip';
import api from '@/lib/api';

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const response = await api.get('/trips');
    return response.data.map((item: any) => ({
      id: item.id,
      pickUpToDestiny: item.pickUpToDestiny,
      distance: item.distance,
      date: item.date,
    }));
  } catch (error) {
    console.error('Error fetching trips from API:', error);
    return [];
  }
}

export async function addTrip(trip: {
  origin: string;
  destination: string;
  beginning_kilometers: string;
  distance_unit: 'km' | 'miles';
}): Promise<Trip | null> {
  const db = openDatabase();
  try {
    const response = await api.post('/trips', trip);
    return {
      id: response.data.id,
      pickUpToDestiny: response.data.pickUpToDestiny,
      distance: response.data.distance,
      date: response.data.date,
    };
  } catch (error: any) {
    console.error('Error posting trip:', error);
    // Store in pending_trips if offline
    db.runSync(
      'INSERT INTO pending_trips (origin, destination, beginning_kilometers, distance_unit, created_at) VALUES (?, ?, ?, ?, ?);',
      [
        trip.origin,
        trip.destination,
        trip.beginning_kilometers,
        trip.distance_unit,
        new Date().toISOString(),
      ]
    );
    console.log('Trip stored in pending_trips:', trip);
    throw error;
  }
}

export async function syncPendingTrips(): Promise<void> {
  const db = openDatabase();
  const pendingTrips = db.getAllSync<{
    id: number;
    origin: string;
    destination: string;
    beginning_kilometers: string;
    distance_unit: string;
  }>('SELECT * FROM pending_trips;');

  for (const trip of pendingTrips) {
    try {
      const response = await api.post('/trips', {
        origin: trip.origin,
        destination: trip.destination,
        beginning_kilometers: trip.beginning_kilometers,
        distance_unit: trip.distance_unit,
      });
      console.log('Synced trip:', response.data);
      db.runSync('DELETE FROM pending_trips WHERE id = ?;', [trip.id]);
    } catch (error) {
      console.error('Error syncing trip:', error);
    }
  }
}

// Commented for future use
/*
export async function getTripById(id: string): Promise<Trip | null> {
  try {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    return null;
  }
}

export async function updateTrip(id: string, data: Partial<Trip>): Promise<Trip | null> {
  try {
    const response = await api.patch(`/trips/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating trip ${id}:`, error);
    return null;
  }
}

export async function deleteTrip(id: string): Promise<void> {
  try {
    await api.delete(`/trips/${id}`);
    console.log(`Trip ${id} deleted`);
  } catch (error) {
    console.error(`Error deleting trip ${id}:`, error);
  }
}
*/
