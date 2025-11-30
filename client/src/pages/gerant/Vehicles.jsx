/**
 * Page de gestion des vehicules (Gerant)
 */

import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import vehicleService from '../../services/vehicle.service';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadVehicles();
  }, [currentPage, searchTerm, typeFilter]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleService.getAll({
        page: currentPage,
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      setVehicles(data.vehicles || data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadVehicles} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Vehicules enregistres</h2>
          <p className="text-muted mb-0">Consultation des vehicules</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher..." />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Tous</option>
                <option value="MOTO">Moto</option>
                <option value="VOITURE">Voiture</option>
                <option value="CAMION">Camion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {vehicles.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <Car size={48} className="text-muted mb-3" />
                <p className="text-muted mb-0">Aucun vehicule</p>
              </div>
            </div>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <div className="stat-icon bg-primary me-3"><Car size={24} /></div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{vehicle.plateNumber}</h5>
                      <span className="badge bg-secondary">{vehicle.type}</span>
                    </div>
                  </div>
                  <div className="mb-2"><small className="text-muted">Proprietaire:</small><div className="fw-medium">{vehicle.ownerName || 'N/A'}</div></div>
                  <div className="mb-2"><small className="text-muted">Contact:</small><div>{vehicle.ownerPhone || 'N/A'}</div></div>
                  <div className="mb-2"><small className="text-muted">Carte:</small><div>{vehicle.card ? <span className="badge bg-success">{vehicle.card.cardId}</span> : 'Aucune'}</div></div>
                  <div><small className="text-muted">Statut:</small><div><span className={`badge bg-${vehicle.isActive ? 'success' : 'danger'}`}>{vehicle.isActive ? 'Actif' : 'Inactif'}</span></div></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
      )}
    </div>
  );
}
