import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TenantState {
  tenantDomain: string | null;
  setTenantDomain: (tenant: string) => void;
  clearTenantDomain: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantDomain: null,
      setTenantDomain: (tenant) => {
        const domain =
          tenant.toLowerCase() === 'webfixerr'
            ? 'webfixerr.spinthewheel.in'
            : tenant.toLowerCase();
        set({ tenantDomain: domain });
        console.log('Tenant domain set:', domain);
      },
      clearTenantDomain: () => {
        set({ tenantDomain: null });
        console.log('Tenant domain cleared');
      },
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
