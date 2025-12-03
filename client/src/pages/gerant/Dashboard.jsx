/**
 * Dashboard Gérant
 * Interface simplifiée pour la gestion quotidienne du parking
 */

import { useEffect, useState } from 'react'; // Hooks React pour effets et état local
import { Car, TrendingUp, Clock } from 'lucide-react'; // Icônes pour les statistiques
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Services et store
import statsService from '../../services/stats.service'; // Service API pour les statistiques
import { useStatsStore } from '../../store'; // Store Zustand pour les statistiques

// Composants UI
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import AnimatedCounter from '../../components/common/AnimatedCounter';

export default function GerantDashboard() {
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
   * Tableau de dépendances vide [] = exécution unique au montage
   */
  useEffect(() => {
    loadDashboardStats(); // Charge les statistiques du dashboard
  }, []);
  
  /**
   * Charge les statistiques du dashboard depuis l'API
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
   */
  const handleRefresh = async () => {
    setRefreshing(true); // Active l'indicateur de rafraîchissement
    await loadDashboardStats(); // Recharge les statistiques
    setRefreshing(false); // Désactive l'indicateur
    toast.success('Statistiques actualisées'); // Confirmation utilisateur
  };
  
  // Affichage du composant de chargement pendant le chargement initial
  if (isLoading && !dashboardStats) {
    return <Loading text="Chargement des statistiques..." />;
  }
  
  // Affichage d'erreur si le chargement a échoué et qu'il n'y a pas de données
  if (error && !dashboardStats) {
    return <ErrorMessage message={error} onRetry={loadDashboardStats} />;
  }
  
  // Extraction des données depuis les statistiques (avec valeurs par défaut)
  const overview = dashboardStats?.overview || {}; // Vue d'ensemble (totaux)
  const occupancy = dashboardStats?.occupancy || []; // Taux d'occupation par parking
  
  return (
    <div>
      {/* En-tête du dashboard avec bouton de rafraîchissement */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Tableau de bord</h2>
          <p className="text-muted mb-0">Gestion quotidienne du parking</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={refreshing} // Désactivé pendant le rafraîchissement
        >
          {refreshing ? 'Actualisation...' : 'Actualiser'} {/* Texte dynamique */}
        </button>
      </div>
      
      {/* Section des cartes de statistiques */}
      <div className="row g-4 mb-4">
        {/* Carte: Véhicules présents */}
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Car size={24} /> {/* Icône véhicule */}
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour véhicules actuellement dans le parking */}
              <AnimatedCounter value={overview.activeEntries || 0} />
            </div>
            <div className="stat-card-label">Véhicules présents</div>
          </div>
        </div>
        
        {/* Carte: Entrées aujourd'hui */}
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <TrendingUp size={24} /> {/* Icône tendance */}
            </div>
            <div className="stat-card-value">
              {/* Compteur animé pour entrées de la journée */}
              <AnimatedCounter value={overview.todayEntries || 0} />
            </div>
            <div className="stat-card-label">Entrées aujourd'hui</div>
          </div>
        </div>
        
        {/* Carte: Revenus du jour */}
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-card-icon">
              <Clock size={24} /> {/* Icône horloge/compteur */}
            </div>
            <div className="stat-card-value">
              {/* Compteur animé avec devise et animation de 2 secondes */}
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
      
      {/* Section: Places disponibles par parking */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Places disponibles</h5>
        </div>
        <div className="card-body">
          {/* Message si aucun parking */}
          {occupancy.length === 0 ? (
            <p className="text-muted text-center py-4">Aucun parking disponible</p>
          ) : (
            /* Grille de cartes pour chaque parking */
            <div className="row g-3">
              {occupancy.map((parking) => (
                <div key={parking.parkingId} className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      {/* Nom du parking */}
                      <h6 className="mb-3">{parking.parkingName}</h6>
                      
                      {/* Places disponibles / Capacité totale */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Places disponibles:</span>
                        <span className="fs-4 fw-bold text-primary">
                          {parking.availableSpaces}/{parking.totalCapacity}
                        </span>
                      </div>
                      
                      {/* Barre de progression colorée selon le taux d'occupation */}
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${
                            parking.occupancyRate > 90 ? 'bg-danger' : // Rouge si > 90%
                            parking.occupancyRate > 70 ? 'bg-warning' : // Orange si > 70%
                            'bg-success' // Vert sinon
                          }`}
                          style={{ width: `${parking.occupancyRate}%` }}
                        />
                      </div>
                      
                      {/* Texte indiquant le taux d'occupation en pourcentage */}
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
      
      {/* Section: Actions rapides pour le gérant */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Actions rapides</h5>
        </div>
        <div className="card-body">
          {/* Grille de boutons d'actions */}
          <div className="row g-3">
            {/* Bouton: Nouvelle entrée */}
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-primary w-100">
                Nouvelle entrée
              </button>
            </div>
            
            {/* Bouton: Enregistrer sortie */}
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-success w-100">
                Enregistrer sortie
              </button>
            </div>
            
            {/* Bouton: Voir les véhicules */}
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-info text-white w-100">
                Voir les véhicules
              </button>
            </div>
            
            {/* Bouton: Générer facture */}
            <div className="col-md-6 col-lg-3">
              <button className="btn btn-secondary w-100">
                Générer facture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}