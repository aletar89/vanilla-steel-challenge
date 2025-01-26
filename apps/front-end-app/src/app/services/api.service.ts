import axios from 'axios';
import { environment } from '../../environments/environment';

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Example methods - add more as needed
  getData: async () => {
    const response = await api.get('/api/data');
    return response.data;
  },

  submitForm: async (formData: any) => {
    const response = await api.post('/api/preferences', formData);
    return response.data;
  },
};

export default apiService; 