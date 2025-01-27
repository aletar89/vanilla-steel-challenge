import axios from 'axios';
// @ts-expect-error - environment is a global variable injected by Vite.
import { environment } from '@environments';
import { Inventory  } from '@org/shared-types';


const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getInventory: async (): Promise<Inventory[]> => {
    const response = await api.get<Inventory[]>('/api/inventory');
    return response.data;
  },
};

export default apiService; 