import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/items/ItemCard';
import { VerificationChecklist } from '../components/items/VerificationChecklist';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { searchTaglessItems } from '../utils/search';
import { formatDate } from '../utils/dateUtils';
import {
  Search,
  ShieldCheck,
  Tag,
  Wrench,
  User,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Filter,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

export const FindItem = () => {
  const { repairOrders, updateRepairStatus, activeStaff, settings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected item for the Item Verification Screen
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Sync query with URL if changed
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set(repairOrders.map((o) => o.brand).filter(Boolean));
    return Array.from(set);
  }, [repairOrders]);

  // Search results ranked by match score
  const searchResults = useMemo(() => {
    return searchTaglessItems(repairOrders, query, {
      category: categoryFilter,
      brand: brandFilter,
      status: statusFilter
    });
  }, [repairOrders, query, categoryFilter, brandFilter, statusFilter]);

  const handleQueryChange = (val) => {
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  const handleOpenVerification = (item) => {
    setVerifyingItem(item);
    setActivePhotoIdx(0);
  };

  const handleVerificationComplete = ({ checklist, notes }) => {
    if (!verifyingItem) return;
    updateRepairStatus(
      verifyingItem.id,
      'Ready for Pickup',
      `[Verification Complete by ${activeStaff}] Visual photos, marks, and problem matched customer recollection. ${notes ? 'Notes: ' + notes : ''}`
    );
    // Proceed directly to handover screen for final release recording
    navigate(`/handovers?orderId=${verifyingItem.id}`);
    setVerifyingItem(null);
  };

  const handleVerificationHold = ({ checklist, notes }) => {
    if (!verifyingItem) return;
    updateRepairStatus(
      verifyingItem.id,
      verifyingItem.repairStatus,
      `[Held for Additional Verification by ${activeStaff}] Insufficient match or customer unsure. Notes: ${notes || 'Customer to bring companion player or proof.'}`
    );
    setVerifyingItem(null);
  };

  const clearAllFilters = () => {
    setQuery('');
    setCategoryFilter('All');
    setBrandFilter('All');
    setStatusFilter('All');
    setSearchParams({});
  };

  return (
    <div className="find-item-page animate-fade-in">
      {/* Hero Header */}
      <div className="find-item-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#DBEAFE', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Sparkles size={14} />
          <span>Core Feature &bull; Lost Bill / Tagless Recovery</span>
        </div>
        <h1 className="find-item-hero-title">Find an Item Without Receipt or Tag</h1>
        <p className="find-item-hero-sub">
          When a customer returns months later with no receipt, phone number, PIN, or physical tag, search our stored physical identities, willow grain marks, and repair notes.
        </p>

        {/* Prominent Search Bar */}
        <div className="find-item-search-wrapper">
          <Search size={22} className="find-item-search-icon" />
          <input
            type="text"
            className="find-item-search-input"
            placeholder="Search by item, brand, customer, repair problem or order details..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Optional Filters */}
        <div className="find-item-filters-row">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {(settings.categories || []).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Repair Statuses</option>
            <option value="Received">Received</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Completed">Completed</option>
          </select>

          {(query || categoryFilter !== 'All' || brandFilter !== 'All' || statusFilter !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearAllFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Search Scenarios (for easy demonstration) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Try Scenario Queries:
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleQueryChange('SG silver tape notch')}
        >
          🏏 "SG silver tape notch" (Cricket Bat Case)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleQueryChange('red thread handle')}
        >
          🏏 "red thread handle" (SS Bat)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleQueryChange('crack sweet spot')}
        >
          🏏 "crack sweet spot" (MRF Bat)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleQueryChange('Yonex grommet string')}
        >
          🏸 "Yonex grommet string" (Badminton)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleQueryChange('bladder valve')}
        >
          ⚽ "bladder valve" (Football)
        </button>
      </div>

      {/* Results Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Possible Matches ({searchResults.length} found)
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Ranked by identity similarity score
        </span>
      </div>

      {searchResults.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matching Sports Equipment Found"
          description="We couldn't find any repair order matching those physical marks, brands, or descriptions. Broaden your search terms or remove filters."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="item-cards-grid">
          {searchResults.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onVerify={() => handleOpenVerification(item)}
              onViewDetails={() => navigate(`/repairs/${item.id}`)}
              highlightQuery={query}
            />
          ))}
        </div>
      )}

      {/* Item Verification Modal Screen (CRITICAL REQUIREMENT) */}
      {verifyingItem && (
        <Modal
          isOpen={!!verifyingItem}
          onClose={() => setVerifyingItem(null)}
          title={`Tagless Identity Verification: ${verifyingItem.name}`}
          size="xl"
        >
          <div>
            {/* Top Warning Banner */}
            <div className="warning-callout">
              <AlertTriangle size={20} className="warning-callout-icon" />
              <div className="warning-callout-content">
                <div className="warning-callout-title">
                  Security Precaution: Verification Checklist Required
                </div>
                <div className="warning-callout-text">
                  The frontend system does not automatically release an item solely because a search result matches. You must inspect the physical equipment against stored photos and verify the customer's account of distinctive marks before marking verification complete.
                </div>
              </div>
            </div>

            {/* Inspection Grid: Photos & Stored Specifications */}
            <div className="inspection-grid">
              {/* Left Column: Photos Comparison */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span>Stored Item Photos ({verifyingItem.photos?.length || 0})</span>
                </div>

                <div className="inspection-photo-box">
                  {verifyingItem.photos?.[activePhotoIdx] ? (
                    <img
                      src={verifyingItem.photos[activePhotoIdx]}
                      alt="Physical verification"
                    />
                  ) : (
                    <span style={{ color: '#94A3B8' }}>No photo recorded</span>
                  )}
                  <span className="inspection-photo-label">
                    Photo {activePhotoIdx + 1} of {verifyingItem.photos?.length || 1}
                  </span>
                </div>

                {verifyingItem.photos && verifyingItem.photos.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {verifyingItem.photos.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: 'var(--radius-sm)',
                          border: activePhotoIdx === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActivePhotoIdx(idx)}
                      >
                        <img src={p} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Stored Distinctive Characteristics Box */}
                <div
                  style={{
                    marginTop: '0.85rem',
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Tag size={14} />
                    <span>Stored Distinctive Marks & Scratches</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#78350F', fontWeight: 600, lineHeight: 1.4 }}>
                    {verifyingItem.distinctiveMarks}
                  </div>
                </div>
              </div>

              {/* Right Column: Stored Order & Specs Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Stored Order Record Information
                </div>

                <table className="details-specs-table">
                  <tbody>
                    <tr>
                      <th>Order ID</th>
                      <td>
                        <span className="item-code">{verifyingItem.id}</span>
                      </td>
                    </tr>
                    <tr>
                      <th>Customer Name</th>
                      <td>{verifyingItem.customerName || 'Walk-in (No Name)'}</td>
                    </tr>
                    <tr>
                      <th>Customer Phone</th>
                      <td>{verifyingItem.customerPhone || 'None recorded'}</td>
                    </tr>
                    <tr>
                      <th>Date Received</th>
                      <td>{formatDate(verifyingItem.dateReceived)}</td>
                    </tr>
                    <tr>
                      <th>Current Status</th>
                      <td>
                        <StatusBadge status={verifyingItem.repairStatus} />
                      </td>
                    </tr>
                    <tr>
                      <th>Reported Problem</th>
                      <td style={{ color: '#0F172A', fontWeight: 600 }}>
                        {verifyingItem.reportedProblem}
                      </td>
                    </tr>
                    <tr>
                      <th>Estimated Fee</th>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{verifyingItem.estimatedCost}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* History / Technician Log */}
                {verifyingItem.notes && (
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Technician Repair History
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.78rem', whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                      {verifyingItem.notes}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Checklist */}
            <VerificationChecklist
              item={verifyingItem}
              onComplete={handleVerificationComplete}
              onHold={handleVerificationHold}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
