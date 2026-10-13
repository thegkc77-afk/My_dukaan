import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Wrench,
  Search,
  BadgePercent,
  FileCheck2,
  PackageCheck,
  Settings,
  X,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { stats, settings } = useApp();
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/orders/new',
      label: 'New Order',
      icon: PlusCircle
    },
    {
      to: '/repairs',
      label: 'Repair Orders',
      icon: Wrench,
      badge: stats.underRepair + stats.received
    },
    {
      to: '/find-item',
      label: 'Find an Item',
      icon: Search,
      badge: 'Core'
    },
    {
      to: '/sales',
      label: 'Sales & Warranty',
      icon: BadgePercent
    },
    {
      to: '/warranty-claims',
      label: 'Warranty Claims',
      icon: FileCheck2,
      badge: stats.pendingClaims > 0 ? stats.pendingClaims : null
    },
    {
      to: '/handovers',
      label: 'Handover Records',
      icon: PackageCheck
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="brand-container">
            <div className="brand-icon">
              <Store size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Repair Shop</span>
              <span className="brand-subtitle">Tagless Identity System</span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="shop-status-box">
            <div className="shop-status-indicator" />
            <div className="shop-status-text">
              <span className="shop-status-name">
                {settings.shopName || 'Local Sports Hub'}
              </span>
              <span className="shop-status-sub">
                Online &bull; INR ({settings.currency || '₹'})
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
