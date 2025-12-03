/**
 * Page de paramètres (Admin)
 * Interface de configuration du système avec différentes catégories de paramètres
 */

import { useState } from 'react'; // Hook React pour l'état local
import { Save } from 'lucide-react'; // Icône de sauvegarde
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast

/**
 * Composant Settings
 * Permet de configurer les paramètres généraux du système de gestion de parking
 */
export default function Settings() {
  // État pour le chargement lors de la sauvegarde
  const [isLoading, setIsLoading] = useState(false);
  
  // État des paramètres du système avec valeurs par défaut
  const [settings, setSettings] = useState({
    // Section Général
    systemName: 'Système de Gestion de Parking', // Nom de l'application
    currency: 'FCFA', // Devise par défaut (Franc CFA)
    timezone: 'Africa/Dakar', // Fuseau horaire par défaut
    
    // Section Notifications
    emailNotifications: true, // Activer/désactiver notifications email
    autoInvoiceGeneration: true, // Génération automatique des factures
    invoicePrefix: 'INV', // Préfixe pour les numéros de facture
    
    // Section Tarifs par défaut (FCFA par heure)
    defaultTariffMoto: 500,    // Tarif horaire moto
    defaultTariffVoiture: 1000, // Tarif horaire voiture
    defaultTariffCamion: 2000,  // Tarif horaire camion
    
    // Section Règles
    maxParkingDuration: 24,      // Durée maximale de stationnement (heures)
    gracePeriodMinutes: 15       // Période de grâce gratuite (minutes)
  });

  /**
   * Gère le changement de valeur pour n'importe quel champ
   * Met à jour l'état des paramètres de manière dynamique
   * @param {string} field - Nom du champ à modifier
   * @param {any} value - Nouvelle valeur du champ
   */
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Soumet le formulaire de paramètres
   * Simule l'envoi au serveur avec un timeout
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    try {
      setIsLoading(true); // Active l'état de chargement
      
      // Simulation d'appel API (remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Paramètres enregistrés'); // Notification de succès
    } catch (err) {
      toast.error('Erreur'); // Notification d'erreur (générique)
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  /**
   * Rendu principal de la page des paramètres
   * Organisé en cartes par catégorie
   */
  return (
    <div>
      {/* En-tête de la page */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Paramètres</h2>
          <p className="text-muted mb-0">Configuration du système</p>
        </div>
      </div>

      {/* Formulaire principal des paramètres */}
      <form onSubmit={handleSubmit}>
        {/* Grille de cartes de paramètres */}
        <div className="row g-4">
          {/* Carte: Paramètres Généraux */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Général</h5>
              </div>
              <div className="card-body">
                {/* Champ: Nom du système */}
                <div className="mb-3">
                  <label className="form-label">Nom du système</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={settings.systemName} 
                    onChange={(e) => handleChange('systemName', e.target.value)} 
                  />
                </div>
                
                {/* Champ: Devise */}
                <div className="mb-3">
                  <label className="form-label">Devise</label>
                  <select 
                    className="form-select" 
                    value={settings.currency} 
                    onChange={(e) => handleChange('currency', e.target.value)}
                  >
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                
                {/* Champ: Fuseau horaire */}
                <div className="mb-3">
                  <label className="form-label">Fuseau horaire</label>
                  <select 
                    className="form-select" 
                    value={settings.timezone} 
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <option value="Africa/Dakar">Africa/Dakar</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Carte: Notifications */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Notifications</h5>
              </div>
              <div className="card-body">
                {/* Switch: Notifications email */}
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={settings.emailNotifications} 
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)} 
                    />
                    <label className="form-check-label">Notifications email</label>
                  </div>
                </div>
                
                {/* Switch: Génération auto factures */}
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={settings.autoInvoiceGeneration} 
                      onChange={(e) => handleChange('autoInvoiceGeneration', e.target.checked)} 
                    />
                    <label className="form-check-label">Génération auto factures</label>
                  </div>
                </div>
                
                {/* Champ: Préfixe facture */}
                <div className="mb-3">
                  <label className="form-label">Préfixe facture</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={settings.invoicePrefix} 
                    onChange={(e) => handleChange('invoicePrefix', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carte: Tarifs par défaut */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Tarifs</h5>
              </div>
              <div className="card-body">
                {/* Champ: Tarif moto */}
                <div className="mb-3">
                  <label className="form-label">Moto (FCFA/h)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={settings.defaultTariffMoto} 
                    onChange={(e) => handleChange('defaultTariffMoto', parseInt(e.target.value))} 
                  />
                </div>
                
                {/* Champ: Tarif voiture */}
                <div className="mb-3">
                  <label className="form-label">Voiture (FCFA/h)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={settings.defaultTariffVoiture} 
                    onChange={(e) => handleChange('defaultTariffVoiture', parseInt(e.target.value))} 
                  />
                </div>
                
                {/* Champ: Tarif camion */}
                <div className="mb-3">
                  <label className="form-label">Camion (FCFA/h)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={settings.defaultTariffCamion} 
                    onChange={(e) => handleChange('defaultTariffCamion', parseInt(e.target.value))} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carte: Règles de stationnement */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Règles</h5>
              </div>
              <div className="card-body">
                {/* Champ: Durée maximale */}
                <div className="mb-3">
                  <label className="form-label">Durée max (h)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={settings.maxParkingDuration} 
                    onChange={(e) => handleChange('maxParkingDuration', parseInt(e.target.value))} 
                  />
                </div>
                
                {/* Champ: Période de grâce */}
                <div className="mb-3">
                  <label className="form-label">Période grâce (min)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={settings.gracePeriodMinutes} 
                    onChange={(e) => handleChange('gracePeriodMinutes', parseInt(e.target.value))} 
                  />
                  <small className="text-muted">Temps gratuit</small> {/* Texte d'aide */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="mt-4">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading} // Désactivé pendant le chargement
          >
            {/* Affiche un spinner pendant le chargement, sinon l'icône de sauvegarde */}
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <Save size={20} className="me-2" />
            )}
            Enregistrer {/* Texte du bouton */}
          </button>
        </div>
      </form>
    </div>
  );
}