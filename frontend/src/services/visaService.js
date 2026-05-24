import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const visaService = {
  // Get all visa guides
  getAll: async () => {
    try {
      const response = await apiClient.get('/visa');
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - GetAll');
      throw error;
    }
  },

  // Get visa guide by country
  getByCountry: async (country) => {
    try {
      const response = await apiClient.get(`/visa/${country}`);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - GetByCountry');
      throw error;
    }
  },

  // Calculate financial requirements
  calculateFinancial: async (data) => {
    try {
      const response = await apiClient.post('/visa/calculate-financial', data);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - CalculateFinancial');
      throw error;
    }
  },

  // Get visa checklist
  getChecklist: async (data) => {
    try {
      const response = await apiClient.post('/visa/checklist', data);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - GetChecklist');
      throw error;
    }
  },

  // Admin: Create visa guide
  create: async (data) => {
    try {
      const response = await apiClient.post('/visa', data);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - Create');
      throw error;
    }
  },

  // Admin: Update visa guide
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/visa/${id}`, data);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - Update');
      throw error;
    }
  },

  // Admin: Delete visa guide
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/visa/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'VisaService - Delete');
      throw error;
    }
  },
};

export default visaService;