import { openDatabase } from './index';
import { Refuel } from '@/types/refuel';

export function getAllRefuel(): Refuel[] {
  const db = openDatabase();
  try {
    const result = db.getAllSync<Refuel>('SELECT * FROM refuel;');
    return result;
  } catch (error) {
    console.error('Error fetching refuel:', error);
    return [];
  }
}

export function insertRefuel(refuel: Omit<Refuel, 'id'>): void {
  const db = openDatabase();
  try {
    db.runSync(
      'INSERT INTO refuel (station, capacity, date) VALUES (?, ?, ?);',
      [refuel.station, refuel.capacity, refuel.date]
    );
    console.log('Refuel inserted:', refuel.station);
  } catch (error) {
    console.error('Error inserting refuel:', error);
  }
}