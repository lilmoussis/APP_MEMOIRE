import { ChevronUp, ChevronDown } from 'lucide-react';
import EmptyState from './EmptyState';
import Loading from './Loading';

/**
 * Composant Table avec tri et actions
 */
export default function DataTable({ 
  columns, 
  data, 
  isLoading = false,
  emptyMessage = 'Aucune donnee disponible',
  onSort,
  sortColumn,
  sortDirection,
  actions
}) {
  const handleSort = (columnKey) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                onClick={() => handleSort(column.key)}
                style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                className={column.className || ''}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    sortDirection === 'asc' ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key} className={column.className || ''}>
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key] || '-'}
                </td>
              ))}
              {actions && (
                <td className="text-end">
                  <div className="btn-group btn-group-sm" role="group">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
