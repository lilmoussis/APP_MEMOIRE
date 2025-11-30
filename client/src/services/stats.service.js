/**
 * Service de statistiques
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const statsService = {
  /**
   * Recuperer les statistiques du dashboard
   */
  async getDashboardStats(parkingId) {
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.DASHBOARD}${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Recuperer les statistiques de revenus
   */
  async getRevenueStats(params = {}) {
    const { period, parkingId, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      ...(period && { period }),
      ...(parkingId && { parkingId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.REVENUE}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Recuperer les statistiques d'occupation
   */
  async getOccupancyStats(params = {}) {
    const { period, parkingId } = params;
    
    const queryParams = new URLSearchParams({
      ...(period && { period }),
      ...(parkingId && { parkingId })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.OCCUPANCY}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Recuperer les statistiques de trafic
   */
  async getTrafficStats(params = {}) {
    const { period, parkingId } = params;
    
    const queryParams = new URLSearchParams({
      ...(period && { period }),
      ...(parkingId && { parkingId })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.TRAFFIC}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Recuperer la repartition des vehicules par type
   */
  async getVehiclesByType(parkingId) {
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.VEHICLES_BY_TYPE}${queryParams}`
    );
    return response.data.data;
  }
};

export default statsService;
