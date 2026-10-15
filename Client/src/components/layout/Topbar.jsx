import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  User,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar = ({ onToggleSidebar }) => {
  const { settings, activeStaff, setActiveStaff, stats, logout } = useApp();
  const navigate = useNavigate();

  const [globalSearch, setGlobalSearch] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const staffDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(e.target)) {
        setShowStaffDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/find-item?q=${encodeURIComponent(globalSearch.trim())}`);
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const staffInitials = activeStaff
    ? activeStaff.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : 'SK';

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <form className="topbar-search-form" onSubmit={handleSearchSubmit}>
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Global search by item, mark, customer or ID..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="topbar-right">
        {/* Date Display */}
        <div className="topbar-date">
          <Calendar size={14} color="var(--primary)" />
          <span>{todayStr}</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications"
          >
            <Bell size={18} />
            {(stats.readyForPickup > 0 || stats.pendingClaims > 0) && (
              <span className="icon-badge">
                {stats.readyForPickup + stats.pendingClaims}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '320px',
                maxWidth: 'calc(100vw - 1.5rem)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                zIndex: 50,
                padding: '1rem',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Shop Alerts</span>
                <span className="badge badge-primary">{stats.readyForPickup + stats.pendingClaims} Actionable</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {stats.readyForPickup > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.6rem',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowNotifDropdown(false);
                      navigate('/repairs?tab=Ready for Pickup');
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {stats.readyForPickup} Items Ready for Pickup
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        Cricket bats & equipment ready for customer verification & handover.
                      </div>
                    </div>
                  </div>
                )}

                {stats.pendingClaims > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.6rem',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowNotifDropdown(false);
                      navigate('/warranty-claims');
                    }}
                  >
                    <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {stats.pendingClaims} Pending Warranty Claims
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        Review broken sports items for warranty eligibility.
                      </div>
                    </div>
                  </div>
                )}

                {stats.readyForPickup === 0 && stats.pendingClaims === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    All operations up to date! No pending alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile Menu */}
        <div style={{ position: 'relative' }} ref={staffDropdownRef}>
          <button
            type="button"
            className="staff-menu-btn"
            onClick={() => setShowStaffDropdown(!showStaffDropdown)}
          >
            <div className="staff-avatar">{staffInitials}</div>
            <div className="staff-info-text">
              <span className="staff-name">{activeStaff}</span>
              <span className="staff-role">Staff on Duty</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showStaffDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '240px',
                maxWidth: 'calc(100vw - 1.5rem)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                zIndex: 50,
                padding: '0.5rem',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Switch Active Staff
                </span>
              </div>

              {(settings.staffMembers || []).map((staff) => (
                <button
                  key={staff}
                  type="button"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: activeStaff === staff ? 'var(--primary-light)' : 'transparent',
                    color: activeStaff === staff ? 'var(--primary)' : 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: activeStaff === staff ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => {
                    setActiveStaff(staff);
                    setShowStaffDropdown(false);
                  }}
                >
                  <User size={14} />
                  <span>{staff}</span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--error)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => {
                    setShowStaffDropdown(false);
                    logout();
                    navigate('/login');
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
