/**
 * Page de gestion des véhicules (Gérant)
 * Interface simplifiée en mode consultation seulement (pas de modification/suppression)
 */

import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Car } from 'lucide-react'; // Icône pour les véhicules
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI réutilisables
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

// Service API pour les véhicules
import vehicleService from '../../services/vehicle.service';

export default function Vehicles() {
  // États pour les données
  const [vehicles, setVehicles] = useState([]); // Liste des véhicules
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour la pagination et les filtres
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const [totalPages, setTotalPages] = useState(1); // Nombre total de pages
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche textuelle
  const [typeFilter, setTypeFilter] = useState('all'); // Filtre par type de véhicule

  /**
   * useEffect pour charger les véhicules au montage et quand les dépendances changent
   */
  useEffect(() => {
    loadVehicles(); // Charge la liste des véhicules
  }, [currentPage, searchTerm, typeFilter]); // Dépendances: page, recherche, type

  /**
   * Charge les véhicules depuis l'API
   * Applique les filtres et la pagination
   */
  const loadVehicles = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      
      // Paramètres de requête pour l'API
      const params = {
        page: currentPage, // Page actuelle
        search: searchTerm, // Terme de recherche
        type: typeFilter !== 'all' ? typeFilter : undefined // Filtre type (si différent de 'all')
      };
      
      // Appel API pour récupérer les véhicules
      const data = await vehicleService.getAll(params);
      
      // Gestion des différentes structures de réponse d'API
      setVehicles(data.vehicles || data.data || []); // Données véhicules
      setTotalPages(data.pagination?.totalPages || 1); // Pages totales (défaut: 1)
    } catch (err) {
      // Gestion des erreurs
      setError(err.message); // Stocke le message d'erreur
      toast.error('Erreur de chargement'); // Notification utilisateur
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  // Affichage du composant de chargement pendant le chargement
  if (isLoading) return <Loading />;
  
  // Affichage d'erreur si le chargement a échoué
  if (error) return <ErrorMessage message={error} onRetry={loadVehicles} />;

  return (
    <div>
      {/* En-tête de la page (sans bouton d'ajout pour gérant) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Véhicules enregistrés</h2>
          <p className="text-muted mb-0">Consultation des véhicules</p>
        </div>
      </div>

      {/* Carte de filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-8">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Rechercher..." 
              />
            </div>
            {/* Filtre par type de véhicule */}
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="MOTO">Moto</option>
                <option value="VOITURE">Voiture</option>
                <option value="CAMION">Camion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grille de cartes pour l'affichage des véhicules */}
      <div className="row g-3">
        {/* Message si aucun véhicule */}
        {vehicles.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <Car size={48} className="text-muted mb-3" /> {/* Icône illustrative */}
                <p className="text-muted mb-0">Aucun véhicule</p>
              </div>
            </div>
          </div>
        ) : (
          /* Boucle sur chaque véhicule pour créer une carte */
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="col-md-6 col-lg-4">
              {/* Carte de véhicule avec hauteur fixe */}
              <div className="card h-100">
                <div className="card-body">
                  {/* En-tête de la carte avec plaque et type */}
                  <div className="d-flex align-items-start mb-3">
                    {/* Icône du véhicule */}
                    <div className="stat-icon bg-primary me-3">
                      <Car size={24} />
                    </div>
                    <div className="flex-grow-1">
                      {/* Plaque d'immatriculation */}
                      <h5 className="mb-1">{vehicle.plateNumber}</h5>
                      {/* Type de véhicule avec badge */}
                      <span className="badge bg-secondary">{vehicle.type}</span>
                    </div>
                  </div>
                  
                  {/* Ligne: Nom du propriétaire */}
                  <div className="mb-2">
                    <small className="text-muted">Propriétaire:</small>
                    <div className="fw-medium">{vehicle.ownerName || 'N/A'}</div>
                  </div>
                  
                  {/* Ligne: Contact téléphonique */}
                  <div className="mb-2">
                    <small className="text-muted">Contact:</small>
                    <div>{vehicle.ownerPhone || 'N/A'}</div>
                  </div>
                  
                  {/* Ligne: Carte RFID associée */}
                  <div className="mb-2">
                    <small className="text-muted">Carte:</small>
                    <div>
                      {vehicle.card ? 
                        <span className="badge bg-success">{vehicle.card.cardId}</span> 
                        : 'Aucune'}
                    </div>
                  </div>
                  
                  {/* Ligne: Statut d'activité */}
                  <div>
                    <small className="text-muted">Statut:</small>
                    <div>
                      <span className={`badge bg-${vehicle.isActive ? 'success' : 'danger'}`}>
                        {vehicle.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination conditionnelle (seulement si plus d'une page) */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
}