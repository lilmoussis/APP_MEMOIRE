import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import parkingService from '../../services/parking.service';

/**
 * Page de gestion des parkings (Admin)
 */
export default function Parkings() {
  const [parkings, setParkings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    totalCapacity: '',
    location: '',
    description: ''
  });

  const [tariffData, setTariffData] = useState({
    vehicleType: 'VOITURE',
    pricePerHour: ''
  });

  useEffect(() => {
    loadParkings();
  }, []);

  const loadParkings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await parkingService.getAll();
      setParkings(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des parkings');
      toast.error('Erreur lors du chargement des parkings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (parking = null) => {
    if (parking) {
      setSelectedParking(parking);
      setFormData({
        name: parking.name,
        totalCapacity: parking.totalCapacity,
        location: parking.location || '',
        description: parking.description || ''
      });
    } else {
      setSelectedParking(null);
      setFormData({
        name: '',
        totalCapacity: '',
        location: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedParking(null);
    setFormData({
      name: '',
      totalCapacity: '',
      location: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedParking) {
        await parkingService.update(selectedParking.id, formData);
        toast.success('Parking modifie avec succes');
      } else {
        await parkingService.create(formData);
        toast.success('Parking cree avec succes');
      }
      handleCloseModal();
      loadParkings();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedParking) return;

    setIsSubmitting(true);
    try {
      await parkingService.delete(selectedParking.id);
      toast.success('Parking supprime avec succes');
      setShowDeleteDialog(false);
      setSelectedParking(null);
      loadParkings();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTariffModal = (parking) => {
    setSelectedParking(parking);
    setTariffData({
      vehicleType: 'VOITURE',
      pricePerHour: ''
    });
    setShowTariffModal(true);
  };

  const handleCloseTariffModal = () => {
    setShowTariffModal(false);
    setSelectedParking(null);
    setTariffData({
      vehicleType: 'VOITURE',
      pricePerHour: ''
    });
  };

  const handleTariffSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParking) return;

    setIsSubmitting(true);
    try {
      await parkingService.createTariff(selectedParking.id, tariffData);
      toast.success('Tarif ajoute avec succes');
      handleCloseTariffModal();
      loadParkings();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout du tarif');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true
    },
    {
      key: 'totalCapacity',
      label: 'Capacite totale',
      sortable: true,
      render: (value) => `${value} places`
    },
    {
      key: 'availableSpaces',
      label: 'Places disponibles',
      sortable: true,
      render: (value, row) => (
        <div className="d-flex align-items-center">
          <span className={value === 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            {value} places
          </span>
          <div className="progress ms-2" style={{ width: '100px', height: '8px' }}>
            <div 
              className={`progress-bar ${value === 0 ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${(value / row.totalCapacity) * 100}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Localisation',
      render: (value) => value || '-'
    },
    {
      key: 'tariffs',
      label: 'Tarifs',
      render: (value) => value ? `${value.length} tarif(s)` : '0 tarif'
    }
  ];

  const renderActions = (parking) => (
    <>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => handleOpenTariffModal(parking)}
        title="Gerer les tarifs"
      >
        <DollarSign size={16} />
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(parking)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedParking(parking);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  if (error) {
    return <ErrorMessage message={error} onRetry={loadParkings} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des parkings</h2>
          <p className="text-muted mb-0">Configuration et surveillance des parkings</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter un parking
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={parkings}
            isLoading={isLoading}
            emptyMessage="Aucun parking enregistre"
            actions={renderActions}
          />
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedParking ? 'Modifier le parking' : 'Ajouter un parking'}
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
              form="parking-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form id="parking-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nom du parking *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Capacite totale (nombre de places) *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={formData.totalCapacity}
              onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Localisation</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </form>
      </Modal>

      {/* Modal Tarifs */}
      <Modal
        isOpen={showTariffModal}
        onClose={handleCloseTariffModal}
        title={`Tarifs - ${selectedParking?.name}`}
        size="lg"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCloseTariffModal}
              disabled={isSubmitting}
            >
              Fermer
            </button>
            <button 
              type="submit" 
              form="tariff-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter le tarif'}
            </button>
          </>
        }
      >
        <form id="tariff-form" onSubmit={handleTariffSubmit}>
          <div className="mb-3">
            <label className="form-label">Type de vehicule *</label>
            <select
              className="form-select"
              value={tariffData.vehicleType}
              onChange={(e) => setTariffData({ ...tariffData, vehicleType: e.target.value })}
              required
            >
              <option value="MOTO">Moto</option>
              <option value="VOITURE">Voiture</option>
              <option value="CAMION">Camion</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Prix par heure (FCFA) *</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              value={tariffData.pricePerHour}
              onChange={(e) => setTariffData({ ...tariffData, pricePerHour: parseFloat(e.target.value) })}
              required
            />
          </div>
        </form>

        {selectedParking?.tariffs && selectedParking.tariffs.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Tarifs actuels</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Type de vehicule</th>
                    <th>Prix/heure</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedParking.tariffs.map((tariff) => (
                    <tr key={tariff.id}>
                      <td>{tariff.vehicleType}</td>
                      <td>{tariff.pricePerHour} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Dialog Suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedParking(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer le parking"
        message={`Etes-vous sur de vouloir supprimer le parking "${selectedParking?.name}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
