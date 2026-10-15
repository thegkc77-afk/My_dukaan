import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { compressImageFile } from '../../utils/storage';
import { SVG_PHOTOS } from '../../data/mockData';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { Modal } from '../common/Modal';

export const ItemPhotoGallery = ({
  photos = [],
  onChange,
  maxPhotos = 4,
  readOnly = false
}) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSampleSelector, setShowSampleSelector] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFileList = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const newPhotos = [...photos];
      for (const file of fileList) {
        if (newPhotos.length >= maxPhotos) break;
        if (!file.type.startsWith('image/')) {
          setErrorMsg('Only image files (PNG, JPG, WebP) are allowed');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setErrorMsg('File exceeds 10MB limit');
          continue;
        }
        const compressedDataUrl = await compressImageFile(file);
        newPhotos.push(compressedDataUrl);
      }
      onChange(newPhotos);
    } catch (err) {
      console.error('Image upload failed', err);
      setErrorMsg('Failed to process image: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFileList(files);
  };

  const handleCapturePhoto = (dataUrl) => {
    if (photos.length < maxPhotos) {
      onChange([...photos, dataUrl]);
    }
  };

  const handleRemovePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddSample = (sampleUrl) => {
    if (photos.length < maxPhotos) {
      onChange([...photos, sampleUrl]);
    }
    setShowSampleSelector(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="photo-uploader-container">
      {/* Photo Previews & Add Photo Dropzone */}
      <div className="photo-previews-grid">
        {photos.map((url, idx) => (
          <div key={idx} className="photo-preview-item">
            <img src={url} alt={`Item preview ${idx + 1}`} />
            <span className="photo-order-badge">#{idx + 1}</span>
            {!readOnly && (
              <button
                type="button"
                className="photo-preview-remove"
                onClick={() => handleRemovePhoto(idx)}
                title="Remove photo"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Clean, compact dropzone to add photos */}
        {!readOnly && photos.length < maxPhotos && (
          <div
            className={`photo-upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
            onClick={() => setShowChoiceModal(true)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            title="Click to add product photos"
          >
            <Camera size={26} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {isProcessing ? 'Processing...' : 'Add Product Photos'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              File or Camera
            </span>
          </div>
        )}
      </div>

      {/* Hidden file input for file uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {errorMsg && <div className="form-error">{errorMsg}</div>}

      {/* Bottom helper bar */}
      {!readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {photos.length} of {maxPhotos} photos recorded.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowSampleSelector(!showSampleSelector)}
              title="Select sample item photo for testing"
            >
              <ImageIcon size={14} />
              {showSampleSelector ? 'Hide Samples' : 'Choose Sample Photo'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Sample Selector for convenient testing */}
      {showSampleSelector && !readOnly && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginTop: '0.5rem'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Select a sample item photo to simulate shop camera:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.sgBat)}
            >
              SG Bat
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.ssBat)}
            >
              SS Bat
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.mrfBat)}
            >
              MRF Bat
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.kookaburraBat)}
            >
              Kahuna Bat
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.yonexRacket)}
            >
              Racket
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.footballNivia)}
            >
              Football
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAddSample(SVG_PHOTOS.asicsShoes)}
            >
              Shoes
            </button>
          </div>
        </div>
      )}

      {/* Choice Modal: 1. Upload through File vs 2. Upload through Camera */}
      <Modal
        isOpen={showChoiceModal}
        onClose={() => setShowChoiceModal(false)}
        title="Add Product Photos"
        size="md"
      >
        <div className="add-photo-choice-container">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Select how you would like to add photos for this product:
          </p>

          <div className="add-photo-choice-grid">
            {/* Option 1: File */}
            <div
              className="add-photo-choice-card file-choice"
              onClick={() => {
                setShowChoiceModal(false);
                fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="choice-card-icon file-icon">
                <Upload size={26} />
              </div>
              <div className="choice-card-content">
                <div className="choice-card-badge">Option 1</div>
                <h4 className="choice-card-title">1. Upload through File</h4>
                <p className="choice-card-desc">
                  Browse and select photo(s) from your computer or phone
                </p>
              </div>
              <span className="choice-card-btn">Browse Files</span>
            </div>

            {/* Option 2: Camera */}
            <div
              className="add-photo-choice-card camera-choice"
              onClick={() => {
                setShowChoiceModal(false);
                setIsCameraOpen(true);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="choice-card-icon camera-icon">
                <Camera size={26} />
              </div>
              <div className="choice-card-content">
                <div className="choice-card-badge">Option 2</div>
                <h4 className="choice-card-title">2. Upload through Camera</h4>
                <p className="choice-card-desc">
                  Take live photo(s) using your connected camera or webcam
                </p>
              </div>
              <span className="choice-card-btn camera-btn">Open Camera</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Live Camera Modal */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
        onUploadFiles={processFileList}
        photos={photos}
        maxPhotos={maxPhotos}
        title="Live Item Camera"
      />
    </div>
  );
};
