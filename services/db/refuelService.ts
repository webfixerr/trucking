import { openDatabase } from './index';
import { Refuel } from '@/types/refuel';
import api from '@/lib/api';

export function transformToRefuel(refuel: any): Refuel {
  return {
    id: refuel.id,
    service_station: refuel.service_station,
    kilometers_at_refuel: refuel.kilometers_at_refuel,
    litres_fueled: refuel.litres_fueled,
    price_per_litre: refuel.price_per_litre,
  };
}

export function transformToRefuelRequest(refuel: {
  service_station_id: string;
  kilometers_at_refuel: string;
  litres_fueled: string;
  price_per_litre: string;
}): any {
  return {
    service_station_id: refuel.service_station_id,
    kilometers_at_refuel: refuel.kilometers_at_refuel,
    litres_fueled: refuel.litres_fueled,
    price_per_litre: refuel.price_per_litre,
  };
}

export async function fetchRefuel(): Promise<Refuel[]> {
  try {
    const response = await api.get('/refueling-logs');
    return response.data.map(transformToRefuel);
  } catch (error) {
    console.error('Error fetching refuel from API:', error);
    return [];
  }
}

export async function addRefuel(refuel: {
  service_station_id: string;
  kilometers_at_refuel: string;
  litres_fueled: string;
  price_per_litre: string;
}): Promise<Refuel | null> {
  const db = openDatabase();
  try {
    const response = await api.post(
      '/refueling-logs',
      transformToRefuelRequest(refuel)
    );
    return transformToRefuel(response.data);
  } catch (error: any) {
    console.error('Error posting refuel:', error);
    db.runSync(
      'INSERT INTO pending_refuel (service_station_id, kilometers_at_refuel, litres_fueled, price_per_litre, created_at) VALUES (?, ?, ?, ?, ?);',
      [
        refuel.service_station_id,
        refuel.kilometers_at_refuel,
        refuel.litres_fueled,
        refuel.price_per_litre,
        new Date().toISOString(),
      ]
    );
    console.log('Refuel stored in pending_refuel:', refuel);
    throw error;
  }
}

export async function syncPendingRefuel(): Promise<void> {
  const db = openDatabase();
  const pendingRefuel = db.getAllSync<{
    id: number;
    service_station_id: string;
    kilometers_at_refuel: string;
    litres_fueled: string;
    price_per_litre: string;
  }>('SELECT * FROM pending_refuel;');

  for (const refuel of pendingRefuel) {
    try {
      const response = await api.post(
        '/refueling-logs',
        transformToRefuelRequest(refuel)
      );
      console.log('Synced refuel:', response.data);
      db.runSync('DELETE FROM pending_refuel WHERE id = ?;', [refuel.id]);
    } catch (error) {
      console.error('Error syncing refuel:', error);
    }
  }
}

// Commented for future use
/*
export async function getRefuelById(id: string): Promise<Refuel | null> {
  try {
    const response = await api.get(`/refueling-logs/${id}`);
    return transformToRefuel(response.data);
  } catch (error) {
    console.error(`Error fetching refuel ${id}:`, error);
    return null;
  }
}

export async function updateRefuel(id: string, data: Partial<Refuel>): Promise<Refuel | null> {
  try {
    const response = await api.patch(`/refueling-logs/${id}`, data);
    return transformToRefuel(response.data);
  } catch (error) {
    console.error(`Error updating refuel ${id}:`, error);
    return null;
  }
}

export async function deleteRefuel(id: string): Promise<void> {
  try {
    await api.delete(`/refueling-logs/${id}`);
    console.log(`Refuel ${id} deleted`);
  } catch (error) {
    console.error(`Error deleting refuel ${id}:`, error);
  }
}
*/
