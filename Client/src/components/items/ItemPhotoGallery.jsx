import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { compressImageFile } from '../../utils/storage';
import { SVG_PHOTOS } from '../../data/mockData';
import { LiveCameraModal } from '../common/LiveCameraModal';

export const ItemPhotoGallery = ({
  photos = [],
  onChange,
  maxPhotos = 4,
  readOnly = false
}) => {
  const fileInputRef = useRef(null);
  const deviceCameraInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSampleSelector, setShowSampleSelector] = useState(false);
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
      if (deviceCameraInputRef.current) deviceCameraInputRef.current.value = '';
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

  const isMaxReached = photos.length >= maxPhotos;

  return (
    <div className="photo-uploader-container">
      {/* 1. When NO photos added yet: Show Two Prominent Option Cards */}
      {!readOnly && photos.length === 0 && (
        <div className="photo-upload-options-grid">
          {/* Option 1: Upload through File */}
          <div
            className={`photo-option-card file-card ${isDragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            title="Upload photo from computer or device storage"
          >
            <div className="photo-option-badge">Option 1</div>
            <div className="photo-option-icon file-icon">
              <Upload size={24} />
            </div>
            <div className="photo-option-title">1. Upload through File</div>
            <div className="photo-option-desc">
              Select images from computer or mobile files, or drag & drop here
            </div>
            <div className="photo-option-action-tag">
              <FolderOpen size={13} />
              {isProcessing ? 'Processing...' : 'Browse Files'}
            </div>
          </div>

          {/* Option 2: Upload through Camera */}
          <div
            className="photo-option-card camera-card"
            onClick={() => setIsCameraOpen(true)}
            role="button"
            tabIndex={0}
            title="Take photo using camera or webcam"
          >
            <div className="photo-option-badge">Option 2</div>
            <div className="photo-option-icon camera-icon">
              <Camera size={24} />
            </div>
            <div className="photo-option-title">2. Upload through Camera</div>
            <div className="photo-option-desc">
              Take live snapshots using your connected camera or webcam
            </div>
            <div className="photo-option-action-tag">
              <Camera size={13} />
              Open Live Camera
            </div>
          </div>
        </div>
      )}

      {/* 2. Photo Previews Grid (Visible when at least 1 photo exists or in readOnly mode) */}
      {(photos.length > 0 || readOnly) && (
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
                  title="Remove this photo"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          {/* If more photos can be added, show 2 compact action tiles inside the grid */}
          {!readOnly && !isMaxReached && (
            <>
              {/* Option 1: File Tile */}
              <div
                className="photo-grid-tile file-tile"
                onClick={() => fileInputRef.current?.click()}
                title="1. Upload through File"
              >
                <Upload size={20} color="var(--primary)" />
                <span className="photo-grid-tile-label">1. File</span>
                <span className="photo-grid-tile-sub">Upload image</span>
              </div>

              {/* Option 2: Camera Tile */}
              <div
                className="photo-grid-tile camera-tile"
                onClick={() => setIsCameraOpen(true)}
                title="2. Upload through Camera"
              >
                <Camera size={20} color="#059669" />
                <span className="photo-grid-tile-label">2. Camera</span>
                <span className="photo-grid-tile-sub">Take photo</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input for file upload (Option 1) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Hidden file input for direct device camera capture (Option 2 fallback) */}
      <input
        ref={deviceCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {errorMsg && <div className="form-error">{errorMsg}</div>}

      {/* Bottom Action Toolbar */}
      {!readOnly && (
        <div className="photo-actions-toolbar">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {photos.length} of {maxPhotos} photos recorded {isMaxReached && '(Max limit reached)'}
          </span>

          <div className="photo-actions-buttons-group">
            {!isMaxReached && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-file-upload"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from files"
                >
                  <Upload size={14} />
                  1. Upload through File
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-camera-upload"
                  onClick={() => setIsCameraOpen(true)}
                  title="Upload through Camera"
                >
                  <Camera size={14} />
                  2. Upload through Camera
                </button>
              </>
            )}

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
            Select a sample item photo to simulate camera capture:
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
