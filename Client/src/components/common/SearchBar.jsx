import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = ''
}) => {
  return (
    <div className={`search-box ${className}`}>
      <Search size={18} className="search-box-icon" />
      <input
        type="text"
        className="search-box-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
