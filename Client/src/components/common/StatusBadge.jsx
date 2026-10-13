import React from 'react';

export const StatusBadge = ({ status, type = 'repair' }) => {
  if (!status) return null;

  let badgeClass = 'badge-neutral';

  switch (status.toLowerCase()) {
    // Repair Statuses
    case 'ready for pickup':
    case 'completed':
    case 'eligible':
    case 'resolved':
    case 'active':
    case 'replacement approved':
      badgeClass = 'badge-success';
      break;

    case 'under repair':
    case 'pending verification':
    case 'under review':
    case 'repair in progress':
      badgeClass = 'badge-warning';
      break;

    case 'received':
      badgeClass = 'badge-primary';
      break;

    case 'expired':
    case 'rejected':
    case 'cancelled':
    case 'held for review':
      badgeClass = 'badge-error';
      break;

    default:
      badgeClass = 'badge-neutral';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {status}
    </span>
  );
};
