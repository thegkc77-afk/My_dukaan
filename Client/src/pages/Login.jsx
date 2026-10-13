import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Store,
  Lock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Login = () => {
  const { login, isAuthenticated, settings } = useApp();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [shopName, setShopName] = useState(
    settings.shopName || 'Dukkan Sports & Repair Hub'
  );
  const [email, setEmail] = useState('owner@dukkan.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ownerDisplayName = settings.ownerName
      ? `${settings.ownerName} (Owner)`
      : settings.staffMembers?.[0] || 'Ramesh Kumar (Owner)';

    login({
      name: ownerDisplayName,
      shopName: shopName.trim() || settings.shopName || 'Repair Shop',
      email: email.trim(),
      role: 'Shop Owner',
      loginTime: new Date().toISOString()
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Logo and Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <Store size={28} />
          </div>
          <h1 className="login-title">{shopName || 'Repair Shop'}</h1>
          <p className="login-subtitle">
            Tagless Digital Item Identity &bull; Shop Owner Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Shop Name */}
          <div className="form-group">
            <label className="form-label">
              <span>Shop Name</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Store
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="e.g. Dukkan Sports & Repair Hub"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email / Username */}
          <div className="form-group">
            <label className="form-label">
              <span>Shop Email or Phone</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="e.g. owner@dukkan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password / Security PIN */}
          <div className="form-group">
            <label className="form-label">
              <span>Passcode / Security PIN</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Remember me & Security Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.8rem'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span>Remember login on this device</span>
            </label>

            <span style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600 }}>
              Local Business Mode
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="var(--success)" />
            <span>Tagless item records & warranty verification secure.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
