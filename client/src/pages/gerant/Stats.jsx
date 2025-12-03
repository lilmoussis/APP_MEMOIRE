/**
 * Page de statistiques (Gérant)
 * Interface simplifiée avec statistiques essentielles pour la gestion quotidienne
 */

import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { TrendingUp, DollarSign, Car, Clock } from 'lucide-react'; // Icônes pour les cartes de stats

// Composants Recharts pour les graphiques
import { 
  BarChart, Bar,       // Graphique à barres pour l'analyse de trafic
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

export default function Stats() {
  // États pour les données statistiques
  const [stats, setStats] = useState(null);           // Statistiques globales du dashboard
  const [trafficStats, setTrafficStats] = useState(null); // Statistiques de trafic (entrées/sorties)
  const [isLoading, setIsLoading] = useState(true);   // État de chargement
  const [error, setError] = useState(null);           // Erreurs éventuelles
  const [period, setPeriod] = useState('day');        // Période sélectionnée (jour/semaine/mois)

  /**
   * useEffect pour charger les statistiques au montage et quand la période change
   */
  useEffect(() => {
    loadStats(); // Charge toutes les statistiques
  }, [period]); // Dépendance: se relance quand `period` change

  /**
   * Charge les statistiques depuis l'API en parallèle
   * Optimise les performances avec Promise.all
   */
  const loadStats = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      
      // Appels API parallèles pour récupérer dashboard et trafic
      const [dashboardData, trafficData] = await Promise.all([
        statsService.getDashboard(),         // Statistiques globales
        statsService.getTraffic(period)      // Statistiques de trafic selon période
      ]);
      
      // Stockage des données dans les états correspondants
      setStats(dashboardData);
      setTrafficStats(trafficData);
    } catch (err) {
      // Gestion des erreurs
      setError(err.message); // Stocke l'erreur
      toast.error('Erreur chargement'); // Notification utilisateur
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  // Affichage du composant de chargement pendant le chargement
  if (isLoading) return <Loading />;
  
  // Affichage d'erreur si le chargement a échoué
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;

  return (
    <div>
      {/* En-tête avec sélecteur de période */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Statistiques</h2>
          <p className="text-muted mb-0">Vue quotidienne</p>
        </div>
        {/* Sélecteur de période avec largeur automatique */}
        <select 
          className="form-select" 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          style={{ width: 'auto' }} // Largeur adaptée au contenu
        >
          <option value="day">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {/* Section des cartes de statistiques (KPI) */}
      {stats && (
        <div className="row g-4 mb-4">
          {/* Carte: Nombre total d'entrées */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-primary">
                <Car size={24} /> {/* Icône véhicule */}
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalEntries || 0}</h3>
                <p className="stat-card-label">Entrées</p>
              </div>
            </div>
          </div>
          
          {/* Carte: Revenus totaux */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-success">
                <DollarSign size={24} /> {/* Icône dollar/euro */}
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.totalRevenue?.toFixed(0) || 0} FCFA</h3>
                <p className="stat-card-label">Revenus</p>
              </div>
            </div>
          </div>
          
          {/* Carte: Taux d'occupation */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-warning">
                <TrendingUp size={24} /> {/* Icône tendance */}
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.currentOccupancy || 0}%</h3>
                <p className="stat-card-label">Occupation</p>
              </div>
            </div>
          </div>
          
          {/* Carte: Durée moyenne de stationnement */}
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-card-icon bg-info">
                <Clock size={24} /> {/* Icône horloge */}
              </div>
              <div className="stat-card-content">
                <h3 className="stat-card-value">{stats.averageDuration?.toFixed(1) || 0}h</h3>
                <p className="stat-card-label">Durée moyenne</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section du graphique principal */}
      <div className="row g-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Analyse du trafic</h5>
            </div>
            <div className="card-body">
              {/* Vérification des données avant d'afficher le graphique */}
              {trafficStats && trafficStats.data && trafficStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficStats.data}>
                    <CartesianGrid strokeDasharray="3 3" /> {/* Grille pointillée */}
                    <XAxis 
                      dataKey="hour" // Données pour l'axe X (heures)
                      tickFormatter={(v) => `${v}h`} // Formatage: "8h", "9h", etc.
                    />
                    <YAxis /> {/* Axe Y avec valeurs automatiques */}
                    <Tooltip /> {/* Info-bulle au survol */}
                    <Legend /> {/* Légende pour distinguer entrées/sorties */}
                    {/* Barres pour les entrées */}
                    <Bar 
                      dataKey="entries" 
                      fill="#624bff" // Couleur violette
                      name="Entrées" 
                    />
                    {/* Barres pour les sorties */}
                    <Bar 
                      dataKey="exits" 
                      fill="#10b981" // Couleur verte
                      name="Sorties" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                /* Message si pas de données de trafic */
                <div className="text-center py-5">
                  <p className="text-muted">Aucune donnée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Répartition par type de véhicule (conditionnelle) */}
      {stats && stats.vehiclesByType && stats.vehiclesByType.length > 0 && (
        <div className="row g-4 mt-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Types de véhicules</h5>
              </div>
              <div className="card-body">
                {/* Grille de cartes pour chaque type de véhicule */}
                <div className="row g-3">
                  {stats.vehiclesByType.map((type, idx) => (
                    <div key={idx} className="col-md-4">
                      {/* Carte individuelle pour chaque type */}
                      <div className="d-flex align-items-center p-3 border rounded">
                        {/* Icône avec fond coloré */}
                        <div className="stat-icon bg-primary me-3">
                          <Car size={24} />
                        </div>
                        {/* Contenu texte */}
                        <div className="flex-grow-1">
                          {/* Nombre de véhicules de ce type */}
                          <h5 className="mb-0">{type.count}</h5>
                          {/* Nom du type de véhicule */}
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