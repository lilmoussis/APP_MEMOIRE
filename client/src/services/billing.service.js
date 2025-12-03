/**
 * Service de facturation
 * Gère toutes les opérations liées à la facturation et aux rapports financiers
 */

import apiClient from './api.client'; // Client HTTP configuré
import { API_CONFIG } from '../config/api.config'; // Configuration des endpoints API

const billingService = {
  /**
   * Récupérer l'historique de facturation avec filtres
   * @param {Object} params - Paramètres de filtrage et pagination
   * @param {number} params.page - Numéro de page (défaut: 1)
   * @param {number} params.limit - Nombre d'éléments par page (défaut: 10)
   * @param {string} params.startDate - Date de début (format YYYY-MM-DD)
   * @param {string} params.endDate - Date de fin (format YYYY-MM-DD)
   * @param {string} params.parkingId - ID du parking pour filtrer
   * @param {number} params.minAmount - Montant minimum
   * @param {number} params.maxAmount - Montant maximum
   * @param {string} params.search - Recherche textuelle (plaque, nom, etc.)
   * @param {string} params.period - Période prédéfinie ('today', 'week', 'month')
   * @returns {Promise<Object>} Données de facturation paginées
   */
  async getBillingHistory(params = {}) {
    // Destructuration avec valeurs par défaut
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      parkingId, 
      minAmount, 
      maxAmount,
      search,
      period
    } = params;
    
    // Construction des paramètres de requête URL
    const queryParams = new URLSearchParams({
      page: page.toString(), // Convertit en chaîne pour URLSearchParams
      limit: limit.toString(),
      ...(startDate && { startDate }), // Ajoute seulement si défini
      ...(endDate && { endDate }),
      ...(parkingId && { parkingId }),
      ...(minAmount && { minAmount: minAmount.toString() }),
      ...(maxAmount && { maxAmount: maxAmount.toString() }),
      ...(search && { search }),
      ...(period && { period })
    });
    
    // Appel API GET vers l'endpoint d'historique de facturation
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.BILLING.HISTORY}?${queryParams}`
    );
    return response.data.data; // Retourne les données extraites
  },
  
  /**
   * Alias de getBillingHistory pour compatibilité
   * @param {Object} params - Mêmes paramètres que getBillingHistory
   * @returns {Promise<Object>} Données de facturation
   */
  async getInvoices(params = {}) {
    return this.getBillingHistory(params); // Délègue à getBillingHistory
  },
  
  /**
   * Générer une facture pour une entrée (si non générée automatiquement)
   * @param {string} entryId - ID de l'entrée à facturer
   * @returns {Promise<Object>} Données de la facture générée
   */
  async generateInvoice(entryId) {
    // Note: La facture est normalement générée automatiquement à la sortie
    // Cette méthode sert pour régénérer ou forcer la génération
    return this.getBillingByEntry(entryId); // Récupère la facture existante
  },
  
  /**
   * Récupérer une facture par ID d'entrée
   * @param {string} entryId - ID de l'entrée associée
   * @returns {Promise<Object>} Données de la facture
   */
  async getBillingByEntry(entryId) {
    // Appel API GET vers l'endpoint spécifique à une entrée
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BILLING.BY_ENTRY(entryId));
    return response.data.data; // Retourne les données de la facture
  },
  
  /**
   * Télécharger une facture au format PDF
   * @param {string} entryId - ID de l'entrée/facture
   * @returns {Promise<Object>} Statut du téléchargement
   */
  async downloadPDF(entryId) {
    // Appel API GET avec responseType 'blob' pour les fichiers binaires
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.BILLING.PDF(entryId),
      {
        responseType: 'blob' // Indique qu'on attend un fichier binaire (PDF)
      }
    );
    
    // Crée un URL temporaire pour le blob PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a'); // Crée un élément lien invisible
    link.href = url;
    link.setAttribute('download', `facture-${entryId}.pdf`); // Nom du fichier
    document.body.appendChild(link); // Ajoute au DOM
    link.click(); // Simule un clic pour déclencher le téléchargement
    link.remove(); // Nettoie l'élément
    window.URL.revokeObjectURL(url); // Libère la mémoire
    
    return { success: true }; // Confirmation de succès
  },
  
  /**
   * Exporter un rapport Excel des facturations
   * @param {Object} params - Paramètres de l'export
   * @param {string} params.startDate - Date de début obligatoire
   * @param {string} params.endDate - Date de fin obligatoire
   * @param {string} params.parkingId - ID du parking (optionnel)
   * @param {string} params.status - Statut des factures (optionnel)
   * @returns {Promise<Object>} Statut de l'export
   */
  async exportExcel(params = {}) {
    const { startDate, endDate, parkingId, status } = params;
    
    // Validation des paramètres obligatoires
    if (!startDate || !endDate) {
      throw new Error('Les dates de début et de fin sont requises');
    }
    
    // Construction des paramètres de requête
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      ...(parkingId && { parkingId }),
      ...(status && { status })
    });
    
    // Appel API GET pour exporter en Excel
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.BILLING.EXPORT_EXCEL}?${queryParams}`,
      {
        responseType: 'blob' // Fichier Excel binaire
      }
    );
    
    // Téléchargement du fichier Excel
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Nom du fichier avec dates pour identification
    link.setAttribute('download', `rapport-${startDate}-${endDate}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true }; // Confirmation de succès
  }
};

// Exporte le service de facturation comme export par défaut
export default billingService;