/**
 * Page de facturation (Gérant)
 * Interface simplifiée pour la gestion des factures côté gérant
 */

import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { FileText, Download } from 'lucide-react'; // Icônes pour l'interface
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast
import { format } from 'date-fns'; // Utilitaire de formatage de dates
import { fr } from 'date-fns/locale'; // Localisation française pour les dates

// Composants UI réutilisables
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

// Service API pour la facturation
import billingService from '../../services/billing.service';

export default function Billing() {
  // États pour les données
  const [invoices, setInvoices] = useState([]); // Liste des factures
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour la pagination et les filtres
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle (commence à 1)
  const [totalPages, setTotalPages] = useState(1); // Nombre total de pages
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche textuelle
  const [dateFilter, setDateFilter] = useState('today'); // Filtre de période par défaut: aujourd'hui

  /**
   * useEffect pour charger les factures quand les dépendances changent
   * Se déclenche au montage et quand la page, la recherche ou la période changent
   */
  useEffect(() => {
    loadInvoices(); // Charge les factures
  }, [currentPage, searchTerm, dateFilter]); // Dépendances: page, recherche, période

  /**
   * Charge les factures depuis l'API
   * Applique les filtres et la pagination
   */
  const loadInvoices = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      
      // Paramètres de requête pour l'API
      const params = {
        page: currentPage, // Page actuelle
        search: searchTerm, // Terme de recherche
        period: dateFilter // Période sélectionnée
      };
      
      // Appel API pour récupérer les factures
      const data = await billingService.getInvoices(params);
      
      // Gestion des différentes structures de réponse d'API
      setInvoices(data.billings || data.invoices || data.data || []); // Données factures
      setTotalPages(data.pagination?.totalPages || 1); // Pages totales (défaut: 1)
    } catch (err) {
      // Gestion des erreurs
      setError(err.message); // Stocke le message d'erreur
      toast.error('Erreur de chargement'); // Notification utilisateur
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Télécharge une facture au format PDF
   * @param {string} invoiceId - ID de la facture à télécharger
   */
  const handleDownloadPDF = async (invoiceId) => {
    try {
      // Appel API pour télécharger le PDF
      await billingService.downloadPDF(invoiceId);
      toast.success('Téléchargement...'); // Confirmation utilisateur
    } catch (err) {
      toast.error('Erreur téléchargement'); // Notification d'erreur
    }
  };

  // Affichage du composant de chargement pendant le chargement
  if (isLoading) return <Loading />;
  
  // Affichage d'erreur si le chargement a échoué
  if (error) return <ErrorMessage message={error} onRetry={loadInvoices} />;

  return (
    <div>
      {/* En-tête de la page */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Facturation</h2>
          <p className="text-muted mb-0">Gestion des factures</p>
        </div>
      </div>

      {/* Carte de filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-8">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Rechercher..." 
              />
            </div>
            {/* Filtre de période */}
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale avec le tableau des factures */}
      <div className="card">
        {/* Tableau responsive pour petits écrans */}
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Véhicule</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Message si aucune facture */}
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Aucune facture
                  </td>
                </tr>
              ) : (
                /* Boucle sur chaque facture */
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    {/* Numéro de facture */}
                    <td className="font-monospace">
                      {inv.invoiceNumber || `INV-${inv.id}`}
                    </td>
                    
                    {/* Informations véhicule */}
                    <td>
                      <div className="fw-medium">
                        {inv.entry?.vehicle?.plateNumber || 'N/A'}
                      </div>
                      <small className="text-muted">
                        {inv.entry?.vehicle?.type}
                      </small>
                    </td>
                    
                    {/* Date de création formatée */}
                    <td>
                      <small>
                        {inv.createdAt ? 
                          format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }) 
                          : '-'}
                      </small>
                    </td>
                    
                    {/* Durée de stationnement */}
                    <td>
                      {inv.entry?.duration ? 
                        `${inv.entry.duration.toFixed(2)}h` : '-'}
                    </td>
                    
                    {/* Montant avec couleur verte */}
                    <td className="fw-medium text-success">
                      {inv.amount ? 
                        `${inv.amount.toFixed(0)} FCFA` : '-'}
                    </td>
                    
                    {/* Statut de paiement avec badge coloré */}
                    <td>
                      <span className={`badge bg-${inv.isPaid ? 'success' : 'warning'}`}>
                        {inv.isPaid ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    
                    {/* Bouton de téléchargement PDF */}
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => handleDownloadPDF(inv.id)}
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination en pied de carte si plus d'une page */}
        {totalPages > 1 && (
          <div className="card-footer">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="row g-3 mt-4">
        {/* Carte: Total aujourd'hui */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total aujourd'hui</h6>
              <h3 className="mb-0">
                {invoices
                  .filter(i => 
                    format(new Date(i.createdAt), 'yyyy-MM-dd') === 
                    format(new Date(), 'yyyy-MM-dd')
                  )
                  .reduce((sum, i) => sum + (i.amount || 0), 0)
                  .toFixed(0)} FCFA
              </h3>
            </div>
          </div>
        </div>
        
        {/* Carte: Nombre total de factures */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">Factures</h6>
              <h3 className="mb-0">{invoices.length}</h3>
            </div>
          </div>
        </div>
        
        {/* Carte: Factures en attente de paiement */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted mb-2">En attente</h6>
              <h3 className="mb-0">
                {invoices.filter(i => !i.isPaid).length}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}