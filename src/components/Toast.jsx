import React, { useEffect } from 'react';

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeIcon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[toast.type] || '•';

  return (
    <div className={`toast-message toast-${toast.type || 'info'}`} role="alert">
      <span className="toast-icon">{typeIcon}</span>
      <span className="toast-text">{toast.message}</span>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default ToastContainer;
