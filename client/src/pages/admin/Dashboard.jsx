/**
 * Dashboard Super Administrateur
 */

import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Car, ParkingSquare, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import statsService from '../../services/stats.service';
import { useStatsStore } from '../../store';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import AnimatedCounter from '../../components/common/AnimatedCounter';

export default function AdminDashboard() {
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
          <p className="text-muted mb-0">Vue d'ensemble du systeme</p>
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
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <ParkingSquare size={24} />
            </div>
            <div className="stat-card-value">
              <AnimatedCounter value={overview.totalParkings || 0} />
            </div>
            <div className="stat-card-label">Parkings actifs</div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
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
        
        <div className="col-md-6 col-lg-3">
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
        
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Users size={24} />
            </div>
            <div className="stat-card-value">
              <AnimatedCounter value={overview.totalVehicles || 0} />
            </div>
            <div className="stat-card-label">Vehicules enregistres</div>
          </div>
        </div>
      </div>
      
      {/* Revenus */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenus du jour</h5>
            </div>
            <div className="card-body">
              <h3 className="text-primary mb-0">
                <AnimatedCounter 
                  value={overview.todayRevenue || 0} 
                  suffix=" FCFA"
                  duration={2}
                />
              </h3>
              <p className="text-muted small mb-0">Total des paiements effectues</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenus totaux</h5>
            </div>
            <div className="card-body">
              <h3 className="text-success mb-0">
                <AnimatedCounter 
                  value={overview.totalRevenue || 0} 
                  suffix=" FCFA"
                  duration={2}
                />
              </h3>
              <p className="text-muted small mb-0">Depuis le debut</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Taux d'occupation */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Taux d'occupation des parkings</h5>
        </div>
        <div className="card-body">
          {occupancy.length === 0 ? (
            <p className="text-muted text-center py-4">Aucun parking disponible</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Parking</th>
                    <th className="text-center">Capacite</th>
                    <th className="text-center">Places occupees</th>
                    <th className="text-center">Places disponibles</th>
                    <th className="text-center">Taux d'occupation</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancy.map((parking) => (
                    <tr key={parking.parkingId}>
                      <td className="fw-bold">{parking.parkingName}</td>
                      <td className="text-center">{parking.totalCapacity}</td>
                      <td className="text-center">{parking.occupiedSpaces}</td>
                      <td className="text-center">
                        <span className={parking.availableSpaces === 0 ? 'text-danger fw-bold' : ''}>
                          {parking.availableSpaces}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="progress" style={{ height: '25px' }}>
                          <div 
                            className={`progress-bar ${
                              parking.occupancyRate > 90 ? 'bg-danger' :
                              parking.occupancyRate > 70 ? 'bg-warning' :
                              'bg-success'
                            }`}
                            style={{ width: `${parking.occupancyRate}%` }}
                          >
                            {parking.occupancyRate}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
