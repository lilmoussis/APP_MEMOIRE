import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react'; // Icônes pour actions
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Service API pour les parkings
import parkingService from '../../services/parking.service';

/**
 * Page de gestion des parkings (Admin)
 * Permet de créer, lire, modifier, supprimer des parkings et gérer leurs tarifs
 */
export default function Parkings() {
  // États pour les données
  const [parkings, setParkings] = useState([]); // Liste des parkings
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour les modales et dialogues
  const [showModal, setShowModal] = useState(false); // Modal d'édition/ajout parking
  const [showTariffModal, setShowTariffModal] = useState(false); // Modal gestion tarifs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Dialogue suppression
  const [selectedParking, setSelectedParking] = useState(null); // Parking sélectionné
  const [isSubmitting, setIsSubmitting] = useState(false); // État pendant les soumissions

  // État du formulaire pour l'ajout/modification d'un parking
  const [formData, setFormData] = useState({
    name: '',           // Nom du parking
    totalCapacity: '',  // Capacité totale en places
    location: '',       // Localisation géographique
    description: ''     // Description additionnelle
  });

  // État du formulaire pour l'ajout de tarifs
  const [tariffData, setTariffData] = useState({
    vehicleType: 'VOITURE', // Type de véhicule par défaut
    pricePerHour: ''        // Prix horaire en FCFA
  });

  /**
   * useEffect pour charger les parkings au montage du composant
   * Le tableau de dépendances vide [] signifie que l'effet ne s'exécute qu'une fois
   */
  useEffect(() => {
    loadParkings(); // Charge la liste des parkings
  }, []); // Dépendances vides = exécution unique au montage

  /**
   * Charge la liste des parkings depuis l'API
   */
  const loadParkings = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Appel API pour récupérer tous les parkings
      const data = await parkingService.getAll();
      setParkings(data); // Stocke les parkings dans l'état
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement des parkings');
      toast.error('Erreur lors du chargement des parkings');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Ouvre la modal d'ajout/modification d'un parking
   * @param {Object|null} parking - Parking à modifier (null pour ajout)
   */
  const handleOpenModal = (parking = null) => {
    if (parking) {
      // Mode modification: pré-remplit le formulaire
      setSelectedParking(parking);
      setFormData({
        name: parking.name,
        totalCapacity: parking.totalCapacity,
        location: parking.location || '',
        description: parking.description || ''
      });
    } else {
      // Mode ajout: réinitialise le formulaire
      setSelectedParking(null);
      setFormData({
        name: '',
        totalCapacity: '',
        location: '',
        description: ''
      });
    }
    setShowModal(true); // Ouvre la modal
  };

  /**
   * Ferme la modal et réinitialise les données associées
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedParking(null);
    setFormData({
      name: '',
      totalCapacity: '',
      location: '',
      description: ''
    });
  };

  /**
   * Soumet le formulaire d'ajout/modification d'un parking
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de soumission

    try {
      if (selectedParking) {
        // Mode modification: mise à jour du parking existant
        await parkingService.update(selectedParking.id, formData);
        toast.success('Parking modifié avec succès');
      } else {
        // Mode ajout: création d'un nouveau parking
        await parkingService.create(formData);
        toast.success('Parking créé avec succès');
      }
      handleCloseModal(); // Ferme la modal
      loadParkings(); // Recharge la liste des parkings
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false); // Désactive l'état de soumission
    }
  };

  /**
   * Supprime un parking après confirmation
   */
  const handleDelete = async () => {
    if (!selectedParking) return; // Sécurité si pas de parking sélectionné

    setIsSubmitting(true);
    try {
      await parkingService.delete(selectedParking.id);
      toast.success('Parking supprimé avec succès');
      setShowDeleteDialog(false); // Ferme le dialogue
      setSelectedParking(null); // Réinitialise la sélection
      loadParkings(); // Recharge la liste
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Ouvre la modal de gestion des tarifs pour un parking spécifique
   * @param {Object} parking - Parking dont on veut gérer les tarifs
   */
  const handleOpenTariffModal = (parking) => {
    setSelectedParking(parking); // Stocke le parking sélectionné
    setTariffData({
      vehicleType: 'VOITURE', // Valeur par défaut
      pricePerHour: ''
    });
    setShowTariffModal(true); // Ouvre la modal tarifs
  };

  /**
   * Ferme la modal de gestion des tarifs et réinitialise les données
   */
  const handleCloseTariffModal = () => {
    setShowTariffModal(false);
    setSelectedParking(null);
    setTariffData({
      vehicleType: 'VOITURE',
      pricePerHour: ''
    });
  };

  /**
   * Soumet le formulaire d'ajout d'un tarif
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleTariffSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParking) return; // Sécurité si pas de parking sélectionné

    setIsSubmitting(true);
    try {
      // Appel API pour créer un tarif pour ce parking
      await parkingService.createTariff(selectedParking.id, tariffData);
      toast.success('Tarif ajouté avec succès');
      handleCloseTariffModal(); // Ferme la modal
      loadParkings(); // Recharge la liste des parkings (pour voir les nouveaux tarifs)
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout du tarif');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Configuration des colonnes pour le DataTable
   */
  const columns = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true // Permet le tri sur cette colonne
    },
    {
      key: 'totalCapacity',
      label: 'Capacité totale',
      sortable: true,
      render: (value) => `${value} places` // Formatage: "50 places"
    },
    {
      key: 'availableSpaces',
      label: 'Places disponibles',
      sortable: true,
      render: (value, row) => (
        <div className="d-flex align-items-center">
          {/* Texte rouge si 0 place, vert sinon */}
          <span className={value === 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            {value} places
          </span>
          {/* Barre de progression visuelle */}
          <div className="progress ms-2" style={{ width: '100px', height: '8px' }}>
            <div 
              className={`progress-bar ${value === 0 ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${(value / row.totalCapacity) * 100}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Localisation',
      render: (value) => value || '-' // Tirets si pas de localisation
    },
    {
      key: 'tariffs',
      label: 'Tarifs',
      render: (value) => value ? `${value.length} tarif(s)` : '0 tarif' // Nombre de tarifs
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * @param {Object} parking - Le parking courant
   * @returns {JSX.Element} Boutons d'action (tarifs, modifier, supprimer)
   */
  const renderActions = (parking) => (
    <>
      {/* Bouton gestion des tarifs */}
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => handleOpenTariffModal(parking)}
        title="Gérer les tarifs"
      >
        <DollarSign size={16} /> {/* Icône dollar/euro */}
      </button>
      {/* Bouton modification */}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(parking)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
      {/* Bouton suppression */}
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedParking(parking);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué
   * Propose un bouton pour réessayer
   */
  if (error) {
    return <ErrorMessage message={error} onRetry={loadParkings} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête de la page avec bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des parkings</h2>
          <p className="text-muted mb-0">Configuration et surveillance des parkings</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter un parking
        </button>
      </div>

      {/* Carte principale avec le tableau de données */}
      <div className="card">
        <div className="card-body">
          {/* Tableau de données des parkings */}
          <DataTable
            columns={columns}
            data={parkings}
            isLoading={isLoading}
            emptyMessage="Aucun parking enregistré"
            actions={renderActions}
          />
        </div>
      </div>

      {/* Modal pour ajouter/modifier un parking */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedParking ? 'Modifier le parking' : 'Ajouter un parking'}
        size="lg" // Large modal pour plus d'espace
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              form="parking-form" // Associe au formulaire avec l'id "parking-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {/* Formulaire d'ajout/modification */}
        <form id="parking-form" onSubmit={handleSubmit}>
          {/* Champ nom */}
          <div className="mb-3">
            <label className="form-label">Nom du parking *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Champ capacité */}
          <div className="mb-3">
            <label className="form-label">Capacité totale (nombre de places) *</label>
            <input
              type="number"
              className="form-control"
              min="1" // Minimum 1 place
              value={formData.totalCapacity}
              onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
              required
            />
          </div>

          {/* Champ localisation */}
          <div className="mb-3">
            <label className="form-label">Localisation</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Champ description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </form>
      </Modal>

      {/* Modal pour gérer les tarifs d'un parking */}
      <Modal
        isOpen={showTariffModal}
        onClose={handleCloseTariffModal}
        title={`Tarifs - ${selectedParking?.name}`} // Nom du parking dans le titre
        size="lg"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCloseTariffModal}
              disabled={isSubmitting}
            >
              Fermer
            </button>
            <button 
              type="submit" 
              form="tariff-form" // Associe au formulaire avec l'id "tariff-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter le tarif'}
            </button>
          </>
        }
      >
        {/* Formulaire d'ajout de tarif */}
        <form id="tariff-form" onSubmit={handleTariffSubmit}>
          {/* Sélecteur type de véhicule */}
          <div className="mb-3">
            <label className="form-label">Type de véhicule *</label>
            <select
              className="form-select"
              value={tariffData.vehicleType}
              onChange={(e) => setTariffData({ ...tariffData, vehicleType: e.target.value })}
              required
            >
              <option value="MOTO">Moto</option>
              <option value="VOITURE">Voiture</option>
              <option value="CAMION">Camion</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          {/* Champ prix horaire */}
          <div className="mb-3">
            <label className="form-label">Prix par heure (FCFA) *</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01" // Permet les décimales
              value={tariffData.pricePerHour}
              onChange={(e) => setTariffData({ ...tariffData, pricePerHour: parseFloat(e.target.value) })}
              required
            />
          </div>
        </form>

        {/* Affichage des tarifs existants (si présents) */}
        {selectedParking?.tariffs && selectedParking.tariffs.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Tarifs actuels</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Type de véhicule</th>
                    <th>Prix/heure</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Boucle sur chaque tarif existant */}
                  {selectedParking.tariffs.map((tariff) => (
                    <tr key={tariff.id}>
                      <td>{tariff.vehicleType}</td>
                      <td>{tariff.pricePerHour} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedParking(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer le parking"
        message={`Êtes-vous sûr de vouloir supprimer le parking "${selectedParking?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}