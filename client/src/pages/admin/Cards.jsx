import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';
import cardService from '../../services/card.service';
import vehicleService from '../../services/vehicle.service';

/**
 * Page de gestion des cartes RFID (Admin)
 */
export default function Cards() {
  const [cards, setCards] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    cardNumber: '',
    vehicleId: '',
    isActive: true
  });

  useEffect(() => {
    loadCards();
    loadVehicles();
  }, [pagination.page, filters]);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        isActive: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined
      };
      
      const data = await cardService.getAll(params);
      setCards(data.cards);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des cartes');
      toast.error('Erreur lors du chargement des cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll({ limit: 1000 });
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error('Erreur chargement vehicules:', err);
    }
  };

  const handleOpenModal = (card = null) => {
    if (card) {
      setSelectedCard(card);
      setFormData({
        cardNumber: card.cardNumber,
        vehicleId: card.vehicleId,
        isActive: card.isActive
      });
    } else {
      setSelectedCard(null);
      setFormData({
        cardNumber: '',
        vehicleId: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
    setFormData({
      cardNumber: '',
      vehicleId: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedCard) {
        await cardService.update(selectedCard.id, formData);
        toast.success('Carte modifiee avec succes');
      } else {
        await cardService.create(formData);
        toast.success('Carte enregistree avec succes');
      }
      handleCloseModal();
      loadCards();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;

    setIsSubmitting(true);
    try {
      await cardService.delete(selectedCard.id);
      toast.success('Carte supprimee avec succes');
      setShowDeleteDialog(false);
      setSelectedCard(null);
      loadCards();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (card) => {
    try {
      await cardService.toggleStatus(card.id);
      toast.success(`Carte ${card.isActive ? 'desactivee' : 'activee'} avec succes`);
      loadCards();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise a jour');
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: 'cardNumber',
      label: 'Numero de carte',
      sortable: true,
      render: (value) => <span className="fw-bold font-monospace">{value}</span>
    },
    {
      key: 'vehicle',
      label: 'Vehicule associe',
      render: (value) => value ? (
        <div>
          <div className="fw-bold text-primary">{value.plateNumber}</div>
          <small className="text-muted">{value.vehicleType} - {value.brand || 'N/A'}</small>
        </div>
      ) : '-'
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Date de creation',
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    }
  ];

  const renderActions = (card) => (
    <>
      <button
        className={`btn btn-sm ${card.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => handleToggleStatus(card)}
        title={card.isActive ? 'Desactiver' : 'Activer'}
      >
        {card.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(card)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
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

  if (error && cards.length === 0) {
    return <ErrorMessage message={error} onRetry={loadCards} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des cartes RFID</h2>
          <p className="text-muted mb-0">Association des cartes aux vehicules</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter une carte
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par numero de carte..."
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
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

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={cards}
            isLoading={isLoading}
            emptyMessage="Aucune carte enregistree"
            actions={renderActions}
          />
          
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

      {/* Modal Ajout/Modification */}
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
              form="card-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form id="card-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Numero de carte *</label>
            <input
              type="text"
              className="form-control font-monospace"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.toUpperCase() })}
              required
              disabled={!!selectedCard}
              placeholder="Ex: A1B2C3D4"
            />
            {selectedCard && (
              <small className="form-text text-muted">
                Le numero de carte ne peut pas etre modifie
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Vehicule associe *</label>
            <select
              className="form-select"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
            >
              <option value="">Selectionner un vehicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} - {vehicle.vehicleType} ({vehicle.brand || 'N/A'})
                </option>
              ))}
            </select>
          </div>

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

      {/* Dialog Suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedCard(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer la carte"
        message={`Etes-vous sur de vouloir supprimer la carte "${selectedCard?.cardNumber}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
