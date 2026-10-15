import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { VerificationChecklist } from '../components/items/VerificationChecklist';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { EmptyState } from '../components/common/EmptyState';
import { generateHandoverId } from '../utils/idGenerator';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import {
  PackageCheck,
  CheckCircle,
  ShieldCheck,
  User,
  Calendar,
  AlertTriangle,
  Search,
  Eye,
  PlusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const HandoverRecords = () => {
  const {
    handoverRecords,
    repairOrders,
    recordHandover,
    activeStaff,
    settings
  } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const prefilledOrderId = searchParams.get('orderId') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandover, setSelectedHandover] = useState(null);

  // Handover Execution State
  const [activeHandoverOrder, setActiveHandoverOrder] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(activeStaff);
  const [verificationMethod, setVerificationMethod] = useState(
    'Visual Characteristics & Photo Match'
  );
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // If URL has orderId, automatically initiate handover modal
  useEffect(() => {
    if (prefilledOrderId) {
      const order = repairOrders.find((o) => o.id === prefilledOrderId);
      if (order) {
        setActiveHandoverOrder(order);
      }
    }
  }, [prefilledOrderId, repairOrders]);

  // Orders that are ready for pickup (eligible for handover)
  const readyOrders = repairOrders.filter(
    (o) => o.repairStatus === 'Ready for Pickup'
  );

  const handleStartHandover = (order) => {
    setActiveHandoverOrder(order);
    setChecklistCompleted(false);
    setHandoverNotes('');
  };

  const handleVerificationChecklistDone = ({ checklist, notes }) => {
    setChecklistCompleted(true);
    setHandoverNotes(notes || 'Identity verified against stored characteristics.');
  };

  const handleFinalConfirmHandover = () => {
    if (!activeHandoverOrder) return;

    const newHandover = {
      id: generateHandoverId(),
      orderId: activeHandoverOrder.id,
      itemName: activeHandoverOrder.name,
      customerName: activeHandoverOrder.customerName || 'Walk-in Customer',
      customerPhone: activeHandoverOrder.customerPhone || '',
      itemPhoto: activeHandoverOrder.photos?.[0] || '',
      verificationMethod: verificationMethod,
      staffMember: selectedStaff,
      handoverDate: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      handoverStatus: 'Completed',
      notes: handoverNotes || 'Handover successfully executed and verified.'
    };

    recordHandover(newHandover);
    setShowConfirmModal(false);
    setActiveHandoverOrder(null);
    setSearchParams({});
  };

  // Filtered handovers
  const filteredHandovers = handoverRecords.filter((h) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.id.toLowerCase().includes(q) ||
      h.orderId.toLowerCase().includes(q) ||
      h.itemName.toLowerCase().includes(q) ||
      h.customerName.toLowerCase().includes(q) ||
      h.staffMember.toLowerCase().includes(q)
    );
  });

  return (
    <div className="handover-records-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Handover Records</h1>
          <p className="page-description">
            Complete the verification protocol before releasing equipment. Prevents accidental duplicate handovers.
          </p>
        </div>
      </div>

      {/* Orders Ready for Pickup (Pending Handover Workflow) */}
      {readyOrders.length > 0 && (
        <div className="card" style={{ marginBottom: '1.75rem', borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }}>
          <div className="card-header" style={{ borderBottomColor: '#DCFCE7' }}>
            <div className="card-title" style={{ color: '#166534' }}>
              <PackageCheck size={20} color="#16A34A" />
              <span>Items Ready for Customer Handover ({readyOrders.length})</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600 }}>
              Inspection & verification required prior to release
            </span>
          </div>

          <div className="card-body" style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
              {readyOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #BBF7D0',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#F1F5F9', flexShrink: 0 }}>
                      <img src={order.photos?.[0]} alt={order.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span className="item-code">{order.id}</span>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0.15rem 0' }}>{order.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {order.customerName}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => handleStartHandover(order)}
                  >
                    <ShieldCheck size={14} />
                    Start Handover Workflow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Handover History Log Table */}
      <div className="card">
        <div className="card-header">
          <div className="search-box" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              className="search-box-input"
              placeholder="Search handovers by ID, order, customer, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total: {filteredHandovers.length} completed handovers
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Handover ID</th>
                <th>Order Ref</th>
                <th>Photo</th>
                <th>Item Name</th>
                <th>Customer</th>
                <th>Verification Method</th>
                <th>Staff Member</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHandovers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="item-code">{item.id}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem' }}
                      onClick={() => navigate(`/repairs/${item.orderId}`)}
                    >
                      {item.orderId}
                    </button>
                  </td>
                  <td>
                    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                      <img src={item.itemPhoto} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.itemName}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.customerPhone || 'No phone'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', background: '#EFF6FF', color: '#1D4ED8', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                      {item.verificationMethod}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {item.staffMember}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.handoverDate}
                  </td>
                  <td>
                    <StatusBadge status={item.handoverStatus} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedHandover(item)}
                    >
                      <Eye size={14} />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Workflow Execution Modal */}
      {activeHandoverOrder && (
        <Modal
          isOpen={!!activeHandoverOrder}
          onClose={() => setActiveHandoverOrder(null)}
          title={`Equipment Handover Protocol: ${activeHandoverOrder.name}`}
          size="xl"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveHandoverOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={!checklistCompleted}
                onClick={() => setShowConfirmModal(true)}
              >
                <CheckCircle size={16} />
                Confirm & Record Handover
              </button>
            </>
          }
        >
          <div>
            {/* Step Indicators */}
            <div className="handover-steps-bar">
              <div className="handover-step-node active">
                <div className="handover-step-number">1</div>
                <span>Inspect Stored Photo</span>
              </div>
              <div className="handover-step-node active">
                <div className="handover-step-number">2</div>
                <span>Check Characteristics</span>
              </div>
              <div className="handover-step-node active">
                <div className="handover-step-number">3</div>
                <span>Complete Checklist</span>
              </div>
              <div className={`handover-step-node ${checklistCompleted ? 'active' : ''}`}>
                <div className="handover-step-number">4</div>
                <span>Authorize Release</span>
              </div>
            </div>

            {/* Side-by-side Inspection */}
            <div className="inspection-grid">
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Stored Equipment Photo
                </div>
                <div className="inspection-photo-box">
                  <img src={activeHandoverOrder.photos?.[0]} alt="Handover inspect" />
                </div>
                <div style={{ marginTop: '0.75rem', background: '#FEF3C7', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400E' }}>
                    Distinctive Traits to Confirm on Physical Item:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#78350F', fontWeight: 600, marginTop: '0.2rem' }}>
                    {activeHandoverOrder.distinctiveMarks}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Handover Authorization Parameters
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Staff Member Conducting Handover:</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                    {(settings.staffMembers || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Identity Verification Method:</span>
                  </label>
                  <select
                    className="form-select"
                    value={verificationMethod}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                  >
                    <option value="Visual Characteristics & Photo Match">
                      Visual Characteristics &amp; Photo Match (Tagless)
                    </option>
                    <option value="Customer Phone & Repair Description Recall">
                      Customer Phone &amp; Repair Description Recall
                    </option>
                    <option value="Physical Receipt Presented">
                      Physical Receipt Presented
                    </option>
                    <option value="Companion Player Co-verification">
                      Companion Player Co-verification
                    </option>
                  </select>
                </div>

                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <div><strong>Customer Name:</strong> {activeHandoverOrder.customerName}</div>
                  <div><strong>Repair Fee Paid:</strong> ₹{activeHandoverOrder.estimatedCost}</div>
                  <div><strong>Repairs Performed:</strong> {activeHandoverOrder.reportedProblem}</div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <VerificationChecklist
              item={activeHandoverOrder}
              onComplete={handleVerificationChecklistDone}
              onHold={() => {
                alert('Item marked on hold. Handover paused.');
                setActiveHandoverOrder(null);
              }}
            />
          </div>
        </Modal>
      )}

      {/* Final Handover Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalConfirmHandover}
        title="Confirm Equipment Handover"
        message={`Authorize releasing ${activeHandoverOrder?.name} to customer ${activeHandoverOrder?.customerName}? This will mark Order ${activeHandoverOrder?.id} as Completed and prevent duplicate handovers.`}
        confirmText="Release Equipment & Finalize"
      />

      {/* Handover Receipt Details Modal */}
      {selectedHandover && (
        <Modal
          isOpen={!!selectedHandover}
          onClose={() => setSelectedHandover(null)}
          title={`Handover Certificate: ${selectedHandover.id}`}
          size="md"
          footer={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedHandover(null)}
            >
              Close
            </button>
          }
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <CheckCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Official Handover Confirmed</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Item verified and released under digital identity record.
            </p>
          </div>

          <table className="details-specs-table" style={{ margin: '1rem 0' }}>
            <tbody>
              <tr>
                <th>Handover Certificate ID</th>
                <td><span className="item-code">{selectedHandover.id}</span></td>
              </tr>
              <tr>
                <th>Repair Order Reference</th>
                <td><span className="item-code">{selectedHandover.orderId}</span></td>
              </tr>
              <tr>
                <th>Equipment Name</th>
                <td><strong>{selectedHandover.itemName}</strong></td>
              </tr>
              <tr>
                <th>Customer Recipient</th>
                <td>{selectedHandover.customerName} ({selectedHandover.customerPhone || 'Walk-in'})</td>
              </tr>
              <tr>
                <th>Verification Method</th>
                <td>{selectedHandover.verificationMethod}</td>
              </tr>
              <tr>
                <th>Authorized Staff</th>
                <td>{selectedHandover.staffMember}</td>
              </tr>
              <tr>
                <th>Handover Timestamp</th>
                <td>{selectedHandover.handoverDate}</td>
              </tr>
              <tr>
                <th>Audit Notes</th>
                <td>{selectedHandover.notes}</td>
              </tr>
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
};
