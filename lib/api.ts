import axios from 'axios';
import { router } from 'expo-router';

export const APP_URL = 'https://spinthewheel.in';

// Create Axios instances
const api = axios.create();
const serviceStationApi = axios.create(); // No hardcoded baseURL

// Function to initialize interceptors
export const initializeApiInterceptors = () => {
  const { getAuthStore } = require('@/stores/authStore');
  const { useTenantStore } = require('@/stores/tenantStore');

  const updateBaseURL = () => {
    const tenantDomain = useTenantStore.getState().tenantDomain;
    if (!tenantDomain) {
      console.warn('Tenant domain not set, using default baseURL');
    }
    const baseURL = tenantDomain
      ? `https://${tenantDomain}/api`
      : `${APP_URL}/api`;
    api.defaults.baseURL = baseURL;
    serviceStationApi.defaults.baseURL = baseURL; // Same baseURL for serviceStationApi
    console.log('API baseURL updated:', baseURL);
  };

  // Subscribe to tenant store changes
  useTenantStore.subscribe(updateBaseURL);
  updateBaseURL();

  const setupInterceptors = (instance: typeof api) => {
    instance.interceptors.request.use(
      (config) => {
        const { token, tenant } = getAuthStore.getState();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (tenant) {
          config.headers['X-Tenant'] = tenant; // Use full tenant domain
          console.log(
            'Request X-Tenant header set:',
            tenant,
            'for URL:',
            config.url
          );
        } else {
          console.warn('No tenant set for request:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log(
            '401 Unauthorized, clearing auth and redirecting to login'
          );
          await getAuthStore.getState().logout();
          router.replace('/TenantScreen');
        } else if (error.response?.status === 404) {
          console.error('404 Not Found:', error.config.url);
        } else if (error.response?.status === 500) {
          console.error(
            '500 Server Error:',
            error.config.url,
            error.response?.data
          );
        } else if (error.message === 'Network Error') {
          console.error(
            'Network error, check server availability:',
            error.config.url
          );
        }
        return Promise.reject(error);
      }
    );
  };

  setupInterceptors(api);
  setupInterceptors(serviceStationApi);
};

// Export instances
export default api;
export { serviceStationApi };
