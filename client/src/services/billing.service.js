/**
 * Service de facturation
 */

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

const billingService = {
  /**
   * Recuperer l'historique de facturation
   */
  async getBillingHistory(params = {}) {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      parkingId, 
      minAmount, 
      maxAmount 
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(parkingId && { parkingId }),
      ...(minAmount && { minAmount: minAmount.toString() }),
      ...(maxAmount && { maxAmount: maxAmount.toString() })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.BILLING.HISTORY}?${queryParams}`
    );
    return response.data.data;
  },
  
  /**
   * Recuperer une facture par ID d'entree
   */
  async getBillingByEntry(entryId) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BILLING.BY_ENTRY(entryId));
    return response.data.data;
  },
  
  /**
   * Telecharger une facture PDF
   */
  async downloadPDF(entryId) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.BILLING.PDF(entryId),
      {
        responseType: 'blob'
      }
    );
    
    // Creer un lien de telechargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${entryId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },
  
  /**
   * Exporter un rapport Excel
   */
  async exportExcel(params = {}) {
    const { startDate, endDate, parkingId, status } = params;
    
    if (!startDate || !endDate) {
      throw new Error('Les dates de debut et de fin sont requises');
    }
    
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      ...(parkingId && { parkingId }),
      ...(status && { status })
    });
    
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.BILLING.EXPORT_EXCEL}?${queryParams}`,
      {
        responseType: 'blob'
      }
    );
    
    // Creer un lien de telechargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-${startDate}-${endDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  }
};

export default billingService;
