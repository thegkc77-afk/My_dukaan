import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/common/SearchBar';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/dateUtils';
import { searchTaglessItems } from '../utils/search';
import {
  Wrench,
  PlusCircle,
  Eye,
  Calendar,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export const RepairOrders = () => {
  const { repairOrders, settings, updateRepairStatus } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'All Orders';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const tabs = ['All Orders', 'Received', 'Under Repair', 'Ready for Pickup', 'Completed'];

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      'All Orders': repairOrders.length,
      'Received': repairOrders.filter((o) => o.repairStatus === 'Received').length,
      'Under Repair': repairOrders.filter((o) => o.repairStatus === 'Under Repair').length,
      'Ready for Pickup': repairOrders.filter((o) => o.repairStatus === 'Ready for Pickup').length,
      'Completed': repairOrders.filter((o) => o.repairStatus === 'Completed').length
    };
  }, [repairOrders]);

  // Extract unique brands
  const brands = useMemo(() => {
    const set = new Set(repairOrders.map((o) => o.brand).filter(Boolean));
    return Array.from(set);
  }, [repairOrders]);

  // Filtered and searched orders
  const filteredOrders = useMemo(() => {
    let result = [...repairOrders];

    // Status tab filter
    if (currentTab !== 'All Orders') {
      result = result.filter((o) => o.repairStatus === currentTab);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((o) => o.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((o) => o.brand === selectedBrand);
    }

    // Search query with full field ranking
    if (searchQuery.trim()) {
      result = searchTaglessItems(result, searchQuery.trim());
    }

    return result;
  }, [repairOrders, currentTab, selectedCategory, selectedBrand, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setCurrentPage(1);
  };

  return (
    <div className="repair-orders-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title-box">
          <h1 className="page-title">Repair Orders</h1>
          <p className="page-description">
            Manage incoming equipment, track workshop progress, and verify items without physical receipts.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate('/find-item')}
          >
            <ShieldCheck size={16} />
            Tagless Verification Mode
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/orders/new?type=repair')}
          >
            <PlusCircle size={16} />
            New Order
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div className="filter-search-container" style={{ margin: 0 }}>
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search by Order ID, customer, brand, problem, or distinctive marks..."
            onClear={() => setSearchQuery('')}
          />

          <FilterBar
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
            categories={settings.categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(c) => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            brands={brands}
            selectedBrand={selectedBrand}
            onBrandChange={(b) => {
              setSelectedBrand(b);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No repair orders match your criteria"
            description="Try adjusting your search query, selecting 'All Orders', or registering a new repair order."
            actionText="Create New Order"
            onAction={() => navigate('/repairs/new')}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Photo</th>
                    <th>Item Details</th>
                    <th>Brand & Category</th>
                    <th>Customer</th>
                    <th>Received / Expected</th>
                    <th>Status</th>
                    <th>Est. Cost</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="item-code">{order.id}</span>
                      </td>
                      <td>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
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
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {order.name}
                        </div>
                        {order.distinctiveMarks && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#92400E',
                              background: '#FEF3C7',
                              display: 'inline-block',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 'var(--radius-sm)',
                              marginTop: '0.2rem',
                              maxWidth: '260px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={order.distinctiveMarks}
                          >
                            Mark: {order.distinctiveMarks}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{order.brand || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{order.category}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {order.customerName || 'Walk-in (No Name)'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {order.customerPhone || 'No Phone recorded'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                          Rec: {formatDate(order.dateReceived)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Due: {formatDate(order.expectedDate)}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={order.repairStatus} />
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        ₹{order.estimatedCost}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/repairs/${order.id}`)}
                            title="View order details and history"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          {order.repairStatus === 'Ready for Pickup' && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => navigate(`/handovers?orderId=${order.id}`)}
                              title="Handover to customer"
                            >
                              <ShieldCheck size={14} />
                              Handover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: '#FAFAFC'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
                {filteredOrders.length} repair orders
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0 0.5rem' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
