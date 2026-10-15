import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { formatDate } from '../utils/dateUtils';
import {
  ArrowLeft,
  Wrench,
  User,
  Phone,
  Calendar,
  Tag,
  ShieldCheck,
  Edit,
  Trash2,
  PackageCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

export const RepairOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    repairOrders,
    updateRepairStatus,
    deleteRepairOrder,
    activeStaff,
    settings
  } = useApp();

  const order = repairOrders.find((o) => o.id === id);

  const [newStatus, setNewStatus] = useState(order?.repairStatus || 'Received');
  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!order) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Repair Order Not Found</h3>
        <p style={{ margin: '1rem 0' }}>The order "{id}" could not be located in records.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/repairs')}
        >
          Back to Repair Orders
        </button>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    updateRepairStatus(order.id, newStatus, statusNote);
    setShowStatusModal(false);
    setStatusNote('');
  };

  const handleDelete = () => {
    deleteRepairOrder(order.id);
    navigate('/repairs');
  };

  const photos = order.photos && order.photos.length > 0 ? order.photos : [];
  const currentPhoto = photos[activePhotoIdx] || photos[0];

  return (
    <div className="order-details-page animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/repairs')}
        >
          <ArrowLeft size={16} />
          Back to Orders
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowStatusModal(true)}
          >
            <Edit size={14} />
            Update Status
          </button>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="item-code" style={{ fontSize: '0.9rem' }}>{order.id}</span>
              <StatusBadge status={order.repairStatus} />
            </div>
            <h2 style={{ fontSize: '1.35rem', marginTop: '0.4rem', color: 'var(--text-main)' }}>
              {order.name}
            </h2>
          </div>

          {order.repairStatus === 'Ready for Pickup' && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => navigate(`/handovers?orderId=${order.id}`)}
            >
              <PackageCheck size={18} />
              Verify & Complete Handover
            </button>
          )}

          {order.repairStatus === 'Completed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={18} />
              <span>Handover Completed</span>
            </div>
          )}
        </div>

        <div className="card-body">
          {/* Photos and Core Info Grid */}
          <div className="order-details-grid">
            {/* Left: Photos display */}
            <div>
              <div
                style={{
                  height: '240px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}
              >
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={order.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    No photos uploaded
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-sm)',
                        border: idx === activePhotoIdx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
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

              {/* Distinctive Marks Highlight */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#92400E', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <Tag size={14} />
                  <span>Physical Distinctive Marks (Tagless ID):</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350F', lineHeight: 1.5, fontWeight: 500 }}>
                  {order.distinctiveMarks || 'No distinctive marks recorded.'}
                </p>
              </div>
            </div>

            {/* Right: Specifications & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Customer Box */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Customer Details
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {order.customerName || 'Walk-in Customer'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Phone size={14} />
                    <span>{order.customerPhone || 'No Phone provided'}</span>
                  </div>
                </div>
              </div>

              {/* Specs Table */}
              <table className="details-specs-table">
                <tbody>
                  <tr>
                    <th>Item Category</th>
                    <td>{order.category}</td>
                  </tr>
                  <tr>
                    <th>Brand & Model</th>
                    <td>{order.brand} &bull; {order.model || 'Standard'}</td>
                  </tr>
                  <tr>
                    <th>Colour / Grip</th>
                    <td>{order.colour || '—'}</td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td>{order.serialNumber || 'Tagless / None'}</td>
                  </tr>
                  <tr>
                    <th>Date Received</th>
                    <td>{formatDate(order.dateReceived)}</td>
                  </tr>
                  <tr>
                    <th>Expected Completion</th>
                    <td>{formatDate(order.expectedDate)}</td>
                  </tr>
                  <tr>
                    <th>Estimated Repair Cost</th>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      {settings.currency || '₹'}{order.estimatedCost}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Reported Problem Box */}
              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  <Wrench size={16} color="var(--primary)" />
                  <span>Reported Defect & Service Requested</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {order.reportedProblem}
                </p>
              </div>

              {/* Workshop Notes / History */}
              {order.notes && (
                <div style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Technician Log / Status Updates
                  </div>
                  <pre style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {order.notes}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Repair Order Status"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStatusUpdate}
            >
              Save New Status
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">
            <span>Select Status:</span>
          </label>
          <select
            className="form-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Received">Received</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Status Note / Progress Update</span>
            <span className="hint">Added to technician log</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="e.g. Cane handle gluing complete, tested balance. Ready for customer."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Repair Order"
        message={`Are you sure you want to permanently delete order ${order.id}? This action cannot be undone.`}
        confirmText="Delete Order"
        isDanger={true}
      />
    </div>
  );
};
