/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'authentification des utilisateurs
 */

import apiClient, { tokenManager } from './api.client'; // Client HTTP et gestionnaire de tokens
import { API_CONFIG } from '../config/api.config'; // Configuration des endpoints API

const authService = {
  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - Identifiants de connexion
   * @param {string} credentials.username - Nom d'utilisateur
   * @param {string} credentials.password - Mot de passe
   * @returns {Promise<Object>} Utilisateur connecté et statut de succès
   */
  async login(credentials) {
    try {
      // Envoie la requête POST vers l'endpoint de connexion
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN, // Chemin: '/auth/login'
        credentials // Données: { username, password }
      );
      
      // Extrait les données de la réponse
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Sauvegarde les tokens dans le localStorage via le gestionnaire
      tokenManager.setTokens(accessToken, refreshToken);
      
      // Sauvegarde les informations utilisateur dans le localStorage
      localStorage.setItem('smartpark_user', JSON.stringify(user));
      
      // Retourne l'utilisateur et le statut de succès
      return { user, success: true };
    } catch (error) {
      // Propage l'erreur pour la gérer dans le composant appelant
      throw error;
    }
  },
  
  /**
   * Inscription d'un nouvel utilisateur (réservé au Super Admin)
   * @param {Object} userData - Données du nouvel utilisateur
   * @returns {Promise<Object>} Réponse de l'API
   */
  async register(userData) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER, // Chemin: '/auth/register'
        userData // Données du nouvel utilisateur
      );
      
      return response.data; // Retourne la réponse complète
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Déconnexion de l'utilisateur
   * Nettoie les tokens et les données utilisateur
   */
  async logout() {
    try {
      // Notifie le serveur de la déconnexion (optionnel)
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT); // Chemin: '/auth/logout'
    } catch (error) {
      // Log l'erreur mais continue le nettoyage local
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage garanti même en cas d'erreur
      tokenManager.clearTokens(); // Supprime les tokens
      localStorage.removeItem('smartpark_user'); // Supprime les données utilisateur
    }
  },
  
  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise<Object>} Données de l'utilisateur
   */
  async getProfile() {
    try {
      // Récupère les infos de l'utilisateur depuis l'API
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.AUTH.ME // Chemin: '/auth/me'
      );
      
      const user = response.data.data; // Extrait les données utilisateur
      
      // Met à jour le localStorage avec les dernières informations
      localStorage.setItem('smartpark_user', JSON.stringify(user));
      
      return user; // Retourne l'utilisateur
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Rafraîchir le token d'accès expiré
   * @returns {Promise<Object>} Nouveaux tokens
   */
  async refreshToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken(); // Récupère le refresh token
      
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }
      
      // Demande de nouveaux tokens avec le refresh token
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH, // Chemin: '/auth/refresh'
        { refreshToken } // Corps de la requête
      );
      
      // Extrait les nouveaux tokens
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Sauvegarde les nouveaux tokens
      tokenManager.setTokens(accessToken, newRefreshToken);
      
      return { success: true }; // Confirmation de succès
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean} True si un token existe
   */
  isAuthenticated() {
    return tokenManager.hasToken(); // Vérifie la présence d'un token
  },
  
  /**
   * Récupérer l'utilisateur courant depuis le localStorage
   * @returns {Object|null} Données utilisateur ou null
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('smartpark_user'); // Récupère la chaîne JSON
    return userJson ? JSON.parse(userJson) : null; // Parse ou retourne null
  },
  
  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier ('SUPER_ADMIN', 'GERANT')
   * @returns {boolean} True si l'utilisateur a ce rôle
   */
  hasRole(role) {
    const user = this.getCurrentUser(); // Récupère l'utilisateur courant
    return user?.role === role; // Compare les rôles (optional chaining pour sécurité)
  },
  
  /**
   * Vérifier si l'utilisateur est Super Admin
   * @returns {boolean} True si rôle = 'SUPER_ADMIN'
   */
  isSuperAdmin() {
    return this.hasRole('SUPER_ADMIN'); // Utilise la méthode hasRole
  },
  
  /**
   * Vérifier si l'utilisateur est Gérant
   * @returns {boolean} True si rôle = 'GERANT'
   */
  isGerant() {
    return this.hasRole('GERANT'); // Utilise la méthode hasRole
  }
};

// Exporte le service d'authentification comme export par défaut
export default authService;