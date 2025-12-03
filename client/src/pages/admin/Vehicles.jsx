import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, Edit2, Trash2, Filter } from 'lucide-react'; // Icônes pour actions
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';

// Service API pour les véhicules
import vehicleService from '../../services/vehicle.service';

/**
 * Page de gestion des véhicules (Admin)
 * Permet de créer, lire, modifier, supprimer des véhicules
 * Avec recherche et filtrage par type de véhicule
 */
export default function Vehicles() {
  // États pour les données
  const [vehicles, setVehicles] = useState([]); // Liste des véhicules
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour les modales et dialogues
  const [showModal, setShowModal] = useState(false); // Modal d'édition/ajout
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Dialogue suppression
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Véhicule sélectionné
  const [isSubmitting, setIsSubmitting] = useState(false); // État pendant les soumissions

  // État de pagination
  const [pagination, setPagination] = useState({
    page: 1,      // Page actuelle
    limit: 10,    // Nombre d'éléments par page
    total: 0,     // Total d'éléments
    totalPages: 0 // Total de pages
  });

  // État des filtres de recherche
  const [filters, setFilters] = useState({
    search: '',        // Recherche par plaque d'immatriculation
    vehicleType: ''    // Filtre par type de véhicule
  });

  // État du formulaire pour l'ajout/modification
  const [formData, setFormData] = useState({
    plateNumber: '',    // Plaque d'immatriculation (obligatoire, unique)
    vehicleType: 'VOITURE', // Type par défaut: Voiture
    brand: '',          // Marque (optionnel)
    model: '',          // Modèle (optionnel)
    color: ''           // Couleur (optionnel)
  });

  /**
   * useEffect pour charger les véhicules au montage et quand les dépendances changent
   */
  useEffect(() => {
    loadVehicles(); // Charge la liste des véhicules
  }, [pagination.page, filters]); // Dépendances: page et filtres

  /**
   * Charge la liste des véhicules depuis l'API
   * Applique les filtres et la pagination
   */
  const loadVehicles = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Préparation des paramètres de requête
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        vehicleType: filters.vehicleType || undefined
      };
      
      // Appel API pour récupérer les véhicules
      const data = await vehicleService.getAll(params);
      
      // Mise à jour des états avec les données reçues
      setVehicles(data.vehicles);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement des véhicules');
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Ouvre la modal d'ajout/modification d'un véhicule
   * @param {Object|null} vehicle - Véhicule à modifier (null pour ajout)
   */
  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      // Mode modification: pré-remplit le formulaire
      setSelectedVehicle(vehicle);
      setFormData({
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        color: vehicle.color || ''
      });
    } else {
      // Mode ajout: réinitialise le formulaire
      setSelectedVehicle(null);
      setFormData({
        plateNumber: '',
        vehicleType: 'VOITURE',
        brand: '',
        model: '',
        color: ''
      });
    }
    setShowModal(true); // Ouvre la modal
  };

  /**
   * Ferme la modal et réinitialise les données associées
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    setFormData({
      plateNumber: '',
      vehicleType: 'VOITURE',
      brand: '',
      model: '',
      color: ''
    });
  };

  /**
   * Soumet le formulaire d'ajout/modification d'un véhicule
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de soumission

    try {
      if (selectedVehicle) {
        // Mode modification: mise à jour du véhicule existant
        await vehicleService.update(selectedVehicle.id, formData);
        toast.success('Véhicule modifié avec succès');
      } else {
        // Mode ajout: création d'un nouveau véhicule
        await vehicleService.create(formData);
        toast.success('Véhicule enregistré avec succès');
      }
      handleCloseModal(); // Ferme la modal
      loadVehicles(); // Recharge la liste des véhicules
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false); // Désactive l'état de soumission
    }
  };

  /**
   * Supprime un véhicule après confirmation
   */
  const handleDelete = async () => {
    if (!selectedVehicle) return; // Sécurité si pas de véhicule sélectionné

    setIsSubmitting(true);
    try {
      await vehicleService.delete(selectedVehicle.id);
      toast.success('Véhicule supprimé avec succès');
      setShowDeleteDialog(false); // Ferme le dialogue
      setSelectedVehicle(null); // Réinitialise la sélection
      loadVehicles(); // Recharge la liste
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
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
   * Retourne un badge stylisé selon le type de véhicule
   * @param {string} type - Type de véhicule
   * @returns {JSX.Element} Composant Badge avec couleur appropriée
   */
  const getVehicleTypeBadge = (type) => {
    const variants = {
      MOTO: 'info',     // Bleu clair
      VOITURE: 'primary', // Bleu primaire
      CAMION: 'warning',  // Orange
      AUTRE: 'secondary'  // Gris
    };
    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

  /**
   * Configuration des colonnes pour le DataTable
   */
  const columns = [
    {
      key: 'plateNumber',
      label: 'Plaque d\'immatriculation',
      sortable: true, // Permet le tri sur cette colonne
      render: (value) => <span className="fw-bold text-primary">{value}</span>
    },
    {
      key: 'vehicleType',
      label: 'Type',
      sortable: true,
      render: (value) => getVehicleTypeBadge(value)
    },
    {
      key: 'brand',
      label: 'Marque',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'model',
      label: 'Modèle',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'color',
      label: 'Couleur',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'cards',
      label: 'Cartes',
      render: (value) => (
        // Badge indiquant le nombre de cartes associées
        <Badge variant={value && value.length > 0 ? 'success' : 'secondary'} size="sm">
          {value ? value.length : 0} carte(s)
        </Badge>
      )
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * @param {Object} vehicle - Le véhicule courant
   * @returns {JSX.Element} Boutons d'action (modifier, supprimer)
   */
  const renderActions = (vehicle) => (
    <>
      {/* Bouton modification */}
      <button
        className="btn btn-sm btn-outline-primary me-1"
        onClick={() => handleOpenModal(vehicle)}
        title="Modifier"
      >
        <Edit2 size={14} />
      </button>
      {/* Bouton suppression */}
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedVehicle(vehicle);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && vehicles.length === 0) {
    return <ErrorMessage message={error} onRetry={loadVehicles} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête compacte avec bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h4 mb-1">Gestion des véhicules</h2>
          <p className="text-muted mb-0 small">Liste et gestion des véhicules enregistrés</p>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} className="me-1" />
          Ajouter
        </button>
      </div>

      {/* Carte de filtres compacte */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row g-2">
            {/* Barre de recherche */}
            <div className="col-md-8">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            {/* Filtre par type de véhicule */}
            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={filters.vehicleType}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, vehicleType: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 })); // Retour page 1
                }}
              >
                <option value="">Tous les types</option>
                <option value="MOTO">Moto</option>
                <option value="VOITURE">Voiture</option>
                <option value="CAMION">Camion</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale avec le tableau de données */}
      <div className="card">
        <div className="card-body p-3">
          {/* Tableau de données des véhicules */}
          <DataTable
            columns={columns}
            data={vehicles}
            isLoading={isLoading}
            emptyMessage="Aucun véhicule enregistré"
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

      {/* Modal pour ajouter/modifier un véhicule */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
        size="lg"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              form="vehicle-form" // Associe au formulaire avec l'id "vehicle-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {/* Formulaire d'ajout/modification */}
        <form id="vehicle-form" onSubmit={handleSubmit}>
          {/* Champ plaque d'immatriculation */}
          <div className="mb-3">
            <label className="form-label">Plaque d'immatriculation *</label>
            <input
              type="text"
              className="form-control text-uppercase"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
              required
              disabled={!!selectedVehicle} // Non modifiable en édition
            />
            {selectedVehicle && (
              <small className="form-text text-muted">
                La plaque d'immatriculation ne peut pas être modifiée
              </small>
            )}
          </div>

          {/* Sélecteur type de véhicule */}
          <div className="mb-3">
            <label className="form-label">Type de véhicule *</label>
            <select
              className="form-select"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              required
            >
              <option value="MOTO">Moto</option>
              <option value="VOITURE">Voiture</option>
              <option value="CAMION">Camion</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Ligne marque et modèle */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Marque</label>
              <input
                type="text"
                className="form-control"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: Toyota"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Modèle</label>
              <input
                type="text"
                className="form-control"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ex: Corolla"
              />
            </div>
          </div>

          {/* Champ couleur */}
          <div className="mb-3">
            <label className="form-label">Couleur</label>
            <input
              type="text"
              className="form-control"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ex: Blanc"
            />
          </div>
        </form>
      </Modal>

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedVehicle(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer le véhicule"
        message={`Êtes-vous sûr de vouloir supprimer le véhicule "${selectedVehicle?.plateNumber}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}