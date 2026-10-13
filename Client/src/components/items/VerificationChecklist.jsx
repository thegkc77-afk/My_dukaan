import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const VerificationChecklist = ({
  item,
  onComplete,
  onHold,
  initialChecked = {},
  readOnly = false
}) => {
  const [checklist, setChecklist] = useState({
    photosMatched: initialChecked.photosMatched || false,
    characteristicsMatched: initialChecked.characteristicsMatched || false,
    problemReviewed: initialChecked.problemReviewed || false,
    additionalVerified: initialChecked.additionalVerified || false
  });

  const [notes, setNotes] = useState('');

  const handleToggle = (key) => {
    if (readOnly) return;
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allRequiredChecked =
    checklist.photosMatched &&
    checklist.characteristicsMatched &&
    checklist.problemReviewed;

  const totalChecked = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="checklist-container">
      <div className="checklist-title">
        <ShieldCheck size={20} color="var(--primary)" />
        <span>Tagless Identity Verification Protocol</span>
        <span
          className={`badge ${allRequiredChecked ? 'badge-success' : 'badge-warning'}`}
          style={{ marginLeft: 'auto' }}
        >
          {totalChecked} of 4 criteria verified
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Crucial: To prevent releasing the wrong cricket bat or equipment to the wrong walk-in customer, verify each physical trait thoroughly before authorizing pickup.
      </p>

      <div className="checklist-items">
        {/* Step 1 */}
        <label className={`checklist-item ${checklist.photosMatched ? 'checked' : ''}`}>
          <input
            type="checkbox"
            className="checklist-checkbox"
            checked={checklist.photosMatched}
            onChange={() => handleToggle('photosMatched')}
            disabled={readOnly}
          />
          <div>
            <div className="checklist-label">
              1. Physical item compared with stored photos
            </div>
            <div className="checklist-subtext">
              Inspect handle grip color, willow profile/concaving, toe shape, and factory stickers against the stored photo gallery.
            </div>
          </div>
        </label>

        {/* Step 2 */}
        <label className={`checklist-item ${checklist.characteristicsMatched ? 'checked' : ''}`}>
          <input
            type="checkbox"
            className="checklist-checkbox"
            checked={checklist.characteristicsMatched}
            onChange={() => handleToggle('characteristicsMatched')}
            disabled={readOnly}
          />
          <div>
            <div className="checklist-label">
              2. Distinctive characteristics and marks checked
            </div>
            <div className="checklist-subtext">
              Examine unique wear spots: {item?.distinctiveMarks || 'Specific tape whipping, spine notches, or grain anomalies.'}
            </div>
          </div>
        </label>

        {/* Step 3 */}
        <label className={`checklist-item ${checklist.problemReviewed ? 'checked' : ''}`}>
          <input
            type="checkbox"
            className="checklist-checkbox"
            checked={checklist.problemReviewed}
            onChange={() => handleToggle('problemReviewed')}
            disabled={readOnly}
          />
          <div>
            <div className="checklist-label">
              3. Repair problem or history reviewed with customer
            </div>
            <div className="checklist-subtext">
              Customer verbally recalled: "{item?.reportedProblem || 'Repair details'}" without being prompted.
            </div>
          </div>
        </label>

        {/* Step 4 */}
        <label className={`checklist-item ${checklist.additionalVerified ? 'checked' : ''}`}>
          <input
            type="checkbox"
            className="checklist-checkbox"
            checked={checklist.additionalVerified}
            onChange={() => handleToggle('additionalVerified')}
            disabled={readOnly}
          />
          <div>
            <div className="checklist-label">
              4. Additional verification completed (High value / uncertain match)
            </div>
            <div className="checklist-subtext">
              Approximate drop-off month, estimated repair quote (₹{item?.estimatedCost}), or companion player verification.
            </div>
          </div>
        </label>
      </div>

      {/* Warning if incomplete */}
      {!allRequiredChecked ? (
        <div className="warning-callout" style={{ marginTop: '1rem' }}>
          <AlertTriangle size={18} className="warning-callout-icon" />
          <div className="warning-callout-content">
            <div className="warning-callout-title">Evidence Insufficient for Release</div>
            <div className="warning-callout-text">
              At least the first 3 physical identity verification criteria must be confirmed before an item can be marked ready for handover. Do not hand over item solely on general brand match.
            </div>
          </div>
        </div>
      ) : (
        <div className="success-callout" style={{ marginTop: '1rem' }}>
          <CheckCircle size={18} className="success-callout-icon" />
          <div className="warning-callout-content">
            <div className="success-callout-title">Positive Physical Identity Verified</div>
            <div className="success-callout-text">
              Visual photos, distinctive marks, and defect history confirm this item belongs to the claiming customer.
            </div>
          </div>
        </div>
      )}

      {/* Verification Notes / Observations */}
      {!readOnly && (
        <div style={{ marginTop: '0.85rem' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>
            <span>Verification Notes & Observations</span>
            <span className="hint">Recorded in audit log</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="e.g. Customer identified the silver shoulder tape and initial RD stamped on face. Confirmed repair fee ₹1250."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-success"
            disabled={!allRequiredChecked}
            onClick={() => onComplete && onComplete({ checklist, notes })}
          >
            <CheckCircle size={16} />
            Mark Verification Complete & Proceed to Handover
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onHold && onHold({ checklist, notes })}
          >
            <Clock size={16} />
            Hold for Additional Verification
          </button>
        </div>
      )}
    </div>
  );
};
