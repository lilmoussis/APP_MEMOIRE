import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'; // Icônes pour actions
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

// Composants UI réutilisables
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';

// Service API pour les utilisateurs
import userService from '../../services/user.service';

/**
 * Page de gestion des utilisateurs (Admin)
 * Permet de créer, lire, modifier, supprimer et activer/désactiver des utilisateurs
 * Gestion spécifique des rôles (Super Admin vs Gérant)
 */
export default function Users() {
  // États pour les données
  const [users, setUsers] = useState([]); // Liste des utilisateurs
  const [isLoading, setIsLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Erreurs éventuelles
  
  // États pour les modales et dialogues
  const [showModal, setShowModal] = useState(false); // Modal d'édition/ajout
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Dialogue suppression
  const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné
  const [isSubmitting, setIsSubmitting] = useState(false); // État pendant les soumissions

  // État du formulaire pour l'ajout/modification
  const [formData, setFormData] = useState({
    email: '',        // Email (obligatoire)
    username: '',     // Nom d'utilisateur (obligatoire)
    password: '',     // Mot de passe (obligatoire seulement à la création)
    firstName: '',    // Prénom (optionnel)
    lastName: '',     // Nom (optionnel)
    phone: '',        // Téléphone (optionnel)
    role: 'GERANT',   // Rôle par défaut: Gérant
    isActive: true    // Statut d'activation par défaut
  });

  /**
   * useEffect pour charger les utilisateurs au montage du composant
   * Le tableau de dépendances vide [] signifie que l'effet ne s'exécute qu'une fois
   */
  useEffect(() => {
    loadUsers(); // Charge la liste des utilisateurs
  }, []); // Dépendances vides = exécution unique au montage

  /**
   * Charge la liste des utilisateurs depuis l'API
   */
  const loadUsers = async () => {
    try {
      setIsLoading(true); // Active l'état de chargement
      setError(null);     // Réinitialise les erreurs
      
      // Appel API pour récupérer tous les utilisateurs
      const data = await userService.getAll();
      
      // Gère différentes structures de réponse de l'API
      setUsers(data.users || data.data || []); // Prend en compte les variantes d'API
    } catch (err) {
      // Gestion des erreurs
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Ouvre la modal d'ajout/modification d'un utilisateur
   * @param {Object|null} user - Utilisateur à modifier (null pour ajout)
   */
  const handleOpenModal = (user = null) => {
    if (user) {
      // Mode modification: pré-remplit le formulaire
      setSelectedUser(user);
      setFormData({
        email: user.email,
        username: user.username,
        password: '', // Ne pas pré-remplir le mot de passe (vide = pas de changement)
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      // Mode ajout: réinitialise le formulaire
      setSelectedUser(null);
      setFormData({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'GERANT',
        isActive: true
      });
    }
    setShowModal(true); // Ouvre la modal
  };

  /**
   * Ferme la modal et réinitialise les données associées
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'GERANT',
      isActive: true
    });
  };

  /**
   * Soumet le formulaire d'ajout/modification d'un utilisateur
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsSubmitting(true); // Active l'état de soumission

    try {
      const payload = { ...formData }; // Copie des données du formulaire
      
      // En mode modification: supprime le mot de passe s'il est vide (pour ne pas le modifier)
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      if (selectedUser) {
        // Mode modification: mise à jour de l'utilisateur existant
        await userService.update(selectedUser.id, payload);
        toast.success('Utilisateur modifié avec succès');
      } else {
        // Mode ajout: création d'un nouvel utilisateur
        await userService.create(payload);
        toast.success('Utilisateur créé avec succès');
      }
      
      handleCloseModal(); // Ferme la modal
      loadUsers(); // Recharge la liste des utilisateurs
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false); // Désactive l'état de soumission
    }
  };

  /**
   * Supprime un utilisateur après confirmation
   * Ne permet pas de supprimer les Super Admin
   */
  const handleDelete = async () => {
    if (!selectedUser) return; // Sécurité si pas d'utilisateur sélectionné

    setIsSubmitting(true);
    try {
      await userService.delete(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      setShowDeleteDialog(false); // Ferme le dialogue
      setSelectedUser(null); // Réinitialise la sélection
      loadUsers(); // Recharge la liste
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Active ou désactive un utilisateur (toggle)
   * Ne permet pas de désactiver les Super Admin
   * @param {Object} user - Utilisateur à modifier
   */
  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user.id);
      toast.success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'} avec succès`);
      loadUsers(); // Recharge pour voir le changement
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    }
  };

  /**
   * Configuration des colonnes pour le DataTable
   */
  const columns = [
    {
      key: 'username',
      label: 'Nom d\'utilisateur',
      sortable: true, // Permet le tri sur cette colonne
      render: (value) => <span className="fw-bold">{value}</span> // Texte en gras
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'firstName',
      label: 'Prénom',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'lastName',
      label: 'Nom',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (value) => value || '-' // Tirets si vide
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value) => (
        <Badge variant={value === 'SUPER_ADMIN' ? 'danger' : 'primary'}>
          {value === 'SUPER_ADMIN' ? 'Super Admin' : 'Gérant'} // Libellé en français
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Actif' : 'Inactif'} // Libellé en français
        </Badge>
      )
    }
  ];

  /**
   * Fonction qui génère les boutons d'actions pour chaque ligne du tableau
   * Désactive certaines actions pour les Super Admin
   * @param {Object} user - L'utilisateur courant
   * @returns {JSX.Element} Boutons d'action (toggle, modifier, supprimer)
   */
  const renderActions = (user) => (
    <>
      {/* Bouton toggle activation/désactivation (désactivé pour Super Admin) */}
      <button
        className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => handleToggleStatus(user)}
        title={user.isActive ? 'Désactiver' : 'Activer'}
        disabled={user.role === 'SUPER_ADMIN'} // Empêche de désactiver un Super Admin
      >
        {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      </button>
      {/* Bouton modification */}
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(user)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
      {/* Bouton suppression (désactivé pour Super Admin) */}
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedUser(user);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
        disabled={user.role === 'SUPER_ADMIN'} // Empêche de supprimer un Super Admin
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  /**
   * Affiche une erreur si le chargement a échoué et qu'il n'y a pas de données
   * Propose un bouton pour réessayer
   */
  if (error && users.length === 0) {
    return <ErrorMessage message={error} onRetry={loadUsers} />;
  }

  /**
   * Rendu principal de la page
   */
  return (
    <div>
      {/* En-tête de la page avec bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des utilisateurs</h2>
          <p className="text-muted mb-0">Administration des comptes gérants</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Carte principale avec le tableau de données */}
      <div className="card">
        <div className="card-body">
          {/* Tableau de données des utilisateurs */}
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyMessage="Aucun utilisateur enregistré"
            actions={renderActions}
          />
        </div>
      </div>

      {/* Modal pour ajouter/modifier un utilisateur */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
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
              form="user-form" // Associe au formulaire avec l'id "user-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {/* Formulaire d'ajout/modification */}
        <form id="user-form" onSubmit={handleSubmit}>
          {/* Première ligne: Email et Username */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Nom d'utilisateur *</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Champ mot de passe (conditionnel pour la modification) */}
          <div className="mb-3">
            <label className="form-label">
              Mot de passe {selectedUser ? '(laisser vide pour ne pas modifier)' : '*'}
            </label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser} // Obligatoire seulement à la création
              minLength="6" // Longueur minimale
            />
          </div>

          {/* Deuxième ligne: Prénom et Nom */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Prénom</label>
              <input
                type="text"
                className="form-control"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Champ téléphone */}
          <div className="mb-3">
            <label className="form-label">Téléphone</label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Sélecteur de rôle */}
          <div className="mb-3">
            <label className="form-label">Rôle *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="GERANT">Gérant</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {/* Switch activation/désactivation */}
          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="isActive">
                Compte actif
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser?.username}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}