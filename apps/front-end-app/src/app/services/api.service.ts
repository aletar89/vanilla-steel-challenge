import axios from 'axios';
// @ts-expect-error - environment is a global variable injected by Vite.
import { environment } from '@environments';
import { InventoryStatsType, PaginatedInventory, PreferenceMatchRow } from '@org/shared-types';


export type SortOrder = 'asc' | 'desc';
export type SortField = 'weight_t' | 'form_choice';

export interface CSVUploadResponse {
  data: PreferenceMatchRow[];
}

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getInventory: async (
    page = 1, 
    pageSize = 10,
    formChoiseSortOrder: SortOrder|undefined = undefined
  ): Promise<PaginatedInventory> => {
    const response = await api.get<PaginatedInventory>('/api/inventory', {
      params: { page, pageSize, formChoiseSortOrder: formChoiseSortOrder }
    });
    return response.data;
  },
  getInventoryStats: async (): Promise<InventoryStatsType> => {
    const response = await api.get<InventoryStatsType>('/api/inventory/stats');
    return response.data;
  },
  uploadCSV: async (file: File): Promise<CSVUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<CSVUploadResponse>('/api/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};


export default apiService; 