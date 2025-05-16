import { create } from 'zustand';
import { getAllRefuel, insertRefuel } from '@/services/db/refuelService';
import { Refuel } from '@/types/refuel';

interface RefuelState {
  refuel: Refuel[];
  loadRefuel: () => void;
  addRefuel: (refuel: Omit<Refuel, 'id'>) => void;
  debugRefuel: () => void;
}

export const useRefuelStore = create<RefuelState>((set) => ({
  refuel: [],
  loadRefuel: () => {
    const refuel = getAllRefuel();
    set({ refuel });
    console.log('Refuel loaded:', refuel.length);
  },
  addRefuel: (refuel) => {
    insertRefuel(refuel);
    const refuelData = getAllRefuel();
    set({ refuel: refuelData });
  },
  debugRefuel: () => {
    const db = require('@/services/db').openDatabase();
    const result = db.getAllSync('SELECT * FROM refuel;');
    console.log('Refuel table contents:', result);
  },
}));
