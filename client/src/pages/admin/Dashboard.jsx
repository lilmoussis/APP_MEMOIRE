/**
 * Dashboard Super Administrateur
 * Vue d'ensemble du système avec statistiques en temps réel
 */

// Import des dépendances
import { useEffect, useState } from 'react'; // Hooks React pour état et effets
import { LayoutDashboard, Users, Car, ParkingSquare, TrendingUp } from 'lucide-react'; // Icônes pour les cartes de stats
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Import des services et store
import statsService from '../../services/stats.service'; // Service pour les statistiques
import { useStatsStore } from '../../store'; // Store Zustand pour les statistiques

// Import des composants UI
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import AnimatedCounter from '../../components/common/AnimatedCounter';

/**
 * Composant Dashboard Admin
 * Affiche les statistiques globales du système
 */
export default function AdminDashboard() {
  // Récupération des états et actions depuis le store de statistiques
  const { 
    dashboardStats,  // Statistiques du dashboard
    setDashboardStats, // Fonction pour mettre à jour les stats
    isLoading,       // État de chargement
    setLoading,      // Fonction pour changer l'état de chargement
    error,           // Erreur éventuelle
    setError         // Fonction pour définir l'erreur
  } = useStatsStore();
  
  // État local pour l'indicateur de rafraîchissement manuel
  const [refreshing, setRefreshing] = useState(false);
  
  /**
   * useEffect pour charger les statistiques au montage du composant
   * Le tableau de dépendances vide [] signifie que l'effet ne s'exécute qu'une fois
   */
  useEffect(() => {
    loadDashboardStats(); // Charge les statistiques du dashboard
  }, []); // Dépendances vides = exécution unique au montage
  
  /**
   * Charge les statistiques du dashboard depuis l'API
   * Utilise le store Zustand pour gérer l'état
   */
  const loadDashboardStats = async () => {
    setLoading(true); // Active l'état de chargement dans le store
    setError(null);   // Réinitialise les erreurs
    
    try {
      // Appel API pour récupérer les statistiques
      const stats = await statsService.getDashboardStats();
      setDashboardStats(stats); // Stocke les stats dans le store
    } catch (err) {
      setError(err.message); // Stocke le message d'erreur
      toast.error('Erreur lors du chargement des statistiques'); // Notification utilisateur
    } finally {
      setLoading(false); // Désactive l'état de chargement
    }
  };
  
  /**
   * Gère le rafraîchissement manuel des statistiques
   * Affiche un indicateur de chargement et une notification de succès
   */
  const handleRefresh = async () => {
    setRefreshing(true); // Active l'indicateur de rafraîchissement
    await loadDashboardStats(); // Recharge les statistiques
    setRefreshing(false); // Désactive l'indicateur
    toast.success('Statistiques actualisées'); // Confirmation utilisateur
  };
  
  /**
   * Affichage du composant de chargement pendant le chargement initial
   * (seulement si pas encore de données)
   */
  if (isLoading && !dashboardStats) {
    return <Loading text="Chargement des statistiques..." />;
  }
  
  /**
   * Affichage d'erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && !dashboardStats) {
    return <ErrorMessage message={error} onRetry={loadDashboardStats} />;
  }
  
  // Extraction des données depuis les statistiques (avec valeurs par défaut)
  const overview = dashboardStats?.overview || {}; // Vue d'ensemble (totaux)
  const occupancy = dashboardStats?.occupancy || []; // Taux d'occupation par parking
  
  /**
   * Rendu principal du dashboard
   */
  return (
    <div>
      {/* En-tête du dashboard avec bouton de rafraîchissement */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Tableau de bord</h2>
          <p className="text-muted mb-0">Vue d'ensemble du système</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={refreshing} // Désactive pendant le rafraîchissement
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'} {/* Texte dynamique */}
        </button>
      </div>
      
      {/* Section des cartes de statistiques */}
      <div className="row g-4 mb-4">
        {/* Carte: Parkings actifs */}
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <ParkingSquare size={24} />
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour parkings actifs */}
              <AnimatedCounter value={overview.totalParkings || 0} />
            </div>
            <div className="stat-card-label">Parkings actifs</div>
          </div>
        </div>
        
        {/* Carte: Véhicules présents */}
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Car size={24} />
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour véhicules actuellement dans les parkings */}
              <AnimatedCounter value={overview.activeEntries || 0} />
            </div>
            <div className="stat-card-label">Véhicules présents</div>
          </div>
        </div>
        
        {/* Carte: Entrées aujourd'hui */}
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour entrées de la journée */}
              <AnimatedCounter value={overview.todayEntries || 0} />
            </div>
            <div className="stat-card-label">Entrées aujourd'hui</div>
          </div>
        </div>
        
        {/* Carte: Véhicules enregistrés */}
        <div className="col-md-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Users size={24} />
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour total véhicules enregistrés */}
              <AnimatedCounter value={overview.totalVehicles || 0} />
            </div>
            <div className="stat-card-label">Véhicules enregistrés</div>
          </div>
        </div>
      </div>
      
      {/* Section des revenus */}
      <div className="row g-4 mb-4">
        {/* Carte: Revenus du jour */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenus du jour</h5>
            </div>
            <div className="card-body">
              <h3 className="text-primary mb-0">
                {/* Compteur animé avec devise et animation plus longue */}
                <AnimatedCounter 
                  value={overview.todayRevenue || 0} 
                  suffix=" FCFA"
                  duration={2} // Animation de 2 secondes
                />
              </h3>
              <p className="text-muted small mb-0">Total des paiements effectués</p>
            </div>
          </div>
        </div>
        
        {/* Carte: Revenus totaux */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenus totaux</h5>
            </div>
            <div className="card-body">
              <h3 className="text-success mb-0">
                {/* Compteur animé pour revenus historiques */}
                <AnimatedCounter 
                  value={overview.totalRevenue || 0} 
                  suffix=" FCFA"
                  duration={2}
                />
              </h3>
              <p className="text-muted small mb-0">Depuis le début</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section: Taux d'occupation des parkings */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Taux d'occupation des parkings</h5>
        </div>
        <div className="card-body">
          {/* Message si aucun parking */}
          {occupancy.length === 0 ? (
            <p className="text-muted text-center py-4">Aucun parking disponible</p>
          ) : (
            /* Tableau d'occupation des parkings */
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Parking</th>
                    <th className="text-center">Capacité</th>
                    <th className="text-center">Places occupées</th>
                    <th className="text-center">Places disponibles</th>
                    <th className="text-center">Taux d'occupation</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Boucle sur chaque parking */}
                  {occupancy.map((parking) => (
                    <tr key={parking.parkingId}>
                      <td className="fw-bold">{parking.parkingName}</td>
                      <td className="text-center">{parking.totalCapacity}</td>
                      <td className="text-center">{parking.occupiedSpaces}</td>
                      <td className="text-center">
                        {/* Texte rouge si plus de places disponibles */}
                        <span className={parking.availableSpaces === 0 ? 'text-danger fw-bold' : ''}>
                          {parking.availableSpaces}
                        </span>
                      </td>
                      <td className="text-center">
                        {/* Barre de progression colorée selon le taux d'occupation */}
                        <div className="progress" style={{ height: '25px' }}>
                          <div 
                            className={`progress-bar ${
                              parking.occupancyRate > 90 ? 'bg-danger' : // Rouge si > 90%
                              parking.occupancyRate > 70 ? 'bg-warning' : // Orange si > 70%
                              'bg-success' // Vert sinon
                            }`}
                            style={{ width: `${parking.occupancyRate}%` }}
                          >
                            {parking.occupancyRate}% {/* Affichage du pourcentage */}
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