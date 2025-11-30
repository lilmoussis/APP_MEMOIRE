/**
 * Page de gestion des entrees/sorties (Gerant)
 */

import { useState, useEffect } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import entryService from '../../services/entry.service';
import vehicleService from '../../services/vehicle.service';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ vehicleId: '', cardId: '' });

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entriesData, vehiclesData] = await Promise.all([
        entryService.getAll({ page: currentPage, search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined }),
        vehicleService.getAll({ limit: 1000 })
      ]);
      setEntries(entriesData.entries || entriesData.data || []);
      setTotalPages(entriesData.pagination?.totalPages || 1);
      setVehicles(vehiclesData.vehicles || vehiclesData.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      await entryService.recordEntry(formData);
      toast.success('Entree enregistree');
      setShowModal(false);
      setFormData({ vehicleId: '', cardId: '' });
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExitSubmit = async (entryId) => {
    try {
      await entryService.recordExit(entryId);
      toast.success('Sortie enregistree');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des entrees/sorties</h2>
          <p className="text-muted mb-0">Enregistrement et suivi quotidien</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} className="me-2" />
          Nouvelle entree
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher..." />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tous</option>
                <option value="active">En cours</option>
                <option value="completed">Termines</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Vehicule</th>
                <th>Type</th>
                <th>Entree</th>
                <th>Sortie</th>
                <th>Duree</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4">Aucune entree</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="fw-medium">{entry.vehicle?.plateNumber || 'N/A'}</td>
                    <td><span className="badge bg-secondary">{entry.vehicle?.type}</span></td>
                    <td><small>{entry.entryTime ? format(new Date(entry.entryTime), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</small></td>
                    <td><small>{entry.exitTime ? format(new Date(entry.exitTime), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</small></td>
                    <td>{entry.duration ? `${entry.duration.toFixed(2)}h` : 'En cours'}</td>
                    <td className="fw-medium">{entry.amount ? `${entry.amount.toFixed(0)} FCFA` : '-'}</td>
                    <td><span className={`badge bg-${entry.status === 'active' ? 'success' : 'secondary'}`}>{entry.status === 'active' ? 'En cours' : 'Termine'}</span></td>
                    <td>
                      {entry.status === 'active' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleExitSubmit(entry.id)}>
                          <ArrowDownCircle size={16} /> Sortie
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div className="card-footer"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle entree">
        <form onSubmit={handleEntrySubmit}>
          <div className="mb-3">
            <label className="form-label">Vehicule *</label>
            <select className="form-select" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} required>
              <option value="">Selectionner</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} - {v.type}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Carte RFID</label>
            <input type="text" className="form-control" value={formData.cardId} onChange={(e) => setFormData({ ...formData, cardId: e.target.value })} />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary"><ArrowUpCircle size={20} className="me-2" />Enregistrer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
