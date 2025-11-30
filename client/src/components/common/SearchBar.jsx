import { Search, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Barre de recherche reutilisable
 */
export default function SearchBar({ 
  onSearch, 
  placeholder = 'Rechercher...', 
  debounce = 500 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      onSearch(value);
    }, debounce);

    setTimeoutId(newTimeoutId);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="position-relative">
      <div className="input-group">
        <span className="input-group-text bg-white">
          <Search size={18} className="text-muted" />
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
        {searchTerm && (
          <button 
            className="btn btn-outline-secondary" 
            type="button"
            onClick={handleClear}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
