import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ItemPhotoGallery } from '../components/items/ItemPhotoGallery';
import { EmptyState } from '../components/common/EmptyState';
import { generateClaimId } from '../utils/idGenerator';
import { formatDate, getWarrantyStatus, getTodayDateInputString } from '../utils/dateUtils';
import {
  FileCheck2,
  PlusCircle,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Save,
  RotateCcw,
  Eye,
  Camera,
  History,
  Info
} from 'lucide-react';

export const WarrantyClaims = () => {
  const { warrantyClaims, salesRecords, saveClaim, updateClaimStatus, activeStaff } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNewMode = searchParams.get('mode') === 'new';
  const prefilledSalesId = searchParams.get('salesId') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);

  // New Claim Form State
  const [formData, setFormData] = useState({
    id: generateClaimId(),
    salesRecordId: prefilledSalesId,
    productName: '',
    brand: '',
    customerName: '',
    customerPhone: '',
    claimDate: getTodayDateInputString(),
    defectReported: '',
    damageDescription: '',
    shopNotes: '',
    damagePhotos: [],
    verificationStatus: 'Pending Inspection',
    claimStatus: 'Pending Verification'
  });

  // When prefilledSalesId changes, pull sales record details
  useEffect(() => {
    if (prefilledSalesId) {
      const match = salesRecords.find((s) => s.id === prefilledSalesId);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          salesRecordId: match.id,
          productName: match.productName,
          brand: match.brand,
          customerName: match.customerName,
          customerPhone: match.customerPhone || '',
          shopNotes: `Linked to Sales Record ${match.id} (Purchased: ${formatDate(match.purchaseDate)})`
        }));
      }
    }
  }, [prefilledSalesId, salesRecords]);

  // Status Update in Modal
  const [statusModalClaim, setStatusModalClaim] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [statusNote, setStatusNote] = useState('');

  const claimStatuses = [
    'Pending Verification',
    'Under Review',
    'Eligible',
    'Rejected',
    'Repair in Progress',
    'Replacement Approved',
    'Resolved'
  ];

  const handleSalesSelect = (salesId) => {
    const match = salesRecords.find((s) => s.id === salesId);
    if (match) {
      setFormData((prev) => ({
        ...prev,
        salesRecordId: match.id,
        productName: match.productName,
        brand: match.brand,
        customerName: match.customerName,
        customerPhone: match.customerPhone || '',
        shopNotes: `Linked to Sales Record ${match.id}`
      }));
    }
  };

  const handleCreateClaim = (e) => {
    e.preventDefault();
    if (!formData.defectReported.trim()) {
      alert('Please state the reported defect');
      return;
    }

    const linkedSale = salesRecords.find((s) => s.id === formData.salesRecordId);
    const saleExpiry = linkedSale ? getWarrantyStatus(linkedSale.warrantyExpiryDate) : null;

    const claimToSave = {
      ...formData,
      productName: formData.productName || linkedSale?.productName || 'Equipment Item',
      verificationStatus: saleExpiry
        ? saleExpiry.isActive ? 'Active Warranty Period' : 'Expired Warranty'
        : 'Sales Record Unverified',
      history: [
        {
          date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: formData.claimStatus,
          staff: activeStaff,
          note: `Claim created. Defect: ${formData.defectReported}`
        }
      ]
    };

    saveClaim(claimToSave);
    setSearchParams({});
  };

  const handleStatusChangeSubmit = () => {
    if (!statusModalClaim) return;
    updateClaimStatus(statusModalClaim.id, newStatus, statusNote);
    // Refresh modal claim details
    setStatusModalClaim(null);
    setStatusNote('');
  };

  // Filter claims
  const filteredClaims = warrantyClaims.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.productName.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.defectReported.toLowerCase().includes(q)
    );
  });

  return (
    <div className="warranty-claims-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Warranty Claim Management</h1>
          <p className="page-description">
            Evaluate defect eligibility, inspect damage photos, and update warranty decisions.
          </p>
        </div>
        <div className="page-actions">
          {!isNewMode ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSearchParams({ mode: 'new' })}
            >
              <PlusCircle size={16} />
              Record New Claim
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchParams({})}
            >
              Back to Claims List
            </button>
          )}
        </div>
      </div>

      {isNewMode ? (
        /* Create Claim Form */
        <form onSubmit={handleCreateClaim} className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Claim ID
              </span>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                {formData.id}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Initial Status:</span>
              <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                Pending Verification
              </span>
            </div>
          </div>

          {/* Section 1: Linked Sales Record */}
          <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>1. Link to Registered Sales Record</span>
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <span>Select Registered Sale</span>
                </label>
                <select
                  className="form-select"
                  value={formData.salesRecordId}
                  onChange={(e) => handleSalesSelect(e.target.value)}
                >
                  <option value="">-- Choose Sales Record --</option>
                  {salesRecords.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} &bull; {s.productName} ({s.customerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Linked Sale Expiry Status */}
              {(() => {
                const linkedSale = salesRecords.find((s) => s.id === formData.salesRecordId);
                if (!linkedSale) return null;
                const st = getWarrantyStatus(linkedSale.warrantyExpiryDate);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: st.isActive ? 'var(--success)' : 'var(--error)' }}>
                      {st.isActive ? '✓ Warranty Period is Active' : '✕ Warranty Period Has Expired'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Purchased: {formatDate(linkedSale.purchaseDate)} &bull; Expiry: {formatDate(linkedSale.warrantyExpiryDate)} ({st.text})
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <span>Product Name</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. SG Sunny Tonny Cricket Bat"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Customer Name</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Rahul Dravid"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Defect Details & Photos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              2. Reported Defect & Damage Evidence
            </h3>

            <div className="form-group">
              <label className="form-label">
                <span>Reported Defect Summary <span className="required">*</span></span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Horizontal split across sweet spot willow grains"
                value={formData.defectReported}
                onChange={(e) => setFormData({ ...formData, defectReported: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Damage Description & Inspection Findings</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Impact occurred during leather ball cricket match. Willow split 3 inches from toe. No signs of machine knocking or intentional alteration."
                value={formData.damageDescription}
                onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Damage Photos (showing break or defect)</span>
              </label>
              <ItemPhotoGallery
                photos={formData.damagePhotos}
                onChange={(photos) => setFormData({ ...formData, damagePhotos: photos })}
                maxPhotos={3}
              />
            </div>
          </div>

          {/* Decision Precaution Alert */}
          <div className="warning-callout">
            <AlertTriangle size={20} className="warning-callout-icon" />
            <div className="warning-callout-content">
              <div className="warning-callout-title">Shopkeeper Discretionary Review</div>
              <div className="warning-callout-text">
                Warranty claims are not automatically approved. Even if the calendar warranty is active, verify that the damage is not due to non-standard balls, edge mishits, or moisture exposure.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchParams({})}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} />
              Save Warranty Claim
            </button>
          </div>
        </form>
      ) : (
        /* Claims List View */
        <div className="card">
          <div className="card-header">
            <div className="search-box" style={{ maxWidth: '400px' }}>
              <input
                type="text"
                className="search-box-input"
                placeholder="Search claims by ID, customer, product or defect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total: {filteredClaims.length} warranty claims
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Damage Photo</th>
                  <th>Product Details</th>
                  <th>Customer</th>
                  <th>Claim Date</th>
                  <th>Reported Defect</th>
                  <th>Claim Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td>
                      <span className="item-code">{claim.id}</span>
                      {claim.salesRecordId && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Sale: {claim.salesRecordId}
                        </div>
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <img
                          src={claim.damagePhotos?.[0] || claim.photos?.[0]}
                          alt={claim.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{claim.productName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{claim.brand}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{claim.customerPhone || 'No phone'}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {formatDate(claim.claimDate)}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', maxWidth: '240px', lineHeight: 1.3 }}>
                        {claim.defectReported}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={claim.claimStatus} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedClaim(claim)}
                          title="View claim details & history log"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setStatusModalClaim(claim);
                            setNewStatus(claim.claimStatus);
                          }}
                          title="Update decision"
                        >
                          Decision
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claim Details View Modal */}
      {selectedClaim && (
        <Modal
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          title={`Warranty Claim Details: ${selectedClaim.id}`}
          size="lg"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedClaim(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setStatusModalClaim(selectedClaim);
                  setNewStatus(selectedClaim.claimStatus);
                }}
              >
                Change Claim Status
              </button>
            </>
          }
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="item-code">{selectedClaim.id}</span>
                <h4 style={{ fontSize: '1.15rem', marginTop: '0.25rem' }}>{selectedClaim.productName}</h4>
              </div>
              <StatusBadge status={selectedClaim.claimStatus} />
            </div>

            {/* Damage Photos & Defect Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#F1F5F9', border: '1px solid var(--border-color)' }}>
                <img
                  src={selectedClaim.damagePhotos?.[0]}
                  alt="Damage"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Customer:</strong> {selectedClaim.customerName} ({selectedClaim.customerPhone || 'No phone'})</div>
                <div><strong>Claim Date:</strong> {formatDate(selectedClaim.claimDate)}</div>
                <div><strong>Defect Reported:</strong> <span style={{ color: '#DC2626', fontWeight: 600 }}>{selectedClaim.defectReported}</span></div>
                <div><strong>Damage Description:</strong> {selectedClaim.damageDescription || 'No detailed damage description provided.'}</div>
                <div><strong>Verification Status:</strong> {selectedClaim.verificationStatus}</div>
              </div>
            </div>

            {/* Chronological History Log */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={16} color="var(--primary)" />
                <span>Audit & Decision History Log</span>
              </h4>

              <div className="timeline">
                {(selectedClaim.history || []).map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">
                          Status changed to: <strong>{h.status}</strong>
                        </span>
                        <span className="timeline-date">{h.date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Staff on duty: {h.staff}
                      </div>
                      <div className="timeline-note">{h.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Status Change Modal */}
      {statusModalClaim && (
        <Modal
          isOpen={!!statusModalClaim}
          onClose={() => setStatusModalClaim(null)}
          title={`Update Claim Outcome: ${statusModalClaim.id}`}
          size="md"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStatusModalClaim(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStatusChangeSubmit}
              >
                Record Decision
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">
              <span>Select New Claim Status:</span>
            </label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {claimStatuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Inspection Observations & Decision Notes:</span>
              <span className="hint">Audit log entry</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Inspected crack along grain. Confirmed standard leather ball impact. Approved replacement bat under SG manufacturer warranty clause."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
