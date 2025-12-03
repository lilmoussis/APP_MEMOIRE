import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, LogIn, LogOut, Filter, Calendar } from 'lucide-react'; // Icônes pour l'UI
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast
import { format } from 'date-fns'; // Utilitaire de formatage de dates

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';

// Services API pour les données
import entryService from '../../services/entry.service';
import vehicleService from '../../services/vehicle.service';
import parkingService from '../../services/parking.service';

/**
 * Page de gestion des entrées/sorties (Admin)
 * Permet de voir l'historique et d'enregistrer manuellement des entrées/sorties
 */
export default function Entries() {
  // États pour les données
  const [entries, setEntries] = useState([]); // Liste des entrées/sorties
  const [vehicles, setVehicles] = useState([]); // Liste des véhicules (pour nouvelle entrée)
  const [parkings, setParkings] = useState([]); // Liste des parkings (pour nouvelle entrée)
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour les modales
  const [showEntryModal, setShowEntryModal] = useState(false); // Modal nouvelle entrée
  const [showExitModal, setShowExitModal] = useState(false); // Modal enregistrer sortie
  const [selectedEntry, setSelectedEntry] = useState(null); // Entrée sélectionnée pour sortie
  const [isSubmitting, setIsSubmitting] = useState(false); // État pendant les soumissions

  // État de pagination
  const [pagination, setPagination] = useState({
    page: 1,      // Page actuelle
    limit: 15,    // Nombre d'éléments par page
    total: 0,     // Total d'éléments
    totalPages: 0 // Total de pages
  });

  // État des filtres de recherche
  const [filters, setFilters] = useState({
    search: '',      // Recherche par plaque véhicule
    status: '',      // Filtre par statut: 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    startDate: '',   // Date de début pour le filtre
    endDate: ''      // Date de fin pour le filtre
  });

  // État du formulaire pour nouvelle entrée
  const [entryFormData, setEntryFormData] = useState({
    parkingId: '',  // ID du parking
    vehicleId: '',  // ID du véhicule
    cardId: ''      // Numéro de carte RFID (optionnel)
  });

  // État du formulaire pour enregistrer une sortie
  const [exitFormData, setExitFormData] = useState({
    paymentMethod: 'ESPECES' // Mode de paiement par défaut
  });

  /**
   * useEffect pour charger les données au montage et quand les dépendances changent
   * Charge les entrées, véhicules et parkings quand la page ou les filtres changent
   */
  useEffect(() => {
    loadEntries();    // Charge l'historique des entrées
    loadVehicles();   // Charge la liste des véhicules
    loadParkings();   // Charge la liste des parkings
  }, [pagination.page, filters]); // Dépendances: page et filtres

  /**
   * Charge l'historique des entrées/sorties depuis l'API
   * Applique les filtres et la pagination
   */
  const loadEntries = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Préparation des paramètres de requête
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };
      
      // Appel API pour récupérer les entrées
      const data = await entryService.getAll(params);
      
      // Mise à jour des états avec les données reçues
      setEntries(data.entries);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement des entrées');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Charge la liste des véhicules pour le formulaire de nouvelle entrée
   * Limité à 1000 véhicules (pour les sélecteurs)
   */
  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll({ limit: 1000 });
      setVehicles(data.vehicles || []); // Vide tableau si undefined
    } catch (err) {
      console.error('Erreur chargement véhicules:', err); // Log erreur seulement
    }
  };

  /**
   * Charge la liste des parkings pour le formulaire de nouvelle entrée
   * Affiche le nombre de places disponibles
   */
  const loadParkings = async () => {
    try {
      const data = await parkingService.getAll();
      setParkings(data || []); // Vide tableau si undefined
    } catch (err) {
      console.error('Erreur chargement parkings:', err); // Log erreur seulement
    }
  };

  /**
   * Crée une nouvelle entrée manuelle
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleCreateEntry = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de soumission

    try {
      // Appel API pour créer l'entrée
      await entryService.create(entryFormData);
      toast.success('Entrée enregistrée avec succès');
      
      // Réinitialisation et fermeture
      setShowEntryModal(false);
      setEntryFormData({ parkingId: '', vehicleId: '', cardId: '' });
      loadEntries(); // Recharge la liste des entrées
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false); // Désactive l'état de soumission
    }
  };

  /**
   * Enregistre une sortie pour une entrée en cours
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleRecordExit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return; // Sécurité si pas d'entrée sélectionnée

    setIsSubmitting(true);
    try {
      // Appel API pour enregistrer la sortie
      await entryService.recordExit(selectedEntry.id, exitFormData);
      toast.success('Sortie enregistrée avec succès');
      
      // Réinitialisation et fermeture
      setShowExitModal(false);
      setSelectedEntry(null);
      setExitFormData({ paymentMethod: 'ESPECES' });
      loadEntries(); // Recharge la liste des entrées
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sortie');
    } finally {
      setIsSubmitting(false);
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
   * Retourne un badge stylisé selon le statut de l'entrée
   * @param {string} status - Statut de l'entrée
   * @returns {JSX.Element} Composant Badge avec couleur appropriée
   */
  const getStatusBadge = (status) => {
    const variants = {
      IN_PROGRESS: { variant: 'primary', text: 'En cours' },
      COMPLETED: { variant: 'success', text: 'Terminé' },
      CANCELLED: { variant: 'danger', text: 'Annulé' }
    };
    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
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
      key: 'parking',
      label: 'Parking',
      render: (value) => value.name // Nom du parking
    },
    {
      key: 'entryTime',
      label: 'Heure d\'entrée',
      render: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm') // Format français
    },
    {
      key: 'exitTime',
      label: 'Heure de sortie',
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-' // Tirets si pas de sortie
    },
    {
      key: 'duration',
      label: 'Durée',
      render: (value) => formatDuration(value)
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (value) => value ? `${value.toFixed(0)} FCFA` : '-' // Format devise ou tirets
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => getStatusBadge(value) // Badge coloré selon statut
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * Affiche seulement "Sortie" pour les entrées en cours
   * @param {Object} entry - L'entrée courante
   * @returns {JSX.Element} Boutons d'action
   */
  const renderActions = (entry) => (
    <>
      {/* Bouton "Sortie" seulement pour les entrées en cours */}
      {entry.status === 'IN_PROGRESS' && (
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => {
            setSelectedEntry(entry);
            setShowExitModal(true);
          }}
          title="Enregistrer la sortie"
        >
          <LogOut size={16} className="me-1" />
          Sortie
        </button>
      )}
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && entries.length === 0) {
    return <ErrorMessage message={error} onRetry={loadEntries} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête de la page avec bouton nouvelle entrée */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des entrées/sorties</h2>
          <p className="text-muted mb-0">Historique et enregistrement manuel</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowEntryModal(true)}
        >
          <Plus size={18} className="me-2" />
          Nouvelle entrée
        </button>
      </div>

      {/* Carte de filtres avec recherche, statut et dates */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            {/* Filtre par statut */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 })); // Retour page 1
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminés</option>
                <option value="CANCELLED">Annulés</option>
              </select>
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
            emptyMessage="Aucune entrée enregistrée"
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

      {/* Modal pour nouvelle entrée manuelle */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setEntryFormData({ parkingId: '', vehicleId: '', cardId: '' }); // Réinitialise le formulaire
        }}
        title="Nouvelle entrée"
        size="md"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowEntryModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              form="entry-form" // Associe au formulaire avec l'id "entry-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {/* Formulaire nouvelle entrée */}
        <form id="entry-form" onSubmit={handleCreateEntry}>
          {/* Sélecteur de parking */}
          <div className="mb-3">
            <label className="form-label">Parking *</label>
            <select
              className="form-select"
              value={entryFormData.parkingId}
              onChange={(e) => setEntryFormData({ ...entryFormData, parkingId: e.target.value })}
              required
            >
              <option value="">Sélectionner un parking</option>
              {parkings.map((parking) => (
                <option key={parking.id} value={parking.id}>
                  {parking.name} ({parking.availableSpaces} places disponibles)
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur de véhicule */}
          <div className="mb-3">
            <label className="form-label">Véhicule *</label>
            <select
              className="form-select"
              value={entryFormData.vehicleId}
              onChange={(e) => setEntryFormData({ ...entryFormData, vehicleId: e.target.value })}
              required
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} - {vehicle.vehicleType}
                </option>
              ))}
            </select>
          </div>

          {/* Champ carte RFID (optionnel) */}
          <div className="mb-3">
            <label className="form-label">Numéro de carte (optionnel)</label>
            <input
              type="text"
              className="form-control"
              value={entryFormData.cardId}
              onChange={(e) => setEntryFormData({ ...entryFormData, cardId: e.target.value })}
              placeholder="Ex: A1B2C3D4"
            />
          </div>
        </form>
      </Modal>

      {/* Modal pour enregistrer une sortie */}
      <Modal
        isOpen={showExitModal}
        onClose={() => {
          setShowExitModal(false);
          setSelectedEntry(null);
          setExitFormData({ paymentMethod: 'ESPECES' }); // Réinitialise le formulaire
        }}
        title="Enregistrer la sortie"
        size="md"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowExitModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              form="exit-form" // Associe au formulaire avec l'id "exit-form"
              className="btn btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la sortie'}
            </button>
          </>
        }
      >
        {/* Affiche les infos de l'entrée sélectionnée */}
        {selectedEntry && (
          <>
            <div className="alert alert-info">
              <strong>Véhicule:</strong> {selectedEntry.vehicle.plateNumber}<br/>
              <strong>Entrée:</strong> {format(new Date(selectedEntry.entryTime), 'dd/MM/yyyy HH:mm')}
            </div>

            {/* Formulaire sortie */}
            <form id="exit-form" onSubmit={handleRecordExit}>
              <div className="mb-3">
                <label className="form-label">Mode de paiement *</label>
                <select
                  className="form-select"
                  value={exitFormData.paymentMethod}
                  onChange={(e) => setExitFormData({ ...exitFormData, paymentMethod: e.target.value })}
                  required
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE_BANCAIRE">Carte bancaire</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
}