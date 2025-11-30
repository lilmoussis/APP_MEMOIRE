/**
 * Page de facturation (Gerant)
 */

import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import billingService from '../../services/billing.service';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchTerm, dateFilter]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await billingService.getInvoices({ page: currentPage, search: searchTerm, period: dateFilter });
      setInvoices(data.billings || data.invoices || data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      await billingService.downloadPDF(invoiceId);
      toast.success('Telechargement...');
    } catch (err) {
      toast.error('Erreur telechargement');
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadInvoices} />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Facturation</h2>
          <p className="text-muted mb-0">Gestion des factures</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher..." />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Vehicule</th>
                <th>Date</th>
                <th>Duree</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">Aucune facture</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-monospace">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                    <td><div className="fw-medium">{inv.entry?.vehicle?.plateNumber || 'N/A'}</div><small className="text-muted">{inv.entry?.vehicle?.type}</small></td>
                    <td><small>{inv.createdAt ? format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }) : '-'}</small></td>
                    <td>{inv.entry?.duration ? `${inv.entry.duration.toFixed(2)}h` : '-'}</td>
                    <td className="fw-medium text-success">{inv.amount ? `${inv.amount.toFixed(0)} FCFA` : '-'}</td>
                    <td><span className={`badge bg-${inv.isPaid ? 'success' : 'warning'}`}>{inv.isPaid ? 'Payee' : 'En attente'}</span></td>
                    <td><button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadPDF(inv.id)}><Download size={16} /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div className="card-footer"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      <div className="row g-3 mt-4">
        <div className="col-md-4">
          <div className="card"><div className="card-body"><h6 className="text-muted mb-2">Total aujourd'hui</h6><h3 className="mb-0">{invoices.filter(i => format(new Date(i.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).reduce((sum, i) => sum + (i.amount || 0), 0).toFixed(0)} FCFA</h3></div></div>
        </div>
        <div className="col-md-4">
          <div className="card"><div className="card-body"><h6 className="text-muted mb-2">Factures</h6><h3 className="mb-0">{invoices.length}</h3></div></div>
        </div>
        <div className="col-md-4">
          <div className="card"><div className="card-body"><h6 className="text-muted mb-2">En attente</h6><h3 className="mb-0">{invoices.filter(i => !i.isPaid).length}</h3></div></div>
        </div>
      </div>
    </div>
  );
}
