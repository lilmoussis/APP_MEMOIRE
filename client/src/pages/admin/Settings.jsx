/**
 * Page de parametres (Admin)
 */

import { useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Systeme de Gestion de Parking',
    currency: 'FCFA',
    timezone: 'Africa/Dakar',
    emailNotifications: true,
    autoInvoiceGeneration: true,
    invoicePrefix: 'INV',
    defaultTariffMoto: 500,
    defaultTariffVoiture: 1000,
    defaultTariffCamion: 2000,
    maxParkingDuration: 24,
    gracePeriodMinutes: 15
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Parametres enregistres');
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Parametres</h2>
          <p className="text-muted mb-0">Configuration du systeme</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">General</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nom du systeme</label>
                  <input type="text" className="form-control" value={settings.systemName} onChange={(e) => handleChange('systemName', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Devise</label>
                  <select className="form-select" value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Fuseau horaire</label>
                  <select className="form-select" value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)}>
                    <option value="Africa/Dakar">Africa/Dakar</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Notifications</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />
                    <label className="form-check-label">Notifications email</label>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={settings.autoInvoiceGeneration} onChange={(e) => handleChange('autoInvoiceGeneration', e.target.checked)} />
                    <label className="form-check-label">Generation auto factures</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Prefixe facture</label>
                  <input type="text" className="form-control" value={settings.invoicePrefix} onChange={(e) => handleChange('invoicePrefix', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Tarifs</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Moto (FCFA/h)</label>
                  <input type="number" className="form-control" value={settings.defaultTariffMoto} onChange={(e) => handleChange('defaultTariffMoto', parseInt(e.target.value))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Voiture (FCFA/h)</label>
                  <input type="number" className="form-control" value={settings.defaultTariffVoiture} onChange={(e) => handleChange('defaultTariffVoiture', parseInt(e.target.value))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Camion (FCFA/h)</label>
                  <input type="number" className="form-control" value={settings.defaultTariffCamion} onChange={(e) => handleChange('defaultTariffCamion', parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Regles</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Duree max (h)</label>
                  <input type="number" className="form-control" value={settings.maxParkingDuration} onChange={(e) => handleChange('maxParkingDuration', parseInt(e.target.value))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Periode grace (min)</label>
                  <input type="number" className="form-control" value={settings.gracePeriodMinutes} onChange={(e) => handleChange('gracePeriodMinutes', parseInt(e.target.value))} />
                  <small className="text-muted">Temps gratuit</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <Save size={20} className="me-2" />}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
