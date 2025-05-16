import { openDatabase } from './index';
import { Trip } from '@/types/trip';

export function getAllTrips(): Trip[] {
  const db = openDatabase();
  try {
    const result = db.getAllSync<Trip>('SELECT * FROM trips;');
    return result;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
}

export function insertTrip(trip: Omit<Trip, 'id'>): void {
  const db = openDatabase();
  try {
    db.runSync(
      'INSERT INTO trips (pickUpToDestiny, distance, date) VALUES (?, ?, ?);',
      [trip.pickUpToDestiny, trip.distance, trip.date]
    );
    console.log('Trip inserted:', trip.pickUpToDestiny);
  } catch (error) {
    console.error('Error inserting trip:', error);
  }
}