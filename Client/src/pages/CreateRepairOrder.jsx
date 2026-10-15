import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ItemPhotoGallery } from '../components/items/ItemPhotoGallery';
import { generateOrderId } from '../utils/idGenerator';
import { getTodayDateInputString } from '../utils/dateUtils';
import {
  Wrench,
  Camera,
  Save,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

export const CreateRepairOrder = () => {
  const { settings, saveRepairOrder } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: generateOrderId(),
    customerName: '',
    customerPhone: '',
    category: settings.categories?.[0] || 'Cricket Bat',
    brand: 'SG',
    model: '',
    colour: '',
    serialNumber: '',
    reportedProblem: '',
    distinctiveMarks: '',
    dateReceived: getTodayDateInputString(),
    expectedDate: '',
    estimatedCost: '',
    repairStatus: 'Received',
    notes: '',
    photos: []
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Item category is required';
    }
    if (!formData.reportedProblem.trim()) {
      newErrors.reportedProblem = 'Please describe the reported repair problem';
    }
    if (!formData.distinctiveMarks.trim()) {
      newErrors.distinctiveMarks = 'Distinctive marks/scratches are essential for tagless item recovery';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleReset = () => {
    setFormData({
      id: generateOrderId(),
      customerName: '',
      customerPhone: '',
      category: settings.categories?.[0] || 'Cricket Bat',
      brand: 'SG',
      model: '',
      colour: '',
      serialNumber: '',
      reportedProblem: '',
      distinctiveMarks: '',
      dateReceived: getTodayDateInputString(),
      expectedDate: '',
      estimatedCost: '',
      repairStatus: 'Received',
      notes: '',
      photos: []
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const orderToSave = {
      ...formData,
      name: `${formData.brand || ''} ${formData.model || formData.category}`.trim(),
      estimatedCost: Number(formData.estimatedCost) || 0,
      verificationComplete: false
    };

    saveRepairOrder(orderToSave);
    navigate(`/repairs/${orderToSave.id}`);
  };

  return (
    <div className="create-order-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top back & title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/repairs')}
        >
          <ArrowLeft size={16} />
          Back to Orders
        </button>
      </div>

      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Create Repair Order</h1>
          <p className="page-description">
            Capture digital identity without physical tags or customer PINs.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div
        style={{
          background: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}
      >
        <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.5 }}>
          <strong>Tagless Item Registration:</strong> In case the customer returns without a physical receipt or phone, the distinctive marks, photos, and problem notes recorded here will be used by the shopkeeper to identify this exact item.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.75rem' }}>
        {/* Order ID & Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Auto-Generated Order ID
            </span>
            <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
              {formData.id}
            </div>
          </div>
        </div>

        {/* Section 1: Customer Info */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            1. Customer Information
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Customer Name <span className="required">*</span></span>
              </label>
              <input
                type="text"
                name="customerName"
                className="form-control"
                placeholder="e.g. Rahul Dravid or Walk-in Player"
                value={formData.customerName}
                onChange={handleChange}
              />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Phone Number</span>
                <span className="hint">Optional (No SMS/OTP needed)</span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                className="form-control"
                placeholder="e.g. 9845012345"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Equipment Identity */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            2. Item Identity & Specifications
          </h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                <span>Item Category <span className="required">*</span></span>
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {(settings.categories || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Brand</span>
              </label>
              <input
                type="text"
                name="brand"
                className="form-control"
                placeholder="e.g. SG, SS, MRF, Yonex, Nivia"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Model Name / Edition</span>
              </label>
              <input
                type="text"
                name="model"
                className="form-control"
                placeholder="e.g. Sunny Tonny, Astrox 88, Storm"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

            <div className="form-group">
              <label className="form-label">
                <span>Colour & Gripping / Stitching</span>
              </label>
              <input
                type="text"
                name="colour"
                className="form-control"
                placeholder="e.g. Natural Willow, Chevron Black Grip, White lace"
                value={formData.colour}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Distinctive Marks & Photos (CRITICAL CORE) */}
        <div style={{ marginBottom: '1.75rem', backgroundColor: '#FEF3C7', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={18} color="#B45309" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400E', margin: 0 }}>
              3. Distinctive Item Characteristics & Physical Identity
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#78350F', marginBottom: '1rem' }}>
            Describe visible scratches, handle thread colors, toe notches, tape whipping, or player signatures so the item can be retrieved if the customer loses the receipt.
          </p>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: '#92400E' }}>
              <span>Distinctive Marks, Scratches or Modifications <span className="required">*</span></span>
            </label>
            <textarea
              name="distinctiveMarks"
              className="form-textarea"
              placeholder="e.g. Silver grip tape near shoulder, deep notch on back spine 4 inches from toe, red whipping on lower handle, stamped initials 'RD' on wooden face"
              value={formData.distinctiveMarks}
              onChange={handleChange}
              style={{ minHeight: '80px', borderColor: errors.distinctiveMarks ? 'var(--error)' : '#FCD34D' }}
            />
            {errors.distinctiveMarks && <span className="form-error">{errors.distinctiveMarks}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ color: '#92400E' }}>
              <span>Item Photos (2–3 recommended)</span>
              <span className="hint" style={{ color: '#B45309' }}>Used for tagless visual matching</span>
            </label>
            <ItemPhotoGallery
              photos={formData.photos}
              onChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
              maxPhotos={4}
            />
          </div>
        </div>

        {/* Section 4: Problem, Dates & Cost */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            4. Repair Problem & Logistics
          </h3>

          <div className="form-group">
            <label className="form-label">
              <span>Reported Problem / Service Requested <span className="required">*</span></span>
            </label>
            <textarea
              name="reportedProblem"
              className="form-textarea"
              placeholder="e.g. Loose cane handle rattling, face pressing, toe guard re-binding"
              value={formData.reportedProblem}
              onChange={handleChange}
            />
            {errors.reportedProblem && <span className="form-error">{errors.reportedProblem}</span>}
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                <span>Date Received</span>
              </label>
              <input
                type="date"
                name="dateReceived"
                className="form-control"
                value={formData.dateReceived}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Expected Completion Date</span>
              </label>
              <input
                type="date"
                name="expectedDate"
                className="form-control"
                value={formData.expectedDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Estimated Cost ({settings.currency || '₹'})</span>
              </label>
              <input
                type="number"
                name="estimatedCost"
                className="form-control"
                placeholder="e.g. 1250"
                value={formData.estimatedCost}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Internal Workshop Notes</span>
              <span className="hint">Optional</span>
            </label>
            <input
              type="text"
              name="notes"
              className="form-control"
              placeholder="e.g. Handle epoxy cured with twin dowels; customer wants soft grip"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/repairs')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset Form
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <Save size={16} />
            Save Repair Order
          </button>
        </div>
      </form>
    </div>
  );
};
