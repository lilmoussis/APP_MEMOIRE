/**
 * Service de gestion des vehicules
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const vehicleService = {
  /**
   * Recuperer tous les vehicules avec pagination
   */
  async getAllVehicles(params = {}) {
    const { page = 1, limit = 10, vehicleType, search } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(vehicleType && { vehicleType }),
      ...(search && { search })
    });
    
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VEHICLES.BASE}?${queryParams}`);
    return response.data.data;
  },
  
  /**
   * Recuperer un vehicule par ID
   */
  async getVehicleById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data.data;
  },
  
  /**
   * Creer un nouveau vehicule
   */
  async createVehicle(vehicleData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VEHICLES.CREATE, vehicleData);
    return response.data.data;
  },
  
  /**
   * Modifier un vehicule
   */
  async updateVehicle(id, vehicleData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id), vehicleData);
    return response.data.data;
  },
  
  /**
   * Supprimer un vehicule
   */
  async deleteVehicle(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data;
  },
  
  /**
   * Rechercher un vehicule par plaque
   */
  async searchVehicle(query) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.VEHICLES.SEARCH(query));
    return response.data.data;
  }
};

export default vehicleService;
