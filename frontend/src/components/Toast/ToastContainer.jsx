import PropTypes from 'prop-types';
import './ToastContainer.css';

const ICON_MAP = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  info: 'bi-info-circle-fill'
};

const DEFAULT_TITLES = {
  success: '¡Éxito!',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información'
};

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-global-container" aria-live="polite">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        const iconClass = ICON_MAP[type] || ICON_MAP.info;
        const title = toast.title || DEFAULT_TITLES[type];
        const durationMs = toast.duration || 4000;

        return (
          <div
            key={toast.id}
            className={`toast-item-card toast-${type}`}
            role="alert"
          >
            <div className="toast-icon-box">
              <i className={`bi ${iconClass}`}></i>
            </div>

            <div className="toast-content">
              <h6 className="toast-title">{title}</h6>
              <p className="toast-message">{toast.message}</p>
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onClose(toast.id)}
              aria-label="Cerrar notificación"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div
              className="toast-progress-bar"
              style={{ animationDuration: `${durationMs}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      title: PropTypes.string,
      message: PropTypes.string.isRequired,
      duration: PropTypes.number
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};
