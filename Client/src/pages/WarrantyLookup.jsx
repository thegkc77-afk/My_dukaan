import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, getWarrantyStatus } from '../utils/dateUtils';
import {
  ShieldCheck,
  Search,
  FileCheck2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
  ArrowRight,
  PlusCircle
} from 'lucide-react';

export const WarrantyLookup = () => {
  const { salesRecords, settings } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSale, setSelectedSale] = useState(null);

  // Filtered sales
  const results = useMemo(() => {
    let list = [...salesRecords];

    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (selectedBrand !== 'All') {
      list = list.filter((s) => s.brand === selectedBrand);
    }

    if (!query.trim()) return list;

    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      return (
        item.id.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.customerPhone && item.customerPhone.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(q))
      );
    });
  }, [salesRecords, query, selectedCategory, selectedBrand]);

  const brands = useMemo(() => {
    const set = new Set(salesRecords.map((s) => s.brand).filter(Boolean));
    return Array.from(set);
  }, [salesRecords]);

  const handleOpenSale = (sale) => {
    setSelectedSale(sale);
  };

  return (
    <div className="warranty-lookup-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Warranty Lookup (Lost Bill)</h1>
          <p className="page-description">
            Locate original sales records when a customer has no bill or receipt. Verify coverage dates and file claims.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/sales')}
          >
            All Sales Records
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/warranty-claims?mode=new')}
          >
            <PlusCircle size={16} />
            File New Claim
          </button>
        </div>
      </div>

      {/* Prominent Search Container */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.8rem', paddingRight: '2rem', height: '48px', fontSize: '1rem', border: '2px solid var(--primary-border)' }}
              placeholder="Search by customer name, product, brand, model, serial code, or sales ID..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {(settings.categories || []).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {query && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setQuery('');
                  setSearchParams({});
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Distinction Note */}
      <div
        style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          alignItems: 'flex-start'
        }}
      >
        <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.5 }}>
          <strong>Critical Principle:</strong> Finding a matching sales record verifies the product was purchased here. However, <em>warranty eligibility</em> requires inspecting the physical damage against the manufacturer's warranty terms (e.g. ball impact cracks vs intentional alteration).
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedSale ? '1.2fr 1.8fr' : '1fr', gap: '1.5rem' }}>
        {/* Results Cards List */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            Sales Records Found ({results.length})
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Sales Record Found"
              description="No registered sales match that product, serial code, or customer name."
              actionText="Reset Search"
              onAction={() => setQuery('')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {results.map((sale) => {
                const statusInfo = getWarrantyStatus(sale.warrantyExpiryDate);
                const isSelected = selectedSale?.id === sale.id;

                return (
                  <div
                    key={sale.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleOpenSale(sale)}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid var(--border-color)',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={sale.photos?.[0]}
                          alt={sale.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="item-code">{sale.id}</span>
                          <StatusBadge status={statusInfo.isActive ? 'Active' : 'Expired'} />
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>
                          {sale.productName}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Customer: <strong>{sale.customerName}</strong> &bull; Sold: {formatDate(sale.purchaseDate)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: statusInfo.isActive ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                            {statusInfo.text} (Expires {formatDate(sale.warrantyExpiryDate)})
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Inspect Record <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Sales & Warranty Detail Panel */}
        {selectedSale && (
          <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div>
                <span className="item-code">{selectedSale.id}</span>
                <h3 style={{ fontSize: '1.2rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
                  {selectedSale.productName}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedSale(null)}
              >
                Close View
              </button>
            </div>

            {/* Warranty Status Banner */}
            {(() => {
              const statusInfo = getWarrantyStatus(selectedSale.warrantyExpiryDate);
              return (
                <div className={`warranty-banner ${statusInfo.isActive ? 'active' : 'expired'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {statusInfo.isActive ? (
                      <CheckCircle size={28} color="var(--success)" />
                    ) : (
                      <XCircle size={28} color="var(--error)" />
                    )}
                    <div className="warranty-banner-info">
                      <span className="warranty-banner-title">
                        {statusInfo.isActive ? 'Warranty Period Active' : 'Warranty Period Expired'}
                      </span>
                      <span className="warranty-banner-sub">
                        {statusInfo.isActive
                          ? `Valid until ${formatDate(selectedSale.warrantyExpiryDate)} (${statusInfo.text})`
                          : `Coverage expired on ${formatDate(selectedSale.warrantyExpiryDate)} (${statusInfo.text})`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/warranty-claims?mode=new&salesId=${selectedSale.id}`)}
                  >
                    <FileCheck2 size={16} />
                    File Claim for Item
                  </button>
                </div>
              );
            })()}

            {/* Photo & Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  height: '140px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={selectedSale.photos?.[0]}
                  alt={selectedSale.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <table className="details-specs-table">
                <tbody>
                  <tr>
                    <th>Customer Name</th>
                    <td>{selectedSale.customerName}</td>
                  </tr>
                  <tr>
                    <th>Customer Phone</th>
                    <td>{selectedSale.customerPhone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td>{selectedSale.serialNumber || 'Tagless item / No serial registered'}</td>
                  </tr>
                  <tr>
                    <th>Purchase Date</th>
                    <td>{formatDate(selectedSale.purchaseDate)}</td>
                  </tr>
                  <tr>
                    <th>Warranty Duration</th>
                    <td>{selectedSale.warrantyDuration}</td>
                  </tr>
                  <tr>
                    <th>Original Price</th>
                    <td style={{ fontWeight: 700 }}>₹{selectedSale.purchasePrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Coverage */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Manufacturer Warranty Coverage Terms
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {selectedSale.warrantyTerms || 'Standard equipment manufacturer defect warranty.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => navigate(`/warranty-claims?mode=new&salesId=${selectedSale.id}`)}
              >
                <FileCheck2 size={16} />
                Record Warranty Claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
