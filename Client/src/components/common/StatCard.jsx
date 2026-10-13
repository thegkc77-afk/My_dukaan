import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#2563EB', bgColor = '#EFF6FF', onClick }) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className="stat-card-icon-wrapper"
        style={{ backgroundColor: bgColor, color: color }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-title">{title}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};
