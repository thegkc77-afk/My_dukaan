import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, User, Wrench, ShieldCheck, Tag } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const ItemCard = ({ item, onViewDetails, onVerify, highlightQuery = '' }) => {
  const photo = (item.photos && item.photos[0]) || '';
  const isRepair = !!item.repairStatus;

  return (
    <div className="item-card animate-fade-in">
      <div className="item-card-image-box">
        {photo ? (
          <img src={photo} alt={item.name} className="item-card-img" />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)',
              fontSize: '0.8rem'
            }}
          >
            No photo uploaded
          </div>
        )}
        <div className="item-card-badges">
          <span className="item-code">{item.id}</span>
          <StatusBadge status={item.repairStatus || item.warrantyStatus} />
        </div>
      </div>

      <div className="item-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {item.category}
          </span>
          {item.brand && (
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {item.brand}
            </span>
          )}
        </div>

        <h4 className="item-card-title">{item.name || item.productName}</h4>

        {/* Customer & Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={14} color="var(--text-light)" />
            <span>{item.customerName || 'Customer: Walk-in (No Name)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="var(--text-light)" />
            <span>
              {isRepair ? `Received: ${formatDate(item.dateReceived)}` : `Sold: ${formatDate(item.purchaseDate)}`}
            </span>
          </div>
        </div>

        {/* Reported Problem / Defect */}
        {item.reportedProblem && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: '#F8FAFC', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
              <Wrench size={13} />
              <span>Reported Problem:</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)' }}>{item.reportedProblem}</p>
          </div>
        )}

        {/* Distinctive marks tags (crucial for tagless item identity) */}
        {item.distinctiveMarks && (
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={12} />
              <span>Distinctive Marks & Characteristics:</span>
            </div>
            <div className="characteristics-tags">
              {item.distinctiveMarks.split(',').map((mark, i) => (
                <span key={i} className="characteristic-tag">
                  {mark.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Reasons if present */}
        {item.matchReasons && item.matchReasons.length > 0 && (
          <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {item.matchReasons.map((r, i) => (
              <span key={i} className="characteristic-tag mark" style={{ fontSize: '0.7rem' }}>
                ✓ {r}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="item-card-footer">
        {item.estimatedCost !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Repair Estimate</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{item.estimatedCost}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
          {onVerify && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => onVerify(item)}
            >
              <ShieldCheck size={14} />
              Verify Identity
            </button>
          )}

          {onViewDetails && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(item)}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
