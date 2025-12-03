import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'; // Icônes pour actions
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';

// Services API pour les données
import cardService from '../../services/card.service';
import vehicleService from '../../services/vehicle.service';

/**
 * Page de gestion des cartes RFID (Admin)
 * Permet de créer, lire, modifier, supprimer et activer/désactiver des cartes RFID
 */
export default function Cards() {
  // États pour les données
  const [cards, setCards] = useState([]); // Liste des cartes RFID
  const [vehicles, setVehicles] = useState([]); // Liste des véhicules pour l'association
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour les modales et dialogues
  const [showModal, setShowModal] = useState(false); // Contrôle modal d'édition/ajout
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Contrôle dialogue de suppression
  const [selectedCard, setSelectedCard] = useState(null); // Carte sélectionnée pour édition/suppression
  const [isSubmitting, setIsSubmitting] = useState(false); // État pendant les soumissions

  // État de pagination pour gérer la navigation entre pages
  const [pagination, setPagination] = useState({
    page: 1,      // Page actuelle
    limit: 10,    // Nombre d'éléments par page
    total: 0,     // Total d'éléments
    totalPages: 0 // Total de pages
  });

  // État des filtres de recherche
  const [filters, setFilters] = useState({
    search: '',  // Recherche textuelle (numéro de carte)
    status: ''   // Filtre par statut: 'active', 'inactive' ou vide pour tous
  });

  // État du formulaire pour l'ajout/modification
  const [formData, setFormData] = useState({
    cardNumber: '',  // Numéro unique de la carte RFID
    vehicleId: '',   // ID du véhicule associé
    isActive: true   // Statut d'activation
  });

  /**
   * useEffect pour charger les données au montage et quand les dépendances changent
   * Charge les cartes et véhicules quand la page ou les filtres changent
   */
  useEffect(() => {
    loadCards();    // Charge la liste des cartes
    loadVehicles(); // Charge la liste des véhicules (pour l'association)
  }, [pagination.page, filters]); // Dépendances: page et filtres

  /**
   * Charge la liste des cartes RFID depuis l'API
   * Applique les filtres et la pagination
   */
  const loadCards = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Préparation des paramètres de requête
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined, // Transforme chaîne vide en undefined
        // Convertit le statut texte en booléen pour l'API
        isActive: filters.status === 'active' ? true : 
                 filters.status === 'inactive' ? false : undefined
      };
      
      // Appel API pour récupérer les cartes
      const data = await cardService.getAll(params);
      
      // Mise à jour des états avec les données reçues
      setCards(data.cards);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement des cartes');
      toast.error('Erreur lors du chargement des cartes');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Charge la liste des véhicules pour l'association aux cartes
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
   * Ouvre la modal d'ajout/modification
   * @param {Object|null} card - Carte à modifier (null pour ajout)
   */
  const handleOpenModal = (card = null) => {
    if (card) {
      // Mode modification: pré-remplit le formulaire
      setSelectedCard(card);
      setFormData({
        cardNumber: card.cardNumber,
        vehicleId: card.vehicleId,
        isActive: card.isActive
      });
    } else {
      // Mode ajout: réinitialise le formulaire
      setSelectedCard(null);
      setFormData({
        cardNumber: '',
        vehicleId: '',
        isActive: true
      });
    }
    setShowModal(true); // Ouvre la modal
  };

  /**
   * Ferme la modal et réinitialise les données associées
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
    setFormData({
      cardNumber: '',
      vehicleId: '',
      isActive: true
    });
  };

  /**
   * Soumet le formulaire d'ajout/modification
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de soumission

    try {
      if (selectedCard) {
        // Mode modification: mise à jour de la carte existante
        await cardService.update(selectedCard.id, formData);
        toast.success('Carte modifiée avec succès');
      } else {
        // Mode ajout: création d'une nouvelle carte
        await cardService.create(formData);
        toast.success('Carte enregistrée avec succès');
      }
      handleCloseModal(); // Ferme la modal
      loadCards(); // Recharge la liste des cartes
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false); // Désactive l'état de soumission
    }
  };

  /**
   * Supprime une carte après confirmation
   */
  const handleDelete = async () => {
    if (!selectedCard) return; // Sécurité si pas de carte sélectionnée

    setIsSubmitting(true);
    try {
      await cardService.delete(selectedCard.id);
      toast.success('Carte supprimée avec succès');
      setShowDeleteDialog(false); // Ferme le dialogue
      setSelectedCard(null); // Réinitialise la sélection
      loadCards(); // Recharge la liste
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Active ou désactive une carte (toggle)
   * @param {Object} card - Carte à modifier
   */
  const handleToggleStatus = async (card) => {
    try {
      await cardService.toggleStatus(card.id);
      toast.success(`Carte ${card.isActive ? 'désactivée' : 'activée'} avec succès`);
      loadCards(); // Recharge pour voir le changement
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
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
   * Configuration des colonnes pour le DataTable
   */
  const columns = [
    {
      key: 'cardNumber',
      label: 'Numéro de carte',
      sortable: true, // Permet le tri sur cette colonne
      render: (value) => <span className="fw-bold font-monospace">{value}</span> // Police monospace pour les codes
    },
    {
      key: 'vehicle',
      label: 'Véhicule associé',
      render: (value) => value ? ( // Affiche les infos véhicule si associé
        <div>
          <div className="fw-bold text-primary">{value.plateNumber}</div>
          <small className="text-muted">{value.vehicleType} - {value.brand || 'N/A'}</small>
        </div>
      ) : '-' // Tirets si pas de véhicule associé
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'} // Badge coloré selon le statut
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      render: (value) => new Date(value).toLocaleDateString('fr-FR') // Format français
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * @param {Object} card - La carte courante
   * @returns {JSX.Element} Boutons d'action (toggle, modifier, supprimer)
   */
  const renderActions = (card) => (
    <>
      {/* Bouton toggle activation/désactivation */}
      <button
        className={`btn btn-sm ${card.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => handleToggleStatus(card)}
        title={card.isActive ? 'Désactiver' : 'Activer'}
      >
        {card.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      </button>
      {/* Bouton modification */}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(card)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
      {/* Bouton suppression */}
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedCard(card);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && cards.length === 0) {
    return <ErrorMessage message={error} onRetry={loadCards} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête de la page avec titre et bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des cartes RFID</h2>
          <p className="text-muted mb-0">Association des cartes aux véhicules</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter une carte
        </button>
      </div>

      {/* Carte de filtres avec barre de recherche et sélecteur de statut */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-8">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par numéro de carte..."
              />
            </div>
            {/* Filtre par statut */}
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 })); // Retour page 1
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
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
            data={cards}
            isLoading={isLoading}
            emptyMessage="Aucune carte enregistrée"
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

      {/* Modal pour ajouter/modifier une carte */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedCard ? 'Modifier la carte' : 'Ajouter une carte'}
        size="md"
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
              form="card-form" // Associe au formulaire avec l'id "card-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {/* Formulaire d'ajout/modification */}
        <form id="card-form" onSubmit={handleSubmit}>
          {/* Champ numéro de carte */}
          <div className="mb-3">
            <label className="form-label">Numéro de carte *</label>
            <input
              type="text"
              className="form-control font-monospace"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.toUpperCase() })}
              required
              disabled={!!selectedCard} // Numéro non modifiable en édition
              placeholder="Ex: A1B2C3D4"
            />
            {selectedCard && (
              <small className="form-text text-muted">
                Le numéro de carte ne peut pas être modifié
              </small>
            )}
          </div>

          {/* Sélecteur de véhicule */}
          <div className="mb-3">
            <label className="form-label">Véhicule associé *</label>
            <select
              className="form-select"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} - {vehicle.vehicleType} ({vehicle.brand || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Switch activation/désactivation */}
          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="isActive">
                Carte active
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedCard(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer la carte"
        message={`Êtes-vous sûr de vouloir supprimer la carte "${selectedCard?.cardNumber}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}