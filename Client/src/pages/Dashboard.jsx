import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate } from '../utils/dateUtils';
import {
  Wrench,
  Clock,
  PackageCheck,
  ShieldCheck,
  FileCheck2,
  CheckCircle,
  PlusCircle,
  ShoppingBag,
  Search,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { stats, repairOrders, warrantyClaims, salesRecords } = useApp();
  const navigate = useNavigate();

  const recentRepairs = [...repairOrders].slice(0, 5);
  const recentClaims = [...warrantyClaims].slice(0, 4);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-description">
            Live shop overview &bull; Tagless item recovery &bull; Warranty verification
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate('/find-item')}
          >
            <Search size={16} />
            Find Lost Tagless Item
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/orders/new')}
          >
            <PlusCircle size={16} />
            New Order
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Repair Orders"
          value={stats.totalRepairs}
          subtitle="All-time registered"
          icon={Wrench}
          color="#2563EB"
          bgColor="#EFF6FF"
          onClick={() => navigate('/repairs')}
        />
        <StatCard
          title="Items Under Repair"
          value={stats.underRepair}
          subtitle="In technician workshop"
          icon={Clock}
          color="#D97706"
          bgColor="#FEF3C7"
          onClick={() => navigate('/repairs?tab=Under Repair')}
        />
        <StatCard
          title="Ready for Pickup"
          value={stats.readyForPickup}
          subtitle="Awaiting customer verification"
          icon={PackageCheck}
          color="#16A34A"
          bgColor="#DCFCE7"
          onClick={() => navigate('/repairs?tab=Ready for Pickup')}
        />
        <StatCard
          title="Active Warranties"
          value={stats.activeWarranties}
          subtitle="Products under coverage"
          icon={ShieldCheck}
          color="#0284C7"
          bgColor="#E0F2FE"
          onClick={() => navigate('/sales')}
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims}
          subtitle="Awaiting shop inspection"
          icon={FileCheck2}
          color="#DC2626"
          bgColor="#FEE2E2"
          onClick={() => navigate('/warranty-claims')}
        />
        <StatCard
          title="Completed Handovers"
          value={stats.totalHandovers}
          subtitle="Verified & returned"
          icon={CheckCircle}
          color="#059669"
          bgColor="#D1FAE5"
          onClick={() => navigate('/handovers')}
        />
      </div>

      {/* Quick Actions Hero Card */}
      <div className="quick-actions-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={20} color="#FDE047" />
          <h3 style={{ margin: 0 }}>Core Shop Workflows</h3>
        </div>
        <p>
          Fast-track frequent shop operations. Register new product sales, take repair orders, or verify tagless items.
        </p>

        <div className="quick-actions-grid">
          <div
            className="quick-action-btn"
            onClick={() => navigate('/orders/new?type=buy')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} color="#93C5FD" />
              <span className="btn-title">New Order: Buy New Product</span>
            </div>
            <span className="btn-sub">
              Register sold sports equipment with auto-calculated warranty expiry.
            </span>
          </div>

          <div
            className="quick-action-btn"
            onClick={() => navigate('/orders/new?type=repair')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={20} color="#93C5FD" />
              <span className="btn-title">New Order: Repair Product</span>
            </div>
            <span className="btn-sub">
              Log cricket bat, racket, or gear with distinctive marks & photos.
            </span>
          </div>

          <div
            className="quick-action-btn"
            onClick={() => navigate('/find-item')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} color="#FDE047" />
              <span className="btn-title">Find an Item (Lost Receipt)</span>
            </div>
            <span className="btn-sub">
              Identify repair items by willow grain, marks, or problem description.
            </span>
          </div>

          <div
            className="quick-action-btn"
            onClick={() => navigate('/warranty-lookup')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#86EFAC" />
              <span className="btn-title">Verify Warranty (No Bill)</span>
            </div>
            <span className="btn-sub">
              Check product coverage terms and register warranty claims.
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Repairs & Warranty Claims */}
      <div className="dashboard-grid">
        {/* Recent Repair Orders Section */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Wrench size={18} color="var(--primary)" />
              <span>Recent Repair Orders</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/repairs')}
            >
              View All Orders
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item Photo</th>
                  <th>Item Name</th>
                  <th>Customer</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRepairs.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="item-code">{order.id}</span>
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
                          src={order.photos?.[0]}
                          alt={order.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {order.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.category} &bull; {order.brand}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {order.customerName || 'Walk-in'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.customerPhone || 'No phone'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(order.dateReceived)}
                    </td>
                    <td>
                      <StatusBadge status={order.repairStatus} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/repairs/${order.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warranty Claims Section */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileCheck2 size={18} color="var(--primary)" />
              <span>Warranty Claims</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/warranty-claims')}
            >
              All Claims
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => navigate('/warranty-claims')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className="item-code">{claim.id}</span>
                  <StatusBadge status={claim.claimStatus} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {claim.productName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Customer: {claim.customerName} &bull; Claimed: {formatDate(claim.claimDate)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991B1B', background: '#FEE2E2', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  Defect: {claim.defectReported}
                </div>
              </div>
            ))}

            {recentClaims.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active warranty claims logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
