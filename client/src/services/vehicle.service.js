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
    const { page = 1, limit = 10, vehicleType, search, type } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(vehicleType && { vehicleType }),
      ...(type && { vehicleType: type }),
      ...(search && { search })
    });
    
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VEHICLES.BASE}?${queryParams}`);
    return response.data.data;
  },
  
  /**
   * Alias de getAllVehicles
   */
  async getAll(params = {}) {
    return this.getAllVehicles(params);
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
  
  async create(vehicleData) {
    return this.createVehicle(vehicleData);
  },
  
  /**
   * Modifier un vehicule
   */
  async updateVehicle(id, vehicleData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id), vehicleData);
    return response.data.data;
  },
  
  async update(id, vehicleData) {
    return this.updateVehicle(id, vehicleData);
  },
  
  /**
   * Supprimer un vehicule
   */
  async deleteVehicle(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data;
  },
  
  async delete(id) {
    return this.deleteVehicle(id);
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
