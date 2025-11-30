import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';
import vehicleService from '../../services/vehicle.service';

/**
 * Page de gestion des vehicules (Admin)
 */
export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    vehicleType: ''
  });

  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'VOITURE',
    brand: '',
    model: '',
    color: ''
  });

  useEffect(() => {
    loadVehicles();
  }, [pagination.page, filters]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        vehicleType: filters.vehicleType || undefined
      };
      
      const data = await vehicleService.getAll(params);
      setVehicles(data.vehicles);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des vehicules');
      toast.error('Erreur lors du chargement des vehicules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData({
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        color: vehicle.color || ''
      });
    } else {
      setSelectedVehicle(null);
      setFormData({
        plateNumber: '',
        vehicleType: 'VOITURE',
        brand: '',
        model: '',
        color: ''
      });
    }
    setShowModal(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedVehicle) {
        await vehicleService.update(selectedVehicle.id, formData);
        toast.success('Vehicule modifie avec succes');
      } else {
        await vehicleService.create(formData);
        toast.success('Vehicule enregistre avec succes');
      }
      handleCloseModal();
      loadVehicles();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;

    setIsSubmitting(true);
    try {
      await vehicleService.delete(selectedVehicle.id);
      toast.success('Vehicule supprime avec succes');
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      loadVehicles();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getVehicleTypeBadge = (type) => {
    const variants = {
      MOTO: 'info',
      VOITURE: 'primary',
      CAMION: 'warning',
      AUTRE: 'secondary'
    };
    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const columns = [
    {
      key: 'plateNumber',
      label: 'Plaque d\'immatriculation',
      sortable: true,
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
      render: (value) => value || '-'
    },
    {
      key: 'model',
      label: 'Modele',
      render: (value) => value || '-'
    },
    {
      key: 'color',
      label: 'Couleur',
      render: (value) => value || '-'
    },
    {
      key: 'cards',
      label: 'Cartes',
      render: (value) => (
        <Badge variant={value && value.length > 0 ? 'success' : 'secondary'} size="sm">
          {value ? value.length : 0} carte(s)
        </Badge>
      )
    }
  ];

  const renderActions = (vehicle) => (
    <>
      <button
        className="btn btn-sm btn-outline-primary me-1"
        onClick={() => handleOpenModal(vehicle)}
        title="Modifier"
      >
        <Edit2 size={14} />
      </button>
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

  if (error && vehicles.length === 0) {
    return <ErrorMessage message={error} onRetry={loadVehicles} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h4 mb-1">Gestion des vehicules</h2>
          <p className="text-muted mb-0 small">Liste et gestion des vehicules enregistres</p>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} className="me-1" />
          Ajouter
        </button>
      </div>

      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-8">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={filters.vehicleType}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, vehicleType: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
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

      <div className="card">
        <div className="card-body p-3">
          <DataTable
            columns={columns}
            data={vehicles}
            isLoading={isLoading}
            emptyMessage="Aucun vehicule enregistre"
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
        title={selectedVehicle ? 'Modifier le vehicule' : 'Ajouter un vehicule'}
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
              form="vehicle-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Plaque d'immatriculation *</label>
            <input
              type="text"
              className="form-control text-uppercase"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
              required
              disabled={!!selectedVehicle}
            />
            {selectedVehicle && (
              <small className="form-text text-muted">
                La plaque d'immatriculation ne peut pas etre modifiee
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Type de vehicule *</label>
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
              <label className="form-label">Modele</label>
              <input
                type="text"
                className="form-control"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Ex: Corolla"
              />
            </div>
          </div>

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

      {/* Dialog Suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedVehicle(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer le vehicule"
        message={`Etes-vous sur de vouloir supprimer le vehicule "${selectedVehicle?.plateNumber}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
