/**
 * Import des dépendances
 */
import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { FileText, Download, Filter } from 'lucide-react'; // Icônes pour l'UI
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast
import { format } from 'date-fns'; // Utilitaire de formatage de dates

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';

// Services API pour les données
import billingService from '../../services/billing.service';
import entryService from '../../services/entry.service';

/**
 * Page de facturation (Admin)
 * Affiche l'historique des factures avec filtres, export et pagination
 */
export default function Billing() {
  // États pour les données
  const [entries, setEntries] = useState([]); // Liste des entrées (historique)
  const [invoices, setInvoices] = useState([]); // Liste des factures (inutilisée actuellement)
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  const [isExporting, setIsExporting] = useState(false); // État d'export Excel

  // État de pagination pour gérer la navigation entre pages
  const [pagination, setPagination] = useState({
    page: 1,      // Page actuelle (commence à 1)
    limit: 15,    // Nombre d'éléments par page
    total: 0,     // Nombre total d'éléments
    totalPages: 0 // Nombre total de pages
  });

  // État des filtres de recherche
  const [filters, setFilters] = useState({
    search: '',      // Recherche textuelle (numéro de plaque)
    startDate: '',   // Date de début pour le filtre
    endDate: ''      // Date de fin pour le filtre
  });

  /**
   * useEffect pour charger les données au montage et quand les dépendances changent
   * Déclenche le chargement quand la page ou les filtres changent
   */
  useEffect(() => {
    loadBillings(); // Charge les données de facturation
  }, [pagination.page, filters]); // Dépendances: page actuelle et filtres

  /**
   * Charge les données de facturation depuis l'API
   * Applique les filtres et la pagination
   */
  const loadBillings = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Préparation des paramètres de requête
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined, // Transforme chaîne vide en undefined
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: 'COMPLETED' // Uniquement les entrées terminées (payées)
      };
      
      // Appel API pour récupérer les données
      const data = await entryService.getAll(params);
      
      // Mise à jour des états avec les données reçues
      setInvoices(data.entries); // Factures (inutilisé mais conservé)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement'); // Notification utilisateur
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Télécharge un PDF de facture pour une entrée spécifique
   * @param {string} entryId - ID de l'entrée à télécharger
   */
  const handleDownloadPDF = async (entryId) => {
    try {
      // Récupère le PDF depuis l'API
      const blob = await billingService.downloadPDF(entryId);
      
      // Crée un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Crée un lien de téléchargement invisible
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${entryId}.pdf`; // Nom du fichier
      document.body.appendChild(a);
      a.click(); // Déclenche le téléchargement
      
      // Nettoyage
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Facture téléchargée'); // Confirmation utilisateur
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  /**
   * Exporte toutes les factures en format Excel
   * Applique les filtres de date actuels
   */
  const handleExportExcel = async () => {
    setIsExporting(true); // Active l'état d'export
    try {
      // Appel API pour l'export Excel
      const blob = await billingService.exportExcel(filters.startDate, filters.endDate);
      
      // Téléchargement du fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factures-${Date.now()}.xlsx`; // Nom unique avec timestamp
      document.body.appendChild(a);
      a.click();
      
      // Nettoyage
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export Excel terminé');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false); // Désactive l'état d'export
    }
  };

  /**
   * Gère la recherche textuelle
   * Réinitialise à la première page pour consistance
   * @param {string} searchTerm - Terme de recherche
   */
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 })); // Retour à la page 1
  };

  /**
   * Change la page actuelle dans la pagination
   * @param {number} newPage - Nouveau numéro de page
   */
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  /**
   * Formate une durée en minutes en format lisible (heures et minutes)
   * @param {number} minutes - Durée en minutes
   * @returns {string} Durée formatée (ex: "2h 30m")
   */
  const formatDuration = (minutes) => {
    if (!minutes) return '-'; // Valeur par défaut si undefined/null
    const hours = Math.floor(minutes / 60); // Heures entières
    const mins = minutes % 60; // Minutes restantes
    return `${hours}h ${mins}m`;
  };

  /**
   * Configuration des colonnes pour le DataTable
   * Définit l'affichage et le formatage des données
   */
  const columns = [
    {
      key: 'vehicle',
      label: 'Véhicule',
      render: (value) => (
        <div>
          <div className="fw-bold text-primary">{value.plateNumber}</div>
          <small className="text-muted">{value.vehicleType}</small>
        </div>
      )
    },
    {
      key: 'entryTime',
      label: 'Date',
      render: (value) => format(new Date(value), 'dd/MM/yyyy') // Format français
    },
    {
      key: 'duration',
      label: 'Durée',
      render: (value) => formatDuration(value) // Utilise la fonction de formatage
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (value) => <span className="fw-bold text-success">{value.toFixed(0)} FCFA</span>
    },
    {
      key: 'paymentMethod',
      label: 'Paiement',
      render: (value) => value || '-' // Valeur ou tiret si vide
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * @param {Object} entry - L'entrée/facture courante
   * @returns {JSX.Element} Boutons d'action
   */
  const renderActions = (entry) => (
    <>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => handleDownloadPDF(entry.id)}
        title="Télécharger la facture"
      >
        <FileText size={16} /> {/* Icône PDF */}
      </button>
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && entries.length === 0) {
    return <ErrorMessage message={error} onRetry={loadBillings} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête de la page avec titre et bouton d'export */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Facturation</h2>
          <p className="text-muted mb-0">Historique et exports des factures</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleExportExcel}
          disabled={isExporting} // Désactive pendant l'export
        >
          <Download size={18} className="me-2" />
          {isExporting ? 'Export en cours...' : 'Exporter Excel'}
        </button>
      </div>

      {/* Carte de filtres avec barre de recherche et dates */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-6">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            {/* Filtre date de début */}
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Date début"
              />
            </div>
            {/* Filtre date de fin */}
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale avec le tableau de données */}
      <div className="card">
        <div className="card-body">
          {/* Tableau de données avec pagination */}
          <DataTable
            columns={columns}
            data={entries}
            isLoading={isLoading}
            emptyMessage="Aucune facture disponible"
            actions={renderActions}
          />
          
          {/* Pagination conditionnelle (seulement si plus d'une page) */}
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}