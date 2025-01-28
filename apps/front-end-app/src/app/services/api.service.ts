import axios from 'axios';
// @ts-expect-error - environment is a global variable injected by Vite.
import { environment } from '@environments';
import { InventoryStatsType, PaginatedInventory, PreferenceMatchRow } from '@org/shared-types';


export type SortOrder = 'asc' | 'desc';
export type SortField = 'weight_t' | 'form_choice';

export interface CSVUploadResponse {
  data: PreferenceMatchRow[];
}



interface Cache {
  [key: string]: {
    data: PaginatedInventory | InventoryStatsType  | CSVUploadResponse;
    timestamp: number;
  };
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const cache: Cache = {};


const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

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
    const cacheKey = `${page}-${pageSize}-${formChoiseSortOrder || 'none'}`;
    const cachedData = cache[cacheKey];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY_MS) {
      return cachedData.data as PaginatedInventory;
    }

    const response = await api.get<PaginatedInventory>('/api/inventory', {
      params: { page, pageSize, formChoiseSortOrder: formChoiseSortOrder }
    });

    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };

    return response.data;
  },
  getInventoryStats: async (): Promise<InventoryStatsType> => {
    const cachedData = cache['stats'];
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY_MS) {
      return cachedData.data as InventoryStatsType;
    }

    const response = await api.get<InventoryStatsType>('/api/inventory/stats');
    
    cache['stats'] = {
      data: response.data,
      timestamp: Date.now()
    };

    return response.data;
  },
  uploadCSV: async (file: File): Promise<CSVUploadResponse> => {
    try {
      const fileHash = await calculateFileHash(file);
      const cachedUpload = cache[fileHash];

      if (cachedUpload && Date.now() - cachedUpload.timestamp < CACHE_EXPIRY_MS) {
        return cachedUpload.data as CSVUploadResponse;
      }

      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<CSVUploadResponse>('/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      cache[fileHash] = {
        data: response.data,
        timestamp: Date.now()
      };

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
};


export default apiService; 