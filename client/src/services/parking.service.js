/**
 * Service de gestion des parkings
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const parkingService = {
  /**
   * Recuperer tous les parkings
   */
  async getAllParkings() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.BASE);
    return response.data.data;
  },
  
  /**
   * Alias de getAllParkings
   */
  async getAll() {
    return this.getAllParkings();
  },
  
  /**
   * Recuperer un parking par ID
   */
  async getParkingById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id));
    return response.data.data;
  },
  
  /**
   * Creer un nouveau parking (Super Admin)
   */
  async createParking(parkingData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PARKING.BASE, parkingData);
    return response.data.data;
  },
  
  async create(parkingData) {
    return this.createParking(parkingData);
  },
  
  /**
   * Modifier un parking (Super Admin)
   */
  async updateParking(id, parkingData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id), parkingData);
    return response.data.data;
  },
  
  async update(id, parkingData) {
    return this.updateParking(id, parkingData);
  },
  
  /**
   * Supprimer un parking (Super Admin)
   */
  async deleteParking(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PARKING.BY_ID(id));
    return response.data;
  },
  
  async delete(id) {
    return this.deleteParking(id);
  },
  
  /**
   * Consulter la disponibilite d'un parking
   */
  async getParkingAvailability(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.AVAILABILITY(id));
    return response.data.data;
  },
  
  /**
   * Recuperer les tarifs d'un parking
   */
  async getTariffs(parkingId) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.PARKING.TARIFFS(parkingId));
    return response.data.data;
  },
  
  /**
   * Creer un tarif (Super Admin)
   */
  async createTariff(tariffData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BASE, tariffData);
    return response.data.data;
  },
  
  /**
   * Modifier un tarif (Super Admin)
   */
  async updateTariff(id, tariffData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BY_ID(id), tariffData);
    return response.data.data;
  },
  
  /**
   * Supprimer un tarif (Super Admin)
   */
  async deleteTariff(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.PARKING.TARIFF_BY_ID(id));
    return response.data;
  }
};

export default parkingService;
