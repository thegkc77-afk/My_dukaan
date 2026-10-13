import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ItemPhotoGallery } from '../components/items/ItemPhotoGallery';
import { generateOrderId, generateSalesId } from '../utils/idGenerator';
import {
  getTodayDateInputString,
  calculateWarrantyExpiry,
  getWarrantyStatus,
  formatDate
} from '../utils/dateUtils';
import {
  ShoppingBag,
  Wrench,
  Camera,
  Save,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Info,
  CheckCircle2
} from 'lucide-react';

export const CreateOrder = () => {
  const { settings, saveRepairOrder, saveSale } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'repair' or 'buy'
  const initialType = searchParams.get('type') === 'buy' ? 'buy' : 'repair';
  const [orderType, setOrderType] = useState(initialType);

  // Sync with searchParams
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'buy' || typeParam === 'repair') {
      setOrderType(typeParam);
    }
  }, [searchParams]);

  const handleTypeSelect = (type) => {
    setOrderType(type);
    setSearchParams({ type });
  };

  const todayStr = getTodayDateInputString();

  // 1. Repair Form State
  const [repairForm, setRepairForm] = useState({
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
    dateReceived: todayStr,
    expectedDate: '',
    estimatedCost: '',
    repairStatus: 'Received',
    notes: '',
    photos: []
  });

  // 2. Buy / Sale Form State
  const [buyForm, setBuyForm] = useState({
    id: generateSalesId(),
    productName: '',
    category: settings.categories?.[0] || 'Cricket Bat',
    brand: 'SG',
    model: '',
    serialNumber: '',
    customerName: '',
    customerPhone: '',
    purchaseDate: todayStr,
    purchasePrice: '',
    warrantyDuration: '6 Months',
    warrantyExpiryDate: calculateWarrantyExpiry(todayStr, '6 Months'),
    warrantyTerms: 'Covers manufacturer handle breakage and natural willow splits. Excludes misuse, moisture, or alterations.',
    notes: '',
    photos: []
  });

  const [errors, setErrors] = useState({});

  // Handlers for Repair Form
  const handleRepairChange = (e) => {
    const { name, value } = e.target;
    setRepairForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleResetRepair = () => {
    setRepairForm({
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

  const submitRepairOrder = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!repairForm.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!repairForm.reportedProblem.trim()) newErrors.reportedProblem = 'Please describe the reported repair problem';
    if (!repairForm.distinctiveMarks.trim()) newErrors.distinctiveMarks = 'Distinctive marks/scratches are essential for tagless identification';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const orderToSave = {
      ...repairForm,
      name: `${repairForm.brand || ''} ${repairForm.model || repairForm.category}`.trim(),
      estimatedCost: Number(repairForm.estimatedCost) || 0,
      verificationComplete: false
    };

    saveRepairOrder(orderToSave);
    navigate(`/repairs/${orderToSave.id}`);
  };

  // Handlers for Buy Form
  const handleBuyDurationOrDateChange = (date, duration) => {
    const expiry = calculateWarrantyExpiry(date, duration);
    setBuyForm((prev) => ({
      ...prev,
      purchaseDate: date,
      warrantyDuration: duration,
      warrantyExpiryDate: expiry
    }));
  };

  const handleBuyChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchaseDate') {
      handleBuyDurationOrDateChange(value, buyForm.warrantyDuration);
    } else if (name === 'warrantyDuration') {
      handleBuyDurationOrDateChange(buyForm.purchaseDate, value);
    } else {
      setBuyForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleResetBuy = () => {
    const today = getTodayDateInputString();
    setBuyForm({
      id: generateSalesId(),
      productName: '',
      category: settings.categories?.[0] || 'Cricket Bat',
      brand: 'SG',
      model: '',
      serialNumber: '',
      customerName: '',
      customerPhone: '',
      purchaseDate: today,
      purchasePrice: '',
      warrantyDuration: '6 Months',
      warrantyExpiryDate: calculateWarrantyExpiry(today, '6 Months'),
      warrantyTerms: 'Covers manufacturer handle breakage and natural willow splits.',
      notes: '',
      photos: []
    });
    setErrors({});
  };

  const submitBuyOrder = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!buyForm.productName.trim() && (!buyForm.brand.trim() || !buyForm.model.trim())) {
      newErrors.productName = 'Product name or brand/model is required';
    }
    if (!buyForm.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!buyForm.purchasePrice) newErrors.purchasePrice = 'Purchase price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fullProductName = buyForm.productName.trim() || `${buyForm.brand} ${buyForm.model}`.trim();
    const expiryStatus = getWarrantyStatus(buyForm.warrantyExpiryDate);

    const recordToSave = {
      ...buyForm,
      productName: fullProductName,
      purchasePrice: Number(buyForm.purchasePrice) || 0,
      warrantyStatus: expiryStatus.isActive ? 'Active' : 'Expired'
    };

    saveSale(recordToSave);
    navigate(`/warranty-lookup?q=${encodeURIComponent(recordToSave.id)}`);
  };

  return (
    <div className="new-order-page animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Top back & title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-header-title-box">
          <h1 className="page-title">New Order</h1>
          <p className="page-description">
            Choose transaction type: Register a new product sale with warranty, or record equipment for repair.
          </p>
        </div>
      </div>

      {/* Two Order Options Selection Cards */}
      <div className="order-type-selector">
        {/* Option 1: Buy New Product */}
        <div
          className={`order-type-card ${orderType === 'buy' ? 'active' : ''}`}
          onClick={() => handleTypeSelect('buy')}
        >
          <div className="order-type-icon">
            <ShoppingBag size={22} />
          </div>
          <div className="order-type-text">
            <div className="order-type-title">Buy New Products</div>
            <div className="order-type-desc">
              Customer purchasing brand new bat, racket, ball or gear. Records digital sale & auto-calculates warranty.
            </div>
          </div>
          {orderType === 'buy' && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary)' }}>
              <CheckCircle2 size={18} />
            </div>
          )}
        </div>

        {/* Option 2: Repair the Products */}
        <div
          className={`order-type-card ${orderType === 'repair' ? 'active' : ''}`}
          onClick={() => handleTypeSelect('repair')}
        >
          <div className="order-type-icon">
            <Wrench size={22} />
          </div>
          <div className="order-type-text">
            <div className="order-type-title">Repair the Products</div>
            <div className="order-type-desc">
              Customer leaving damaged bat, string, or ball for service. Captures tagless physical identity & distinctive marks.
            </div>
          </div>
          {orderType === 'repair' && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary)' }}>
              <CheckCircle2 size={18} />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FORM FOR BUY NEW PRODUCTS */}
      {/* ========================================================================= */}
      {orderType === 'buy' && (
        <form onSubmit={submitBuyOrder} className="card" style={{ padding: '1.75rem' }}>
          {/* Header */}
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
                Sales Record ID
              </span>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                {buyForm.id}
              </div>
            </div>
          </div>

          {/* Section 1: Product Specifications */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              1. New Product Details
            </h3>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Product Category</span>
                </label>
                <select
                  name="category"
                  className="form-select"
                  value={buyForm.category}
                  onChange={handleBuyChange}
                >
                  {(settings.categories || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
                  placeholder="e.g. SG, SS, Kookaburra, Yonex, Nivia"
                  value={buyForm.brand}
                  onChange={handleBuyChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Model / Edition</span>
                </label>
                <input
                  type="text"
                  name="model"
                  className="form-control"
                  placeholder="e.g. Sunny Tonny Classic, Astrox 88D"
                  value={buyForm.model}
                  onChange={handleBuyChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Full Product Display Name</span>
              </label>
              <input
                type="text"
                name="productName"
                className="form-control"
                placeholder="e.g. SG Sunny Tonny Classic English Willow Cricket Bat"
                value={buyForm.productName}
                onChange={handleBuyChange}
              />
              {errors.productName && <span className="form-error">{errors.productName}</span>}
            </div>

            {/* Product Photos */}
            <div className="form-group">
              <label className="form-label">
                <span>Product Photos (for digital verification)</span>
              </label>
              <ItemPhotoGallery
                photos={buyForm.photos}
                onChange={(photos) => setBuyForm((prev) => ({ ...prev, photos }))}
                maxPhotos={3}
              />
            </div>
          </div>

          {/* Section 2: Customer Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              2. Customer & Pricing
            </h3>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Customer Name <span className="required">*</span></span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  className="form-control"
                  placeholder="e.g. Rahul Dravid"
                  value={buyForm.customerName}
                  onChange={handleBuyChange}
                />
                {errors.customerName && <span className="form-error">{errors.customerName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Customer Phone</span>
                  <span className="hint">Optional</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  className="form-control"
                  placeholder="e.g. 9845012345"
                  value={buyForm.customerPhone}
                  onChange={handleBuyChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Selling Price ({settings.currency || '₹'}) <span className="required">*</span></span>
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  className="form-control"
                  placeholder="e.g. 14500"
                  value={buyForm.purchasePrice}
                  onChange={handleBuyChange}
                />
                {errors.purchasePrice && <span className="form-error">{errors.purchasePrice}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Warranty Settings */}
          <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>3. Warranty Duration & Expiry Calculation</span>
            </h3>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Purchase Date</span>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  className="form-control"
                  value={buyForm.purchaseDate}
                  onChange={handleBuyChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Warranty Duration</span>
                </label>
                <select
                  name="warrantyDuration"
                  className="form-select"
                  value={buyForm.warrantyDuration}
                  onChange={handleBuyChange}
                >
                  {(settings.warrantyDurations || []).map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Warranty Expiry Date</span>
                  <span className="hint">Auto-calculated</span>
                </label>
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={formatDate(buyForm.warrantyExpiryDate)}
                  style={{ backgroundColor: '#F1F5F9', fontWeight: 700, color: 'var(--primary)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                <span>Warranty Terms & Coverage Notes</span>
              </label>
              <textarea
                name="warrantyTerms"
                className="form-textarea"
                value={buyForm.warrantyTerms}
                onChange={handleBuyChange}
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetBuy}
            >
              <RotateCcw size={16} />
              Reset Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} />
              Save Sale & Register Warranty
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. FORM FOR REPAIR PRODUCTS */}
      {/* ========================================================================= */}
      {orderType === 'repair' && (
        <form onSubmit={submitRepairOrder} className="card" style={{ padding: '1.75rem' }}>
          {/* Header */}
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
                Repair Order ID
              </span>
              <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                {repairForm.id}
              </div>
            </div>
          </div>

          {/* Info callout for tagless identity */}
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
              <strong>Tagless Identification System:</strong> Physical tags, receipts, and phone numbers are not mandatory. Distinctive scratches, marks, and photos will enable identifying this item when the customer returns.
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
                  value={repairForm.customerName}
                  onChange={handleRepairChange}
                />
                {errors.customerName && <span className="form-error">{errors.customerName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Customer Phone Number</span>
                  <span className="hint">Optional (No PIN or OTP needed)</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  className="form-control"
                  placeholder="e.g. 9845012345"
                  value={repairForm.customerPhone}
                  onChange={handleRepairChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Identity */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
              2. Equipment Identity & Specifications
            </h3>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Item Category</span>
                </label>
                <select
                  name="category"
                  className="form-select"
                  value={repairForm.category}
                  onChange={handleRepairChange}
                >
                  {(settings.categories || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
                  placeholder="e.g. SG, SS, MRF, Yonex, Nivia, Asics"
                  value={repairForm.brand}
                  onChange={handleRepairChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Model / Edition</span>
                </label>
                <input
                  type="text"
                  name="model"
                  className="form-control"
                  placeholder="e.g. Sunny Tonny, Nanoray, Storm"
                  value={repairForm.model}
                  onChange={handleRepairChange}
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
                placeholder="e.g. Natural Willow, Black Chevron grip, Yellow sole"
                value={repairForm.colour}
                onChange={handleRepairChange}
              />
            </div>
          </div>

          {/* Section 3: Distinctive Marks & Photos (CRITICAL CORE) */}
          <div style={{ marginBottom: '1.75rem', backgroundColor: '#FEF3C7', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="#B45309" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400E', margin: 0 }}>
                3. Distinctive Marks & Physical Identity (Tagless Recovery)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#78350F', marginBottom: '1rem' }}>
              Describe visible scratches, tape wrapping, spine notches, thread whipped on handle, or initials.
            </p>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#92400E' }}>
                <span>Distinctive Marks, Scratches or Modifications <span className="required">*</span></span>
              </label>
              <textarea
                name="distinctiveMarks"
                className="form-textarea"
                placeholder="e.g. Silver grip tape near shoulder, deep notch on back spine 4 inches from toe, red thread on handle, stamped 'RD' on face"
                value={repairForm.distinctiveMarks}
                onChange={handleRepairChange}
                style={{ minHeight: '80px', borderColor: errors.distinctiveMarks ? 'var(--error)' : '#FCD34D' }}
              />
              {errors.distinctiveMarks && <span className="form-error">{errors.distinctiveMarks}</span>}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#92400E' }}>
                <span>Item Photos (2–3 recommended)</span>
                <span className="hint" style={{ color: '#B45309' }}>Stored for tagless visual matching</span>
              </label>
              <ItemPhotoGallery
                photos={repairForm.photos}
                onChange={(photos) => setRepairForm((prev) => ({ ...prev, photos }))}
                maxPhotos={4}
              />
            </div>
          </div>

          {/* Section 4: Problem, Dates & Cost */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
              4. Repair Problem & Cost
            </h3>

            <div className="form-group">
              <label className="form-label">
                <span>Reported Problem / Service Requested <span className="required">*</span></span>
              </label>
              <textarea
                name="reportedProblem"
                className="form-textarea"
                placeholder="e.g. Loose cane handle rattling, face pressing, toe guard re-binding"
                value={repairForm.reportedProblem}
                onChange={handleRepairChange}
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
                  value={repairForm.dateReceived}
                  onChange={handleRepairChange}
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
                  value={repairForm.expectedDate}
                  onChange={handleRepairChange}
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
                  value={repairForm.estimatedCost}
                  onChange={handleRepairChange}
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
                placeholder="e.g. High-tensile nylon whipping thread required"
                value={repairForm.notes}
                onChange={handleRepairChange}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetRepair}
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
      )}
    </div>
  );
};
