/**
 * Page de gestion des entrées/sorties (Gérant)
 * Interface simplifiée pour la gestion quotidienne des entrées/sorties
 */

import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; // Icônes pour actions
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast
import { format } from 'date-fns'; // Utilitaire de formatage de dates
import { fr } from 'date-fns/locale'; // Localisation française pour les dates

// Composants UI réutilisables
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';

// Services API pour les données
import entryService from '../../services/entry.service';
import vehicleService from '../../services/vehicle.service';

export default function Entries() {
  // États pour les données
  const [entries, setEntries] = useState([]); // Liste des entrées/sorties
  const [vehicles, setVehicles] = useState([]); // Liste des véhicules (pour nouvelle entrée)
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour l'interface
  const [showModal, setShowModal] = useState(false); // Modal pour nouvelle entrée
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle de pagination
  const [totalPages, setTotalPages] = useState(1); // Nombre total de pages
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
  const [statusFilter, setStatusFilter] = useState('all'); // Filtre par statut ('all', 'active', 'completed')
  
  // État du formulaire pour nouvelle entrée
  const [formData, setFormData] = useState({ 
    vehicleId: '', // ID du véhicule (obligatoire)
    cardId: ''     // Numéro de carte RFID (optionnel)
  });

  /**
   * useEffect pour charger les données au montage et quand les dépendances changent
   * Charge à la fois les entrées et les véhicules
   */
  useEffect(() => {
    loadData(); // Charge toutes les données nécessaires
  }, [currentPage, searchTerm, statusFilter]); // Dépendances: page, recherche, statut

  /**
   * Charge les données depuis l'API
   * Utilise Promise.all pour optimiser les appels parallèles
   */
  const loadData = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      
      // Appels API parallèles pour récupérer entrées et véhicules
      const [entriesData, vehiclesData] = await Promise.all([
        // Récupère les entrées avec filtres et pagination
        entryService.getAll({ 
          page: currentPage, 
          search: searchTerm, 
          status: statusFilter !== 'all' ? statusFilter : undefined 
        }),
        // Récupère la liste des véhicules (limitée à 1000)
        vehicleService.getAll({ limit: 1000 })
      ]);
      
      // Gestion des différentes structures de réponse d'API pour les entrées
      setEntries(entriesData.entries || entriesData.data || []);
      setTotalPages(entriesData.pagination?.totalPages || 1); // Pages totales
      
      // Gestion des différentes structures de réponse d'API pour les véhicules
      setVehicles(vehiclesData.vehicles || vehiclesData.data || []);
    } catch (err) {
      setError(err.message); // Stocke l'erreur
      toast.error('Erreur de chargement'); // Notification utilisateur
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Soumet le formulaire pour enregistrer une nouvelle entrée
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleEntrySubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    try {
      // Appel API pour enregistrer l'entrée
      await entryService.recordEntry(formData);
      toast.success('Entrée enregistrée'); // Confirmation utilisateur
      
      // Réinitialisation et fermeture
      setShowModal(false);
      setFormData({ vehicleId: '', cardId: '' });
      loadData(); // Recharge les données
    } catch (err) {
      toast.error(err.message); // Notification d'erreur
    }
  };

  /**
   * Enregistre une sortie pour une entrée en cours
   * @param {string} entryId - ID de l'entrée à clôturer
   */
  const handleExitSubmit = async (entryId) => {
    try {
      // Appel API pour enregistrer la sortie
      await entryService.recordExit(entryId);
      toast.success('Sortie enregistrée'); // Confirmation utilisateur
      loadData(); // Recharge les données
    } catch (err) {
      toast.error(err.message); // Notification d'erreur
    }
  };

  // Affichage du composant de chargement pendant le chargement
  if (isLoading) return <Loading />;
  
  // Affichage d'erreur si le chargement a échoué
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div>
      {/* En-tête de la page avec bouton nouvelle entrée */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des entrées/sorties</h2>
          <p className="text-muted mb-0">Enregistrement et suivi quotidien</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} className="me-2" />
          Nouvelle entrée
        </button>
      </div>

      {/* Carte de filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche */}
            <div className="col-md-6">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Rechercher..." 
              />
            </div>
            {/* Filtre par statut */}
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="active">En cours</option>
                <option value="completed">Terminés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale avec le tableau des entrées */}
      <div className="card">
        {/* Tableau responsive pour petits écrans */}
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Type</th>
                <th>Entrée</th>
                <th>Sortie</th>
                <th>Durée</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Message si aucune entrée */}
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Aucune entrée
                  </td>
                </tr>
              ) : (
                /* Boucle sur chaque entrée */
                entries.map((entry) => (
                  <tr key={entry.id}>
                    {/* Plaque d'immatriculation du véhicule */}
                    <td className="fw-medium">
                      {entry.vehicle?.plateNumber || 'N/A'}
                    </td>
                    
                    {/* Type de véhicule avec badge */}
                    <td>
                      <span className="badge bg-secondary">
                        {entry.vehicle?.type}
                      </span>
                    </td>
                    
                    {/* Heure d'entrée formatée */}
                    <td>
                      <small>
                        {entry.entryTime ? 
                          format(new Date(entry.entryTime), 'dd/MM/yyyy HH:mm', { locale: fr }) 
                          : '-'}
                      </small>
                    </td>
                    
                    {/* Heure de sortie formatée */}
                    <td>
                      <small>
                        {entry.exitTime ? 
                          format(new Date(entry.exitTime), 'dd/MM/yyyy HH:mm', { locale: fr }) 
                          : '-'}
                      </small>
                    </td>
                    
                    {/* Durée de stationnement */}
                    <td>
                      {entry.duration ? 
                        `${entry.duration.toFixed(2)}h` : 'En cours'}
                    </td>
                    
                    {/* Montant facturé */}
                    <td className="fw-medium">
                      {entry.amount ? 
                        `${entry.amount.toFixed(0)} FCFA` : '-'}
                    </td>
                    
                    {/* Statut avec badge coloré */}
                    <td>
                      <span className={`badge bg-${entry.status === 'active' ? 'success' : 'secondary'}`}>
                        {entry.status === 'active' ? 'En cours' : 'Terminé'}
                      </span>
                    </td>
                    
                    {/* Actions (bouton sortie seulement pour entrées actives) */}
                    <td>
                      {entry.status === 'active' && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleExitSubmit(entry.id)}
                        >
                          <ArrowDownCircle size={16} /> Sortie
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination en pied de carte si plus d'une page */}
        {totalPages > 1 && (
          <div className="card-footer">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      {/* Modal pour nouvelle entrée */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Nouvelle entrée"
      >
        {/* Formulaire d'enregistrement d'entrée */}
        <form onSubmit={handleEntrySubmit}>
          {/* Sélecteur de véhicule */}
          <div className="mb-3">
            <label className="form-label">Véhicule *</label>
            <select 
              className="form-select" 
              value={formData.vehicleId} 
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} 
              required
            >
              <option value="">Sélectionner</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} - {v.type}
                </option>
              ))}
            </select>
          </div>
          
          {/* Champ carte RFID (optionnel) */}
          <div className="mb-3">
            <label className="form-label">Carte RFID</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.cardId} 
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })} 
            />
          </div>
          
          {/* Boutons d'action du formulaire */}
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              <ArrowUpCircle size={20} className="me-2" />
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}