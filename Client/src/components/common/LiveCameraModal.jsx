import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Upload,
  X,
  Check,
  AlertCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const LiveCameraModal = ({
  isOpen,
  onClose,
  onCapture,
  onUploadFiles,
  photos = [],
  maxPhotos = 4,
  title = 'Live Item Camera'
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // States: 'prompting' | 'streaming' | 'denied' | 'not_found' | 'unsupported' | 'error'
  const [cameraState, setCameraState] = useState('prompting');
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [sessionCaptures, setSessionCaptures] = useState([]);

  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio autoplay policy or not supported
    }
  };

  // Safely stop any active stream tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.error('Error stopping tracks:', err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request camera access and start live stream
  const startCamera = useCallback(async (mode = facingMode) => {
    stopStream();
    setCameraState('prompting');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage(
        'Live camera stream is not supported by this browser or requires a secure connection (HTTPS / localhost).'
      );
      return;
    }

    try {
      // Check if device has multiple video inputs
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (e) {
        // EnumerateDevices might fail if permissions aren't granted yet; ignore
      }

      // First try with preferred facingMode and resolution
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode ? { ideal: mode } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (constraintErr) {
        console.warn('Ideal video constraints failed, trying basic video:true', constraintErr);
        // Fallback to basic video constraint if ideal facingMode fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        let isStreamingActivated = false;
        const markStreaming = () => {
          if (!isStreamingActivated) {
            isStreamingActivated = true;
            setCameraState('streaming');
          }
        };

        video.onloadedmetadata = () => {
          video
            ?.play()
            .then(markStreaming)
            .catch(() => markStreaming());
        };

        video.oncanplay = markStreaming;
        video.onloadeddata = markStreaming;
        video.onplaying = markStreaming;

        // Attempt playback immediately
        video
          ?.play()
          .then(markStreaming)
          .catch(() => {});

        // Safety fallback timer: if tracks are active, force streaming state after 650ms
        setTimeout(() => {
          if (stream.active && stream.getVideoTracks().some((t) => t.readyState === 'live')) {
            markStreaming();
          }
        }, 650);
      } else {
        setCameraState('streaming');
      }
    } catch (err) {
      console.warn('Camera permission or acquisition failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage(
          'Camera access was denied. Please allow camera permissions in your browser or use the native device camera / file upload below.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('not_found');
        setErrorMessage('No camera was detected on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraState('error');
        setErrorMessage(
          'Your camera may be in use by another application or browser tab. Please close other camera apps and retry.'
        );
      } else {
        setCameraState('error');
        setErrorMessage(err.message || 'Unable to access the camera.');
      }
    }
  }, [facingMode, stopStream]);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setSessionCaptures([]);
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  // Switch between front and rear cameras
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const cameraFileInputRef = useRef(null);

  // Capture current frame from live video
  const handleCapturePhoto = () => {
    if (photos.length >= maxPhotos) {
      return;
    }

    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    // Play tactile camera click audio
    playShutterSound();

    // Trigger visual flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // If user camera (front-facing), mirror horizontally for natural feel
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      setSessionCaptures((prev) => [...prev, dataUrl]);
      onCapture(dataUrl);
    } catch (err) {
      console.error('Failed to capture frame:', err);
    }
  };

  // Trigger fallback file picker
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Trigger native device camera
  const handleTriggerNativeCamera = () => {
    if (cameraFileInputRef.current) {
      cameraFileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
      handleClose();
    }
  };

  if (!isOpen) return null;

  const isMaxReached = photos.length >= maxPhotos;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content modal-lg camera-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header camera-modal-header">
          <div className="camera-header-left">
            <div className="camera-live-badge">
              <span className={`live-pulse-dot ${cameraState === 'streaming' ? 'active' : ''}`} />
              <Camera size={18} />
              <span className="camera-title-text">{title}</span>
            </div>
            <span className="camera-counter-badge">
              {photos.length} / {maxPhotos} photos
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close camera"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Camera Viewport or State Notice */}
        <div className="modal-body camera-modal-body">
          {/* Permission Prompting / Loading State */}
          {cameraState === 'prompting' && (
            <div className="camera-state-screen camera-state-prompting">
              <div className="camera-pulse-ring">
                <Camera size={44} className="camera-icon-spin" />
              </div>
              <h4>Requesting Camera Access...</h4>
              <p>
                Please click <strong>"Allow"</strong> on your browser's permission prompt to use the live camera.
              </p>
              <div className="camera-prompt-tip">
                <ShieldAlert size={16} />
                <span>Camera feed is processed directly inside your browser. No video is recorded.</span>
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleTriggerNativeCamera}
                >
                  <Camera size={14} />
                  Take Photo (Device Camera)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleTriggerFileInput}
                >
                  <Upload size={14} />
                  Upload from Files Instead
                </button>
              </div>
            </div>
          )}

          {/* Permission Denied State */}
          {cameraState === 'denied' && (
            <div className="camera-state-screen camera-state-denied">
              <div className="camera-error-icon-wrapper">
                <CameraOff size={44} color="var(--error)" />
              </div>
              <h4 style={{ color: 'var(--error)' }}>Camera Permission Denied</h4>
              <p>{errorMessage}</p>
              
              <div className="camera-guide-box">
                <strong>How to grant camera permission:</strong>
                <ol>
                  <li>Look for the camera or lock icon (🔒) in your browser's address/URL bar.</li>
                  <li>Click it and change <strong>Camera</strong> from "Block" to <strong>"Allow"</strong>.</li>
                  <li>Click the <strong>"Retry Camera"</strong> button below.</li>
                </ol>
              </div>

              <div className="camera-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTriggerNativeCamera}
                >
                  <Camera size={15} />
                  Take with Device Camera
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTriggerFileInput}
                >
                  <Upload size={15} />
                  Upload from Files
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => startCamera(facingMode)}
                >
                  <RefreshCw size={15} />
                  Retry Camera
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Not Found or Error or Unsupported State */}
          {(cameraState === 'not_found' || cameraState === 'error' || cameraState === 'unsupported') && (
            <div className="camera-state-screen camera-state-error">
              <div className="camera-error-icon-wrapper">
                <AlertCircle size={44} color="var(--warning)" />
              </div>
              <h4>Camera Unavailable</h4>
              <p>{errorMessage}</p>
              
              <div className="camera-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTriggerNativeCamera}
                >
                  <Camera size={15} />
                  Take with Device Camera
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTriggerFileInput}
                >
                  <Upload size={15} />
                  Upload from Files
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => startCamera(facingMode)}
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Live Video Viewfinder */}
          <div
            className={`camera-viewfinder-container ${
              cameraState === 'streaming' ? 'visible' : 'hidden'
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`camera-video-element ${facingMode === 'user' ? 'mirrored' : ''}`}
            />

            {/* Visual Shutter Flash Overlay */}
            {isFlashing && <div className="camera-shutter-flash" />}

            {/* Viewfinder Target Framing Guides */}
            <div className="camera-frame-guide">
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />
              <div className="guide-center-crosshair" />
            </div>

            {/* Live Camera Overlay Bar (Top) */}
            <div className="camera-top-controls">
              <div className="camera-resolution-indicator">
                <span className="dot" />
                LIVE FEED
              </div>
              <div className="camera-quick-tools">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    className="camera-tool-btn"
                    onClick={handleToggleFacingMode}
                    title="Flip camera"
                  >
                    <RefreshCw size={16} />
                    <span>Flip</span>
                  </button>
                )}
                <button
                  type="button"
                  className="camera-tool-btn"
                  onClick={handleTriggerFileInput}
                  title="Upload from files"
                >
                  <Upload size={16} />
                  <span>Files</span>
                </button>
              </div>
            </div>

            {/* Max photos notice on viewfinder if reached */}
            {isMaxReached && (
              <div className="camera-max-banner">
                <Check size={18} />
                <span>Maximum photos reached ({maxPhotos}/{maxPhotos})</span>
              </div>
            )}
          </div>

          {/* Hidden File Input for files fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Hidden Camera Input for direct device camera capture */}
          <input
            ref={cameraFileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Modal Footer: Shutter Controls & Gallery Strip */}
        <div className="modal-footer camera-modal-footer">
          {cameraState === 'streaming' ? (
            <div className="camera-shutter-controls-container">
              {/* Left Side: Thumbnail Preview of current captures */}
              <div className="camera-thumbnails-tray">
                {photos.slice(-3).map((url, i) => (
                  <div key={i} className="camera-thumb-item">
                    <img src={url} alt={`Snap ${i + 1}`} />
                  </div>
                ))}
              </div>

              {/* Center: Big Shutter Snap Button */}
              <div className="camera-shutter-center">
                <button
                  type="button"
                  className={`camera-shutter-btn ${isMaxReached ? 'disabled' : ''}`}
                  onClick={handleCapturePhoto}
                  disabled={isMaxReached}
                  title={isMaxReached ? 'Photo limit reached' : 'Capture photo'}
                  aria-label="Capture Photo"
                >
                  <div className="camera-shutter-inner" />
                </button>
                <span className="camera-shutter-label">
                  {isMaxReached ? 'Photo Limit Reached' : 'Click to Capture'}
                </span>
              </div>

              {/* Right Side: Done button */}
              <div className="camera-finish-side">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClose}
                >
                  <Check size={16} />
                  Done ({photos.length})
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
