import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { TrendingUp, DollarSign, Car, Activity } from 'lucide-react'; // Icônes pour les cartes de stats

// Composants Recharts pour les graphiques
import { 
  LineChart, Line,     // Graphique linéaire (évolution)
  BarChart, Bar,       // Graphique à barres (comparaison)
  PieChart, Pie, Cell, // Graphique circulaire (répartition)
  XAxis, YAxis,        // Axes des graphiques
  CartesianGrid,       // Grille de fond
  Tooltip,             // Info-bulle au survol
  Legend,              // Légende des séries
  ResponsiveContainer  // Conteneur responsive pour graphiques
} from 'recharts';

import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Service API pour les statistiques
import statsService from '../../services/stats.service';

/**
 * Page de statistiques (Admin)
 * Affiche des graphiques et analyses détaillées du système
 */
export default function Stats() {
  // États pour les différentes statistiques
  const [stats, setStats] = useState(null);           // Statistiques globales (dashboard)
  const [revenueStats, setRevenueStats] = useState(null);     // Statistiques de revenus
  const [occupancyStats, setOccupancyStats] = useState(null); // Statistiques d'occupation
  const [trafficStats, setTrafficStats] = useState(null);     // Statistiques de trafic
  const [isLoading, setIsLoading] = useState(true);   // État de chargement
  const [error, setError] = useState(null);           // Erreurs éventuelles
  const [period, setPeriod] = useState('month');      // Période sélectionnée (jour/semaine/mois/année)

  /**
   * useEffect pour charger les statistiques au montage et quand la période change
   */
  useEffect(() => {
    loadStats(); // Charge toutes les statistiques
  }, [period]); // Dépendance: se relance quand `period` change

  /**
   * Charge toutes les statistiques depuis l'API en parallèle
   * Utilise Promise.all pour optimiser les performances
   */
  const loadStats = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Appels API parallèles pour récupérer toutes les statistiques
      const [dashboardData, revenueData, occupancyData, trafficData] = await Promise.all([
        statsService.getDashboard(),         // Statistiques globales
        statsService.getRevenue(period),     // Revenus selon période
        statsService.getOccupancy(period),   // Occupation selon période
        statsService.getTraffic(period)      // Trafic selon période
      ]);

      // Stockage des données dans les états correspondants
      setStats(dashboardData);
      setRevenueStats(revenueData);
      setOccupancyStats(occupancyData);
      setTrafficStats(trafficData);
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  // Palette de couleurs pour les graphiques (réutilisée)
  const COLORS = ['#624bff', '#10b981', '#f59e0b', '#ef4444'];

  /**
   * Affichage du composant de chargement pendant le chargement
   */
  if (isLoading) {
    return <Loading />;
  }

  /**
   * Affichage d'erreur si le chargement a échoué
   * Propose un bouton pour réessayer
   */
  if (error) {
    return <ErrorMessage message={error} onRetry={loadStats} />;
  }

  /**
   * Rendu principal de la page des statistiques
   */
  return (
    <div>
      {/* En-tête avec sélecteur de période */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Statistiques</h2>
          <p className="text-muted mb-0">Analyses et rapports détaillés</p>
        </div>
        <div>
          {/* Sélecteur de période pour filtrer les données */}
          <select 
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Section des cartes de statistiques (KPI) */}
      {stats && (
        <div className="row g-4 mb-4">
          {/* Carte: Entrées totales */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-primary">
                <Car size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalEntries || 0}</h3>
                <p className="stat-card-label">Entrées totales</p>
              </div>
            </div>
          </div>

          {/* Carte: Revenu total */}
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

          {/* Carte: Taux d'occupation */}
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

          {/* Carte: Durée moyenne */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-info">
                <TrendingUp size={24} />
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.averageDuration || 0}h</h3>
                <p className="stat-card-label">Durée moyenne</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section des graphiques */}
      <div className="row g-4">
        {/* Graphique linéaire: Évolution des revenus */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Évolution des revenus</h5>
            </div>
            <div className="card-body">
              {/* Vérification des données avant d'afficher le graphique */}
              {revenueStats && revenueStats.data && revenueStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueStats.data}>
                    <CartesianGrid strokeDasharray="3 3" /> {/* Grille pointillée */}
                    <XAxis dataKey="date" /> {/* Axe X: dates */}
                    <YAxis /> {/* Axe Y: valeurs automatiques */}
                    <Tooltip /> {/* Info-bulle au survol */}
                    <Legend /> {/* Légende des séries */}
                    <Line 
                      type="monotone" // Type de courbe lisse
                      dataKey="revenue" // Clé des données (revenus)
                      stroke="#624bff" // Couleur de la ligne
                      name="Revenu (FCFA)" // Nom dans la légende
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                /* Message si pas de données */
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique circulaire: Répartition par type de véhicule */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Répartition par type</h5>
            </div>
            <div className="card-body">
              {stats && stats.vehiclesByType && stats.vehiclesByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.vehiclesByType} // Données pour le camembert
                      cx="50%" // Centre horizontal
                      cy="50%" // Centre vertical
                      labelLine={false} // Pas de ligne entre le secteur et le label
                      // Formatage des labels: "Nom: pourcentage%"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80} // Rayon du camembert
                      fill="#8884d8" // Couleur par défaut
                      dataKey="count" // Clé des données (nombre de véhicules)
                    >
                      {/* Application des couleurs de la palette */}
                      {stats.vehiclesByType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} // Couleur cyclique
                        />
                      ))}
                    </Pie>
                    <Tooltip /> {/* Info-bulle au survol */}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique à barres: Taux d'occupation */}
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
                    <Bar 
                      dataKey="occupancy" // Pourcentage d'occupation
                      fill="#10b981" // Couleur verte
                      name="Taux d'occupation (%)" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Graphique à barres groupées: Analyse du trafic (entrées vs sorties) */}
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
                    <XAxis dataKey="hour" /> {/* Heures de la journée */}
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* Barres pour les entrées */}
                    <Bar 
                      dataKey="entries" 
                      fill="#624bff" // Couleur violette
                      name="Entrées" 
                    />
                    {/* Barres pour les sorties */}
                    <Bar 
                      dataKey="exits" 
                      fill="#f59e0b" // Couleur orange
                      name="Sorties" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}