import { openDatabase } from './migrations';
import { Refuel } from '@/types/refuel';
import api from '@/lib/api';

export function transformToRefuel(refuel: any): Refuel {
  return {
    id: refuel.id.toString(),
    service_station_id: refuel.service_station_id.toString(),
    kilometers_at_refuel: refuel.kilometers_at_refuel,
    litres_fueled: refuel.litres_fueled,
    price_per_litre: refuel.price_per_litre,
    created_at: refuel.created_at,
  };
}

export function transformToRefuelRequest(refuel: {
  service_station_id: string;
  kilometers_at_refuel: string;
  litres_fueled: string;
  price_per_litre: string;
}): any {
  return {
    service_station_id: parseInt(refuel.service_station_id),
    kilometers_at_refuel: parseFloat(refuel.kilometers_at_refuel),
    litres_fueled: parseFloat(refuel.litres_fueled),
    price_per_litre: parseFloat(refuel.price_per_litre),
  };
}

export async function fetchRefuel(): Promise<Refuel[]> {
  try {
    const response = await api.get('/refueling-logs', {
      headers: { Accept: 'application/json' },
    });
    return response.data.map(transformToRefuel);
  } catch (error: any) {
    console.error('Error fetching refuel from API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers,
      url: error.config?.url,
    });
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
  const created_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
  try {
    const config = { headers: { Accept: 'application/json' } };
    console.log('Sending POST request to /refueling-logs', {
      url: '/refueling-logs',
      headers: config.headers,
      data: transformToRefuelRequest(refuel),
    });
    const response = await api.post(
      '/refueling-logs',
      transformToRefuelRequest(refuel),
      config
    );
    return transformToRefuel(response.data);
  } catch (error: any) {
    console.error('Error posting refuel:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers,
      url: error.config?.url,
    });
    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO pending_refuel (service_station_id, kilometers_at_refuel, litres_fueled, price_per_litre, created_at) VALUES (?, ?, ?, ?, ?);',
        [
          refuel.service_station_id,
          refuel.kilometers_at_refuel,
          refuel.litres_fueled,
          refuel.price_per_litre,
          created_at,
        ]
      );
    });
    console.log('Refuel stored in pending_refuel:', { ...refuel, created_at });
    throw error;
  }
}

export async function syncPendingRefuel(): Promise<void> {
  const db = openDatabase();
  const pendingRefuels = db.getAllSync<{
    id: number;
    service_station_id: string;
    kilometers_at_refuel: string;
    litres_fueled: string;
    price_per_litre: string;
    created_at: string;
  }>('SELECT * FROM pending_refuel;');

  for (const refuel of pendingRefuels) {
    try {
      const response = await api.post(
        '/refueling-logs',
        transformToRefuelRequest(refuel),
        {
          headers: { Accept: 'application/json' },
        }
      );
      console.log('Synced refuel:', response.data);
      db.withTransactionSync(() => {
        db.runSync('DELETE FROM pending_refuel WHERE id = ?;', [refuel.id]);
      });
    } catch (error: any) {
      console.error('Error syncing refuel:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers,
        url: error.config?.url,
      });
    }
  }
}
