import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Car, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import statsService from '../../services/stats.service';

/**
 * Page de statistiques (Admin)
 */
export default function Stats() {
  const [stats, setStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [occupancyStats, setOccupancyStats] = useState(null);
  const [trafficStats, setTrafficStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [dashboardData, revenueData, occupancyData, trafficData] = await Promise.all([
        statsService.getDashboard(),
        statsService.getRevenue(period),
        statsService.getOccupancy(period),
        statsService.getTraffic(period)
      ]);

      setStats(dashboardData);
      setRevenueStats(revenueData);
      setOccupancyStats(occupancyData);
      setTrafficStats(trafficData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#624bff', '#10b981', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadStats} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Statistiques</h2>
          <p className="text-muted mb-0">Analyses et rapports detailles</p>
        </div>
        <div>
          <select 
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette annee</option>
          </select>
        </div>
      </div>

      {/* Cartes de statistiques */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-primary">
                <Car size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalEntries || 0}</h3>
                <p className="stat-card-label">Entrees totales</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-success">
                <DollarSign size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalRevenue?.toFixed(0) || 0} FCFA</h3>
                <p className="stat-card-label">Revenu total</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-warning">
                <Activity size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.currentOccupancy || 0}%</h3>
                <p className="stat-card-label">Taux d'occupation</p>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-info">
                <TrendingUp size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.averageDuration || 0}h</h3>
                <p className="stat-card-label">Duree moyenne</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="row g-4">
        {/* Graphique de revenus */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Evolution des revenus</h5>
            </div>
            <div className="card-body">
              {revenueStats && revenueStats.data && revenueStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueStats.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#624bff" name="Revenu (FCFA)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnee disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique de repartition par type */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Repartition par type</h5>
            </div>
            <div className="card-body">
              {stats && stats.vehiclesByType && stats.vehiclesByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.vehiclesByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.vehiclesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnee disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique de taux d'occupation */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Taux d'occupation</h5>
            </div>
            <div className="card-body">
              {occupancyStats && occupancyStats.data && occupancyStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={occupancyStats.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="occupancy" fill="#10b981" name="Taux d'occupation (%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnee disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique de trafic */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Analyse du trafic</h5>
            </div>
            <div className="card-body">
              {trafficStats && trafficStats.data && trafficStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficStats.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entries" fill="#624bff" name="Entrees" />
                    <Bar dataKey="exits" fill="#f59e0b" name="Sorties" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnee disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
