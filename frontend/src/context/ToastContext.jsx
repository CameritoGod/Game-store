import { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ToastContainer from '../components/Toast/ToastContainer';
import { getFriendlyErrorMessage } from '../utils/errorTransformer';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type = 'info', message, title = null, duration = 4000) => {
    if (!message) return;

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast = { id, type, message, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, title = '¡Éxito!') => {
    showToast('success', message, title, 3500);
  }, [showToast]);

  const showError = useCallback((errorOrMessage, title = 'Error') => {
    const message = getFriendlyErrorMessage(errorOrMessage);
    showToast('error', message, title, 5000);
  }, [showToast]);

  const showWarning = useCallback((message, title = 'Advertencia') => {
    showToast('warning', message, title, 4000);
  }, [showToast]);

  const showInfo = useCallback((message, title = 'Información') => {
    showToast('info', message, title, 3500);
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};
