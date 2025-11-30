/**
 * Dashboard Gerant
 */

import { useEffect, useState } from 'react';
import { Car, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import statsService from '../../services/stats.service';
import { useStatsStore } from '../../store';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import AnimatedCounter from '../../components/common/AnimatedCounter';

export default function GerantDashboard() {
  const { dashboardStats, setDashboardStats, isLoading, setLoading, error, setError } = useStatsStore();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadDashboardStats();
  }, []);
  
  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await statsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
    toast.success('Statistiques actualisees');
  };
  
  if (isLoading && !dashboardStats) {
    return <Loading text="Chargement des statistiques..." />;
  }
  
  if (error && !dashboardStats) {
    return <ErrorMessage message={error} onRetry={loadDashboardStats} />;
  }
  
  const overview = dashboardStats?.overview || {};
  const occupancy = dashboardStats?.occupancy || [];
  
  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Tableau de bord</h2>
          <p className="text-muted mb-0">Gestion quotidienne du parking</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      
      {/* Stats cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Car size={24} />
            </div>
            <div className="stat-card-value">
              <AnimatedCounter value={overview.activeEntries || 0} />
            </div>
            <div className="stat-card-label">Vehicules presents</div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-card-value">
              <AnimatedCounter value={overview.todayEntries || 0} />
            </div>
            <div className="stat-card-label">Entrees aujourd'hui</div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Clock size={24} />
            </div>
            <div className="stat-card-value">
              <AnimatedCounter 
                value={overview.todayRevenue || 0} 
                suffix=" FCFA"
                duration={2}
              />
            </div>
            <div className="stat-card-label">Revenus du jour</div>
          </div>
        </div>
      </div>
      
      {/* Places disponibles */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Places disponibles</h5>
        </div>
        <div className="card-body">
          {occupancy.length === 0 ? (
            <p className="text-muted text-center py-4">Aucun parking disponible</p>
          ) : (
            <div className="row g-3">
              {occupancy.map((parking) => (
                <div key={parking.parkingId} className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="mb-3">{parking.parkingName}</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Places disponibles:</span>
                        <span className="fs-4 fw-bold text-primary">
                          {parking.availableSpaces}/{parking.totalCapacity}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${
                            parking.occupancyRate > 90 ? 'bg-danger' :
                            parking.occupancyRate > 70 ? 'bg-warning' :
                            'bg-success'
                          }`}
                          style={{ width: `${parking.occupancyRate}%` }}
                        />
                      </div>
                      <div className="text-muted small mt-1">
                        Taux d'occupation: {parking.occupancyRate}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Actions rapides */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Actions rapides</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-primary w-100">
                Nouvelle entree
              </button>
            </div>
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-success w-100">
                Enregistrer sortie
              </button>
            </div>
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-info text-white w-100">
                Voir les vehicules
              </button>
            </div>
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-secondary w-100">
                Generer facture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
