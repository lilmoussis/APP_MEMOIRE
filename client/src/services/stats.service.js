/**
 * Service de statistiques
 * Fournit des méthodes pour récupérer différentes statistiques depuis l'API
 */

// Importation du client API pour effectuer les requêtes HTTP
import apiClient from './api.client';
// Importation de la configuration des endpoints API
import { API_CONFIG } from '../config/api.config';

// Définition de l'objet principal du service de statistiques
const statsService = {
  /**
   * Récupérer les statistiques du dashboard
   * @param {string|null} parkingId - ID du parking spécifique (optionnel)
   * @returns {Promise<object>} - Statistiques du dashboard
   */
  async getDashboardStats(parkingId) {
    // Construire les paramètres de requête si parkingId est fourni
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    
    // Effectuer la requête GET vers l'endpoint des statistiques dashboard
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.DASHBOARD}${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse (structure data.data)
    return response.data.data;
  },
  
  /**
   * Alias de getDashboardStats pour une utilisation plus concise
   * @param {string|null} parkingId - ID du parking spécifique (optionnel)
   * @returns {Promise<object>} - Statistiques du dashboard
   */
  async getDashboard(parkingId) {
    // Appelle simplement getDashboardStats avec les mêmes paramètres
    return this.getDashboardStats(parkingId);
  },
  
  /**
   * Récupérer les statistiques de revenus avec des paramètres flexibles
   * @param {Object} params - Paramètres de filtrage
   * @param {string} [params.period] - Période prédéfinie (jour, semaine, mois, etc.)
   * @param {string} [params.parkingId] - ID du parking spécifique
   * @param {string} [params.startDate] - Date de début personnalisée
   * @param {string} [params.endDate] - Date de fin personnalisée
   * @returns {Promise<object>} - Statistiques de revenus
   */
  async getRevenueStats(params = {}) {
    // Destructuration des paramètres pour un accès plus facile
    const { period, parkingId, startDate, endDate } = params;
    
    // Création des paramètres de requête URL en incluant uniquement ceux définis
    const queryParams = new URLSearchParams({
      ...(period && { period }),           // Ajouter period si défini
      ...(parkingId && { parkingId }),     // Ajouter parkingId si défini
      ...(startDate && { startDate }),     // Ajouter startDate si défini
      ...(endDate && { endDate })          // Ajouter endDate si défini
    });
    
    // Effectuer la requête GET vers l'endpoint des statistiques de revenus
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.REVENUE}?${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Alias de getRevenueStats avec une signature simplifiée
   * Accepte soit une période, soit une date de début + date de fin
   * @param {string} startDateOrPeriod - Date de début OU période prédéfinie
   * @param {string} [endDate] - Date de fin (optionnel si période fournie)
   * @returns {Promise<object>} - Statistiques de revenus
   */
  async getRevenue(startDateOrPeriod, endDate) {
    // Logique pour déterminer si le premier paramètre est une période ou une date
    if (typeof startDateOrPeriod === 'string' && !endDate) {
      // Si endDate n'est pas fourni, startDateOrPeriod est considéré comme une période
      return this.getRevenueStats({ period: startDateOrPeriod });
    }
    
    // Sinon, startDateOrPeriod est considéré comme startDate et endDate comme endDate
    return this.getRevenueStats({ 
      startDate: startDateOrPeriod, 
      endDate 
    });
  },
  
  /**
   * Récupérer les statistiques d'occupation (taux d'occupation du parking)
   * @param {Object} params - Paramètres de filtrage
   * @param {string} [params.period] - Période prédéfinie
   * @param {string} [params.parkingId] - ID du parking spécifique
   * @returns {Promise<object>} - Statistiques d'occupation
   */
  async getOccupancyStats(params = {}) {
    // Destructuration des paramètres
    const { period, parkingId } = params;
    
    // Création des paramètres de requête URL
    const queryParams = new URLSearchParams({
      ...(period && { period }),           // Ajouter period si défini
      ...(parkingId && { parkingId })      // Ajouter parkingId si défini
    });
    
    // Effectuer la requête GET vers l'endpoint des statistiques d'occupation
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.OCCUPANCY}?${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Alias de getOccupancyStats avec une signature simplifiée
   * @param {string} startDateOrPeriod - Date de début OU période prédéfinie
   * @param {string} [endDate] - Date de fin (optionnel si période fournie)
   * @returns {Promise<object>} - Statistiques d'occupation
   */
  async getOccupancy(startDateOrPeriod, endDate) {
    // Même logique que pour getRevenue
    if (typeof startDateOrPeriod === 'string' && !endDate) {
      return this.getOccupancyStats({ period: startDateOrPeriod });
    }
    return this.getOccupancyStats({ 
      startDate: startDateOrPeriod, 
      endDate 
    });
  },
  
  /**
   * Récupérer les statistiques de trafic (entrées/sorties de véhicules)
   * @param {Object} params - Paramètres de filtrage
   * @param {string} [params.period] - Période prédéfinie
   * @param {string} [params.parkingId] - ID du parking spécifique
   * @returns {Promise<object>} - Statistiques de trafic
   */
  async getTrafficStats(params = {}) {
    // Destructuration des paramètres
    const { period, parkingId } = params;
    
    // Création des paramètres de requête URL
    const queryParams = new URLSearchParams({
      ...(period && { period }),           // Ajouter period si défini
      ...(parkingId && { parkingId })      // Ajouter parkingId si défini
    });
    
    // Effectuer la requête GET vers l'endpoint des statistiques de trafic
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.TRAFFIC}?${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  },
  
  /**
   * Alias de getTrafficStats avec une signature simplifiée
   * @param {string} period - Période prédéfinie (jour, semaine, mois, etc.)
   * @returns {Promise<object>} - Statistiques de trafic
   */
  async getTraffic(period) {
    // Appelle getTrafficStats avec le paramètre period
    return this.getTrafficStats({ period });
  },
  
  /**
   * Récupérer la répartition des véhicules par type (voiture, moto, utilitaire, etc.)
   * @param {string|null} parkingId - ID du parking spécifique (optionnel)
   * @returns {Promise<object>} - Répartition par type de véhicule
   */
  async getVehiclesByType(parkingId) {
    // Construire les paramètres de requête si parkingId est fourni
    const queryParams = parkingId ? `?parkingId=${parkingId}` : '';
    
    // Effectuer la requête GET vers l'endpoint de répartition par type
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.STATS.VEHICLES_BY_TYPE}${queryParams}`
    );
    
    // Retourner les données contenues dans la réponse
    return response.data.data;
  }
};

// Export par défaut de l'objet service
export default statsService;