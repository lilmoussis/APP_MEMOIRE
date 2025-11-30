/**
 * Service de gestion des utilisateurs (Super Admin uniquement)
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const userService = {
  /**
   * Recuperer tous les utilisateurs avec pagination
   */
  async getAllUsers(params = {}) {
    const { page = 1, limit = 10, role, isActive } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive: isActive.toString() })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.USERS.BASE}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Alias de getAllUsers
   */
  async getAll(params = {}) {
    return this.getAllUsers(params);
  },
  
  /**
   * Recuperer un utilisateur par ID
   */
  async getUserById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
    return response.data.data;
  },
  
  /**
   * Creer un nouvel utilisateur
   */
  async createUser(userData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.USERS.BASE, userData);
    return response.data.data;
  },
  
  async create(userData) {
    return this.createUser(userData);
  },
  
  /**
   * Modifier un utilisateur
   */
  async updateUser(id, userData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.USERS.BY_ID(id), userData);
    return response.data.data;
  },
  
  async update(id, userData) {
    return this.updateUser(id, userData);
  },
  
  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },
  
  async delete(id) {
    return this.deleteUser(id);
  },
  
  /**
   * Activer/Desactiver un utilisateur
   */
  async toggleUserStatus(id) {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.USERS.TOGGLE_STATUS(id));
    return response.data.data;
  }
};

export default userService;
