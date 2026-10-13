import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import {
  Settings as SettingsIcon,
  Store,
  Users,
  Shield,
  Layers,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings, resetData, addToast } = useApp();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ ...settings });
  const [newStaff, setNewStaff] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleFieldChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddStaff = () => {
    if (!newStaff.trim()) return;
    if (form.staffMembers?.includes(newStaff.trim())) {
      addToast('Staff member already exists', 'warning');
      return;
    }
    setForm((prev) => ({
      ...prev,
      staffMembers: [...(prev.staffMembers || []), newStaff.trim()]
    }));
    setNewStaff('');
  };

  const handleRemoveStaff = (index) => {
    setForm((prev) => ({
      ...prev,
      staffMembers: prev.staffMembers.filter((_, i) => i !== index)
    }));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (form.categories?.includes(newCategory.trim())) {
      addToast('Category already exists', 'warning');
      return;
    }
    setForm((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), newCategory.trim()]
    }));
    setNewCategory('');
  };

  const handleRemoveCategory = (index) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleExportBackup = () => {
    const dataStr = exportBackupJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repair_shop_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('JSON backup exported successfully', 'success');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = importBackupJSON(event.target.result);
      if (ok) {
        addToast('Backup data imported successfully!', 'success');
      } else {
        addToast('Invalid backup file JSON', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="settings-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Shop Settings</h1>
          <p className="page-description">
            Tailor shop parameters, staff list, product categories, and manage data backups.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* Shop Details */}
        <div className="card settings-section-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Store size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Business Identity</h3>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Shop / Business Name</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={form.shopName || ''}
                onChange={(e) => handleFieldChange('shopName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Tagline / Subtitle</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={form.tagline || ''}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                <span>Owner / Manager Name</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={form.ownerName || ''}
                onChange={(e) => handleFieldChange('ownerName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Shop Phone</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={form.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Currency Display</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={form.currency || '₹'}
                onChange={(e) => handleFieldChange('currency', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <span>Shop Address & City</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={form.address || ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
          </div>
        </div>

        {/* Staff Members List */}
        <div className="card settings-section-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Staff & Technicians</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Staff members who can accept repairs, conduct tagless verifications, and authorize handovers.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Anil Kumble (Master Technician)"
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddStaff}
            >
              <Plus size={16} />
              Add Staff
            </button>
          </div>

          <div className="tag-editor-box">
            {(form.staffMembers || []).map((staff, i) => (
              <span key={i} className="tag-item">
                <span>{staff}</span>
                {form.staffMembers.length > 1 && (
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveStaff(i)}
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Item Categories */}
        <div className="card settings-section-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Item Categories</h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Table Tennis Bat"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddCategory}
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          <div className="tag-editor-box">
            {(form.categories || []).map((cat, i) => (
              <span key={i} className="tag-item">
                <span>{cat}</span>
                {form.categories.length > 1 && (
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveCategory(i)}
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Save Settings Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>

      {/* Data Management & Backup (Local Persistence) */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#F8FAFC' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          Local Data Management & Backup
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          All data is saved in your browser's persistent storage. Export backups to prevent loss across devices or reset to sample data anytime.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportBackup}
          >
            <Download size={16} />
            Export JSON Backup
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <Upload size={16} />
            Import Backup File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />

          <button
            type="button"
            className="btn btn-danger-outline"
            style={{ marginLeft: 'auto' }}
            onClick={() => setShowResetModal(true)}
          >
            <RotateCcw size={16} />
            Reset to Sample Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => {
          resetData();
          setShowResetModal(false);
          setForm({ ...settings });
        }}
        title="Reset Application Data"
        message="This will reset all repair orders, sales records, warranty claims, and handovers back to the realistic demonstration seed data. Any customized changes will be overwritten."
        confirmText="Reset All Data"
        isDanger={true}
      />
    </div>
  );
};
