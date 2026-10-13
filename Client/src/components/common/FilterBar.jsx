import React from 'react';

export const FilterBar = ({
  tabs = [],
  activeTab,
  onTabChange,
  counts = {},
  categories = [],
  selectedCategory,
  onCategoryChange,
  brands = [],
  selectedBrand,
  onBrandChange
}) => {
  return (
    <div className="filter-actions">
      {tabs.length > 0 && (
        <div className="filter-tabs">
          {tabs.map((tab) => {
            const count = counts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`filter-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(tab)}
              >
                <span>{tab}</span>
                {count !== undefined && (
                  <span className="filter-tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {categories.length > 0 && (
        <select
          className="filter-select"
          value={selectedCategory || 'All'}
          onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {brands.length > 0 && (
        <select
          className="filter-select"
          value={selectedBrand || 'All'}
          onChange={(e) => onBrandChange && onBrandChange(e.target.value)}
        >
          <option value="All">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
