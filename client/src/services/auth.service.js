/**
 * Service d'authentification
 * Gere toutes les operations liees a l'authentification
 */

import apiClient, { tokenManager } from './api.client';
import { API_CONFIG } from '../config/api.config';

const authService = {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Sauvegarder les tokens
      tokenManager.setTokens(accessToken, refreshToken);
      
      // Sauvegarder les infos utilisateur
      localStorage.setItem('smartpark_user', JSON.stringify(user));
      
      return { user, success: true };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Inscription (Super Admin uniquement)
   */
  async register(userData) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Deconnexion
   */
  async logout() {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Erreur lors de la deconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      tokenManager.clearTokens();
      localStorage.removeItem('smartpark_user');
    }
  },
  
  /**
   * Recuperer le profil de l'utilisateur connecte
   */
  async getProfile() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      const user = response.data.data;
      
      // Mettre a jour le stockage local
      localStorage.setItem('smartpark_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Rafraichir le token d'acces
   */
  async refreshToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );
      
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      tokenManager.setTokens(accessToken, newRefreshToken);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Verifier si l'utilisateur est connecte
   */
  isAuthenticated() {
    return tokenManager.hasToken();
  },
  
  /**
   * Recuperer l'utilisateur courant depuis le localStorage
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('smartpark_user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  /**
   * Verifier si l'utilisateur a un role specifique
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  },
  
  /**
   * Verifier si l'utilisateur est Super Admin
   */
  isSuperAdmin() {
    return this.hasRole('SUPER_ADMIN');
  },
  
  /**
   * Verifier si l'utilisateur est Gerant
   */
  isGerant() {
    return this.hasRole('GERANT');
  }
};

export default authService;
