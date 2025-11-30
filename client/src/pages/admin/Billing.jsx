import { useState, useEffect } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ErrorMessage from '../../components/common/ErrorMessage';
import billingService from '../../services/billing.service';
import entryService from '../../services/entry.service';

/**
 * Page de facturation (Admin)
 */
export default function Billing() {
  const [entries, setEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadBillings();
  }, [pagination.page, filters]);

  const loadBillings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: 'COMPLETED'
      };
      
      const data = await entryService.getAll(params);
      setInvoices(data.entries);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (entryId) => {
    try {
      const blob = await billingService.downloadPDF(entryId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${entryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Facture telechargee');
    } catch (err) {
      toast.error('Erreur lors du telechargement');
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await billingService.exportExcel(filters.startDate, filters.endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factures-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export Excel termine');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const columns = [
    {
      key: 'vehicle',
      label: 'Vehicule',
      render: (value) => (
        <div>
          <div className="fw-bold text-primary">{value.plateNumber}</div>
          <small className="text-muted">{value.vehicleType}</small>
        </div>
      )
    },
    {
      key: 'entryTime',
      label: 'Date',
      render: (value) => format(new Date(value), 'dd/MM/yyyy')
    },
    {
      key: 'duration',
      label: 'Duree',
      render: (value) => formatDuration(value)
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (value) => <span className="fw-bold text-success">{value.toFixed(0)} FCFA</span>
    },
    {
      key: 'paymentMethod',
      label: 'Paiement',
      render: (value) => value || '-'
    }
  ];

  const renderActions = (entry) => (
    <>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => handleDownloadPDF(entry.id)}
        title="Telecharger la facture"
      >
        <FileText size={16} />
      </button>
    </>
  );

  if (error && entries.length === 0) {
    return <ErrorMessage message={error} onRetry={loadBillings} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Facturation</h2>
          <p className="text-muted mb-0">Historique et exports des factures</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleExportExcel}
          disabled={isExporting}
        >
          <Download size={18} className="me-2" />
          {isExporting ? 'Export en cours...' : 'Exporter Excel'}
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Rechercher par plaque..."
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Date debut"
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={entries}
            isLoading={isLoading}
            emptyMessage="Aucune facture disponible"
            actions={renderActions}
          />
          
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
