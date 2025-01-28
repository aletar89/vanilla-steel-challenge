import axios from 'axios';
// @ts-expect-error - environment is a global variable injected by Vite.
import { environment } from '@environments';
import { InventoryRow, InventoryStatsType  } from '@org/shared-types';


const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getInventory: async (): Promise<InventoryRow[]> => {
    const response = await api.get<InventoryRow[]>('/api/inventory');
    return response.data;
  },
  getInventoryStats: async (): Promise<InventoryStatsType> => {
    const response = await api.get<InventoryStatsType>('/api/inventory/stats');
    return response.data;
  },
};


export default apiService; 