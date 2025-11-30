import { useState, useEffect } from 'react';
import { Plus, LogIn, LogOut, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';
import entryService from '../../services/entry.service';
import vehicleService from '../../services/vehicle.service';
import parkingService from '../../services/parking.service';

/**
 * Page de gestion des entrees/sorties (Admin)
 */
export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [entryFormData, setEntryFormData] = useState({
    parkingId: '',
    vehicleId: '',
    cardId: ''
  });

  const [exitFormData, setExitFormData] = useState({
    paymentMethod: 'ESPECES'
  });

  useEffect(() => {
    loadEntries();
    loadVehicles();
    loadParkings();
  }, [pagination.page, filters]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };
      
      const data = await entryService.getAll(params);
      setEntries(data.entries);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des entrees');
      toast.error('Erreur lors du chargement');
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

  const loadParkings = async () => {
    try {
      const data = await parkingService.getAll();
      setParkings(data || []);
    } catch (err) {
      console.error('Erreur chargement parkings:', err);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await entryService.create(entryFormData);
      toast.success('Entree enregistree avec succes');
      setShowEntryModal(false);
      setEntryFormData({ parkingId: '', vehicleId: '', cardId: '' });
      loadEntries();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la creation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordExit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setIsSubmitting(true);
    try {
      await entryService.recordExit(selectedEntry.id, exitFormData);
      toast.success('Sortie enregistree avec succes');
      setShowExitModal(false);
      setSelectedEntry(null);
      setExitFormData({ paymentMethod: 'ESPECES' });
      loadEntries();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sortie');
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

  const getStatusBadge = (status) => {
    const variants = {
      IN_PROGRESS: { variant: 'primary', text: 'En cours' },
      COMPLETED: { variant: 'success', text: 'Termine' },
      CANCELLED: { variant: 'danger', text: 'Annule' }
    };
    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const columns = [
    {
      key: 'vehicle',
      label: 'Vehicule',
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
      render: (value) => value.name
    },
    {
      key: 'entryTime',
      label: 'Heure d\'entree',
      render: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm')
    },
    {
      key: 'exitTime',
      label: 'Heure de sortie',
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    },
    {
      key: 'duration',
      label: 'Duree',
      render: (value) => formatDuration(value)
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (value) => value ? `${value.toFixed(0)} FCFA` : '-'
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => getStatusBadge(value)
    }
  ];

  const renderActions = (entry) => (
    <>
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

  if (error && entries.length === 0) {
    return <ErrorMessage message={error} onRetry={loadEntries} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des entrees/sorties</h2>
          <p className="text-muted mb-0">Historique et enregistrement manuel</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowEntryModal(true)}
        >
          <Plus size={18} className="me-2" />
          Nouvelle entree
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Termines</option>
                <option value="CANCELLED">Annules</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Date debut"
              />
            </div>
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

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={entries}
            isLoading={isLoading}
            emptyMessage="Aucune entree enregistree"
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

      {/* Modal Nouvelle Entree */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setEntryFormData({ parkingId: '', vehicleId: '', cardId: '' });
        }}
        title="Nouvelle entree"
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
              form="entry-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form id="entry-form" onSubmit={handleCreateEntry}>
          <div className="mb-3">
            <label className="form-label">Parking *</label>
            <select
              className="form-select"
              value={entryFormData.parkingId}
              onChange={(e) => setEntryFormData({ ...entryFormData, parkingId: e.target.value })}
              required
            >
              <option value="">Selectionner un parking</option>
              {parkings.map((parking) => (
                <option key={parking.id} value={parking.id}>
                  {parking.name} ({parking.availableSpaces} places disponibles)
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Vehicule *</label>
            <select
              className="form-select"
              value={entryFormData.vehicleId}
              onChange={(e) => setEntryFormData({ ...entryFormData, vehicleId: e.target.value })}
              required
            >
              <option value="">Selectionner un vehicule</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} - {vehicle.vehicleType}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Numero de carte (optionnel)</label>
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

      {/* Modal Sortie */}
      <Modal
        isOpen={showExitModal}
        onClose={() => {
          setShowExitModal(false);
          setSelectedEntry(null);
          setExitFormData({ paymentMethod: 'ESPECES' });
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
              form="exit-form"
              className="btn btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la sortie'}
            </button>
          </>
        }
      >
        {selectedEntry && (
          <>
            <div className="alert alert-info">
              <strong>Vehicule:</strong> {selectedEntry.vehicle.plateNumber}<br/>
              <strong>Entree:</strong> {format(new Date(selectedEntry.entryTime), 'dd/MM/yyyy HH:mm')}
            </div>

            <form id="exit-form" onSubmit={handleRecordExit}>
              <div className="mb-3">
                <label className="form-label">Mode de paiement *</label>
                <select
                  className="form-select"
                  value={exitFormData.paymentMethod}
                  onChange={(e) => setExitFormData({ ...exitFormData, paymentMethod: e.target.value })}
                  required
                >
                  <option value="ESPECES">Especes</option>
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
