import axios from 'axios';
// @ts-expect-error - environment is a global variable injected by Vite.
import { environment } from '@environments';
import { InventoryRow, InventoryStatsType  } from '@org/shared-types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getInventory: async (page = 1, pageSize = 10): Promise<PaginatedResponse<InventoryRow>> => {
    const response = await api.get<PaginatedResponse<InventoryRow>>('/api/inventory', {
      params: { page, pageSize }
    });
    return response.data;
  },
  getInventoryStats: async (): Promise<InventoryStatsType> => {
    const response = await api.get<InventoryStatsType>('/api/inventory/stats');
    return response.data;
  },
};


export default apiService; 