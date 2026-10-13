import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = '#16A34A';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = '#DC2626';
        } else if (toast.type === 'warning') {
          Icon = AlertCircle;
          iconColor = '#F59E0B';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = '#2563EB';
        }

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
