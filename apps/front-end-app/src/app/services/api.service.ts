import axios from 'axios';
import { environment } from '../../environments/environment';
import { DataItem } from '../types/data.types';

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getData: async (): Promise<DataItem[]> => {
    const response = await api.get<DataItem[]>('/api/data');
    return response.data;
  },

  submitForm: async (formData: any) => {
    const response = await api.post('/api/preferences', formData);
    return response.data;
  },
};

export default apiService; 