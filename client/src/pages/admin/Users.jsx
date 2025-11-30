import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';
import userService from '../../services/user.service';

/**
 * Page de gestion des utilisateurs (Admin)
 */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'GERANT',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data.users || data.data || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        username: user.username,
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
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
    setShowModal(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      if (selectedUser) {
        await userService.update(selectedUser.id, payload);
        toast.success('Utilisateur modifie avec succes');
      } else {
        await userService.create(payload);
        toast.success('Utilisateur cree avec succes');
      }
      handleCloseModal();
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await userService.delete(selectedUser.id);
      toast.success('Utilisateur supprime avec succes');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user.id);
      toast.success(`Utilisateur ${user.isActive ? 'desactive' : 'active'} avec succes`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise a jour');
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Nom d\'utilisateur',
      sortable: true,
      render: (value) => <span className="fw-bold">{value}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'firstName',
      label: 'Prenom',
      render: (value) => value || '-'
    },
    {
      key: 'lastName',
      label: 'Nom',
      render: (value) => value || '-'
    },
    {
      key: 'phone',
      label: 'Telephone',
      render: (value) => value || '-'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Badge variant={value === 'SUPER_ADMIN' ? 'danger' : 'primary'}>
          {value === 'SUPER_ADMIN' ? 'Super Admin' : 'Gerant'}
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    }
  ];

  const renderActions = (user) => (
    <>
      <button
        className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => handleToggleStatus(user)}
        title={user.isActive ? 'Desactiver' : 'Activer'}
        disabled={user.role === 'SUPER_ADMIN'}
      >
        {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => handleOpenModal(user)}
        title="Modifier"
      >
        <Edit2 size={16} />
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => {
          setSelectedUser(user);
          setShowDeleteDialog(true);
        }}
        title="Supprimer"
        disabled={user.role === 'SUPER_ADMIN'}
      >
        <Trash2 size={16} />
      </button>
    </>
  );

  if (error && users.length === 0) {
    return <ErrorMessage message={error} onRetry={loadUsers} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Gestion des utilisateurs</h2>
          <p className="text-muted mb-0">Administration des comptes gerants</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="me-2" />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyMessage="Aucun utilisateur enregistre"
            actions={renderActions}
          />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
        size="lg"
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
              form="user-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit}>
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

          <div className="mb-3">
            <label className="form-label">
              Mot de passe {selectedUser ? '(laisser vide pour ne pas modifier)' : '*'}
            </label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser}
              minLength="6"
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Prenom</label>
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

          <div className="mb-3">
            <label className="form-label">Telephone</label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="GERANT">Gerant</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Etes-vous sur de vouloir supprimer l'utilisateur "${selectedUser?.username}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
