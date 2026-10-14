import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Plus, Image as ImageIcon } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSampleSelector, setShowSampleSelector] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

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

  return (
    <div className="photo-uploader-container">
      {/* Photo Previews */}
      <div className="photo-previews-grid">
        {photos.map((url, idx) => (
          <div key={idx} className="photo-preview-item">
            <img src={url} alt={`Item preview ${idx + 1}`} />
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

        {!readOnly && photos.length < maxPhotos && (
          <div
            className="photo-upload-dropzone"
            onClick={() => setIsCameraOpen(true)}
            style={{ height: '110px', padding: '0.5rem', margin: 0 }}
            title="Click to open live camera and take photo"
          >
            <Camera size={24} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>
              {isProcessing ? 'Processing...' : 'Add Photo'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Open Live Camera
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

      {!readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {photos.length} of {maxPhotos} photos recorded.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {photos.length < maxPhotos && (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Upload image from computer files"
              >
                <Upload size={14} />
                Upload from Files
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowSampleSelector(!showSampleSelector)}
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
