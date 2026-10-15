import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ItemPhotoGallery } from '../components/items/ItemPhotoGallery';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchBar } from '../components/common/SearchBar';
import { generateSalesId } from '../utils/idGenerator';
import {
  formatDate,
  calculateWarrantyExpiry,
  getWarrantyStatus,
  getTodayDateInputString
} from '../utils/dateUtils';
import {
  BadgePercent,
  PlusCircle,
  ShieldCheck,
  Calendar,
  Save,
  RotateCcw,
  Search,
  FileCheck2,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const SalesWarranty = () => {
  const { salesRecords, saveSale, settings } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNewMode = searchParams.get('mode') === 'new';
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const initialPurchaseDate = getTodayDateInputString();
  const [formData, setFormData] = useState({
    id: generateSalesId(),
    productName: '',
    category: settings.categories?.[0] || 'Cricket Bat',
    brand: 'SG',
    model: '',
    serialNumber: '',
    customerName: '',
    customerPhone: '',
    purchaseDate: initialPurchaseDate,
    purchasePrice: '',
    warrantyDuration: '6 Months',
    warrantyExpiryDate: calculateWarrantyExpiry(initialPurchaseDate, '6 Months'),
    warrantyTerms: 'Covers manufacturer handle breakage and natural willow splits. Excludes misuse, moisture, or alterations.',
    notes: '',
    photos: []
  });

  const [errors, setErrors] = useState({});

  const handleDurationOrDateChange = (date, duration) => {
    const expiry = calculateWarrantyExpiry(date, duration);
    setFormData((prev) => ({
      ...prev,
      purchaseDate: date,
      warrantyDuration: duration,
      warrantyExpiryDate: expiry
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'purchaseDate') {
      handleDurationOrDateChange(value, formData.warrantyDuration);
    } else if (name === 'warrantyDuration') {
      handleDurationOrDateChange(formData.purchaseDate, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productName.trim() && (!formData.brand.trim() || !formData.model.trim())) {
      newErrors.productName = 'Product name or brand/model is required';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Purchase price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fullProductName = formData.productName.trim() || `${formData.brand} ${formData.model}`.trim();
    const expiryStatus = getWarrantyStatus(formData.warrantyExpiryDate);

    const recordToSave = {
      ...formData,
      productName: fullProductName,
      purchasePrice: Number(formData.purchasePrice) || 0,
      warrantyStatus: expiryStatus.isActive ? 'Active' : 'Expired'
    };

    saveSale(recordToSave);
    setSearchParams({});
  };

  const handleReset = () => {
    const today = getTodayDateInputString();
    setFormData({
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

  // Filter sales
  const filteredSales = salesRecords.filter((sale) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sale.id.toLowerCase().includes(q) ||
      sale.productName.toLowerCase().includes(q) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
      (sale.serialNumber && sale.serialNumber.toLowerCase().includes(q)) ||
      (sale.brand && sale.brand.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sales-warranty-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Sales & Warranty Registration</h1>
          <p className="page-description">
            Register shop sales, calculate warranty durations, and maintain verifiable proof for customers who lose their bills.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate('/warranty-lookup')}
          >
            <Search size={16} />
            Warranty Lookup (Lost Bill)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/orders/new?type=buy')}
          >
            <PlusCircle size={16} />
            Register New Sale
          </button>
        </div>
      </div>

      {/* Registration Form Mode */}
      {isNewMode ? (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem' }}>
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
                {formData.id}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              1. Product Specifications
            </h3>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">
                  <span>Product Category</span>
                </label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
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
                  placeholder="e.g. SG, SS, Kookaburra, Yonex"
                  value={formData.brand}
                  onChange={handleChange}
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
                  placeholder="e.g. Sunny Tonny, Kahuna Pro"
                  value={formData.model}
                  onChange={handleChange}
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
                value={formData.productName}
                onChange={handleChange}
              />
              {errors.productName && <span className="form-error">{errors.productName}</span>}
            </div>

            {/* Product Photos */}
            <div className="form-group">
              <label className="form-label">
                <span>Product Photos (for visual identification)</span>
              </label>
              <ItemPhotoGallery
                photos={formData.photos}
                onChange={(photos) => setFormData((prev) => ({ ...prev, photos }))}
                maxPhotos={3}
              />
            </div>
          </div>

          {/* Customer & Purchase Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              2. Customer & Purchase Details
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
                  value={formData.customerName}
                  onChange={handleChange}
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
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Purchase Price ({settings.currency || '₹'}) <span className="required">*</span></span>
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  className="form-control"
                  placeholder="e.g. 14500"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
                {errors.purchasePrice && <span className="form-error">{errors.purchasePrice}</span>}
              </div>
            </div>
          </div>

          {/* Warranty Configuration (Auto-calculation) */}
          <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>3. Warranty Duration & Automatic Expiry Calculation</span>
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
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Warranty Duration</span>
                </label>
                <select
                  name="warrantyDuration"
                  className="form-select"
                  value={formData.warrantyDuration}
                  onChange={handleChange}
                >
                  {(settings.warrantyDurations || []).map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Calculated Expiry Date</span>
                  <span className="hint">Auto-calculated</span>
                </label>
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={formatDate(formData.warrantyExpiryDate)}
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
                value={formData.warrantyTerms}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchParams({})}
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
              Save Sales & Warranty Record
            </button>
          </div>
        </form>
      ) : (
        /* Registered Sales Records List */
        <div className="card">
          <div className="card-header">
            <div className="search-box" style={{ maxWidth: '400px' }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search registered sales by customer, item or ID..."
                onClear={() => setSearchQuery('')}
              />
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total: {filteredSales.length} registered products
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sales ID</th>
                  <th>Product Photo</th>
                  <th>Product Name</th>
                  <th>Customer</th>
                  <th>Purchase Date</th>
                  <th>Warranty Duration</th>
                  <th>Expiry Date</th>
                  <th>Warranty Status</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const statusInfo = getWarrantyStatus(sale.warrantyExpiryDate);
                  return (
                    <tr key={sale.id}>
                      <td>
                        <span className="item-code">{sale.id}</span>
                      </td>
                      <td>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <img
                            src={sale.photos?.[0]}
                            alt={sale.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sale.productName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {sale.category} &bull; {sale.brand}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{sale.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sale.customerPhone || 'No phone'}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {formatDate(sale.purchaseDate)}
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {sale.warrantyDuration}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {formatDate(sale.warrantyExpiryDate)}
                      </td>
                      <td>
                        <StatusBadge status={statusInfo.isActive ? 'Active' : 'Expired'} />
                        <div style={{ fontSize: '0.68rem', color: statusInfo.isActive ? 'var(--success)' : 'var(--error)', marginTop: '2px' }}>
                          {statusInfo.text}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        ₹{sale.purchasePrice}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/warranty-lookup?q=${encodeURIComponent(sale.id)}`)}
                          title="Open warranty verification details"
                        >
                          <ShieldCheck size={14} />
                          Check Warranty
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
