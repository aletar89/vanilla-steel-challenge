import axios from 'axios';
import { environment } from '@environments';
import { DataItem, PreferenceFormData, PreferenceResponse } from '../types/data.types';

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

  submitForm: async (formData: PreferenceFormData): Promise<PreferenceResponse> => {
    const response = await api.post<PreferenceResponse>('/api/preferences', formData);
    return response.data;
  },
};

export default apiService; 