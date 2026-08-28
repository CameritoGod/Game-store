import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DICEBEAR_STYLES, PREDEFINED_AVATARS } from '../../utils/dicebearAvatars';
import './AvatarModal.css';

export default function AvatarModal({ isOpen, onClose, currentAvatarUrl, onSave, loading }) {
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedUrl, setSelectedUrl] = useState(currentAvatarUrl || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentAvatarUrl || PREDEFINED_AVATARS[0].url);
    }
  }, [isOpen, currentAvatarUrl]);

  if (!isOpen) return null;

  const filteredAvatars = selectedStyle === 'all'
    ? PREDEFINED_AVATARS
    : PREDEFINED_AVATARS.filter(a => a.style === selectedStyle);

  const handleConfirm = () => {
    if (selectedUrl && !loading) {
      onSave(selectedUrl);
    }
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Encabezado */}
        <div className="avatar-modal-header">
          <h5 className="avatar-modal-title">
            <i className="bi bi-person-badge-fill fs-4"></i> Elige tu Avatar DiceBear
          </h5>
          <button type="button" className="avatar-modal-close" onClick={onClose} title="Cerrar">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Pestañas de Estilos */}
        <div className="avatar-modal-tabs">
          {DICEBEAR_STYLES.map(styleTab => (
            <button
              key={styleTab.id}
              type="button"
              className={`avatar-tab-btn ${selectedStyle === styleTab.id ? 'active' : ''}`}
              onClick={() => setSelectedStyle(styleTab.id)}
            >
              {styleTab.name}
            </button>
          ))}
        </div>

        {/* Cuadrícula de Avatares */}
        <div className="avatar-modal-body">
          <div className="avatar-grid">
            {filteredAvatars.map((item) => {
              const isSelected = selectedUrl === item.url;
              return (
                <div
                  key={item.id}
                  className={`avatar-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedUrl(item.url)}
                >
                  {isSelected && (
                    <span className="avatar-selected-badge">
                      <i className="bi bi-check-lg"></i>
                    </span>
                  )}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="avatar-img-preview"
                    loading="lazy"
                  />
                  <span className="avatar-label">{item.seed}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones */}
        <div className="avatar-modal-footer">
          <button
            type="button"
            className="btn-cancel-avatar"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-save-avatar"
            onClick={handleConfirm}
            disabled={loading || !selectedUrl}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i> Guardar Selección
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

AvatarModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentAvatarUrl: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
