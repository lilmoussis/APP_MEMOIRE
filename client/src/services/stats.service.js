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
   * Alias de getDashboardStats
   */
  async getDashboard(parkingId) {
    return this.getDashboardStats(parkingId);
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
   * Alias de getRevenueStats - params peut etre startDate, endDate ou period
   */
  async getRevenue(startDateOrPeriod, endDate) {
    if (typeof startDateOrPeriod === 'string' && !endDate) {
      return this.getRevenueStats({ period: startDateOrPeriod });
    }
    return this.getRevenueStats({ startDate: startDateOrPeriod, endDate });
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
   * Alias de getOccupancyStats
   */
  async getOccupancy(startDateOrPeriod, endDate) {
    if (typeof startDateOrPeriod === 'string' && !endDate) {
      return this.getOccupancyStats({ period: startDateOrPeriod });
    }
    return this.getOccupancyStats({ startDate: startDateOrPeriod, endDate });
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
   * Alias de getTrafficStats
   */
  async getTraffic(period) {
    return this.getTrafficStats({ period });
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
