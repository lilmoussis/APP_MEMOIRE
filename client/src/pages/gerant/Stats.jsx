/**
 * Page de statistiques (Gerant)
 */

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Car, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import statsService from '../../services/stats.service';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [trafficStats, setTrafficStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [dashboardData, trafficData] = await Promise.all([
        statsService.getDashboard(),
        statsService.getTraffic(period)
      ]);
      setStats(dashboardData);
      setTrafficStats(trafficData);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Statistiques</h2>
          <p className="text-muted mb-0">Vue quotidienne</p>
        </div>
        <select className="form-select" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: 'auto' }}>
          <option value="day">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-primary"><Car size={24} /></div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalEntries || 0}</h3>
                <p className="stat-card-label">Entrees</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-success"><DollarSign size={24} /></div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalRevenue?.toFixed(0) || 0} FCFA</h3>
                <p className="stat-card-label">Revenus</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-warning"><TrendingUp size={24} /></div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.currentOccupancy || 0}%</h3>
                <p className="stat-card-label">Occupation</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-info"><Clock size={24} /></div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.averageDuration?.toFixed(1) || 0}h</h3>
                <p className="stat-card-label">Duree moyenne</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header"><h5 className="card-title mb-0">Analyse du trafic</h5></div>
            <div className="card-body">
              {trafficStats && trafficStats.data && trafficStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficStats.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(v) => `${v}h`} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entries" fill="#624bff" name="Entrees" />
                    <Bar dataKey="exits" fill="#10b981" name="Sorties" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5"><p className="text-muted">Aucune donnee</p></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {stats && stats.vehiclesByType && stats.vehiclesByType.length > 0 && (
        <div className="row g-4 mt-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Types de vehicules</h5></div>
              <div className="card-body">
                <div className="row g-3">
                  {stats.vehiclesByType.map((type, idx) => (
                    <div key={idx} className="col-md-4">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="stat-icon bg-primary me-3"><Car size={24} /></div>
                        <div className="flex-grow-1">
                          <h5 className="mb-0">{type.count}</h5>
                          <small className="text-muted">{type.name}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
