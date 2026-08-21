import './footer.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // 📋 Contenido de Términos y Condiciones
  const termsContent = `
    <div class="legal-modal-header mb-3">
      <i class="bi bi-file-earmark-text-fill text-primary fs-3 me-2"></i>
      <h3>Términos y Condiciones</h3>
    </div>
    <ul class="legal-list">
      <li>
        <i class="bi bi-check-circle-fill text-success legal-icon"></i>
        <div class="legal-text">El sitio web es de <strong>uso totalmente gratuito</strong>.</div>
      </li>
      <li>
        <i class="bi bi-check-circle-fill text-success legal-icon"></i>
        <div class="legal-text">Este sitio fue desarrollado como <strong>proyecto de práctica y portafolio profesional</strong>.</div>
      </li>
      <li>
        <i class="bi bi-check-circle-fill text-success legal-icon"></i>
        <div class="legal-text">El sitio web pertenece al desarrollador y está protegido por <strong>derechos de autor</strong>.</div>
      </li>
      <li>
        <i class="bi bi-exclamation-triangle-fill text-warning legal-icon"></i>
        <div class="legal-text">El sitio <strong>no cuenta con seguridad de nivel bancario</strong>. No ingresar datos sensibles reales.</div>
      </li>
      <li>
        <i class="bi bi-check-circle-fill text-success legal-icon"></i>
        <div class="legal-text">El registro solo requiere un correo electrónico válido para simular la sesión.</div>
      </li>
      <li>
        <i class="bi bi-credit-card-fill text-info legal-icon"></i>
        <div class="legal-text">Los pagos con tarjeta son <strong>100% simulados</strong>. No se solicitan ni almacenan datos bancarios reales.</div>
      </li>
      <li>
        <i class="bi bi-code-slash text-primary legal-icon"></i>
        <div class="legal-text">Desarrollado por <strong>Breixon Camero</strong> para su portafolio Full Stack.</div>
      </li>
    </ul>

    <!-- 🎮 ATRIBUCIÓN IGDB API REDISEÑADA -->
    <div class="igdb-card">
      <div class="igdb-card-header">
        <i class="bi bi-database-fill text-info fs-5"></i>
        <strong class="text-white">Fuente de datos de juegos (IGDB):</strong>
      </div>
      <p class="igdb-card-text">
        La información de videojuegos (títulos, portadas, descripciones, géneros y valoraciones) es provista en tiempo real a través de la API oficial de
        <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" class="igdb-link fw-bold ms-1">
          IGDB.com (Twitch / Amazon)
        </a>. 
        Este sitio no está afiliado ni patrocinado oficialmente por IGDB. Todos los derechos e imágenes pertenecen a sus respectivos creadores.
      </p>
    </div>

    <p class="mt-3 text-secondary text-end"><small>Última actualización: ${new Date().toLocaleDateString('es-ES')}</small></p>
  `;

  // 🔒 Contenido de Política de Privacidad
  const privacyContent = `
    <div class="legal-modal-header mb-3">
      <i class="bi bi-shield-check text-warning fs-3 me-2"></i>
      <h3>Política de Privacidad</h3>
    </div>
    <ul class="legal-list">
      <li>
        <i class="bi bi-lock-fill text-warning legal-icon"></i>
        <div class="legal-text"><strong class="legal-label">Correo electrónico:</strong> Utilizado únicamente para gestionar tu perfil simulado. No comerciamos ni compartimos tu información.</div>
      </li>
      <li>
        <i class="bi bi-shield-lock-fill text-warning legal-icon"></i>
        <div class="legal-text"><strong class="legal-label">Datos sensibles:</strong> Este sitio NO almacena ni procesa tarjetas reales ni documentos oficiales.</div>
      </li>
      <li>
        <i class="bi bi-controller text-primary legal-icon"></i>
        <div class="legal-text"><strong class="legal-label">Información de juegos:</strong> Guardamos tu lista de compras simuladas y favoritos en almacenamiento local/sesión.</div>
      </li>
      <li>
        <i class="bi bi-globe text-info legal-icon"></i>
        <div class="legal-text"><strong class="legal-label">Cookies:</strong> Empleamos únicamente almacenamiento técnico básico para mantener tu experiencia de navegación.</div>
      </li>
      <li>
        <i class="bi bi-trash-fill text-danger legal-icon"></i>
        <div class="legal-text"><strong class="legal-label">Eliminación de datos:</strong> Puedes cerrar sesión o limpiar los datos almacenados en cualquier momento.</div>
      </li>
    </ul>
    <p class="mt-3 text-secondary text-end"><small>Última actualización: 28/02/2025</small></p>
  `;

  // © Derechos de autor
  const copyrightContent = `
    <div class="legal-modal-header mb-3">
      <i class="bi bi-c-circle-fill text-danger fs-3 me-2"></i>
      <h3>Derechos de Autor</h3>
    </div>
    <p class="mt-2 text-light">Este proyecto y su código fuente (arquitectura, diseño y lógica de componentes) son propiedad intelectual de:</p>
    <div class="author-card p-3 my-3 text-center rounded-3">
      <i class="bi bi-person-badge-fill text-primary display-4 mb-2 d-block"></i>
      <h5 class="text-white mb-0">Breixon Camero</h5>
      <small class="text-info">Desarrollador Full Stack Senior</small>
    </div>
    <div class="contact-links">
      <p class="mb-2"><i class="bi bi-envelope-fill text-warning me-2"></i> <strong class="legal-label">Contacto:</strong> <a href="mailto:breixoncamero29c@gmail.com" class="text-light">breixoncamero29c@gmail.com</a></p>
      <p class="mb-2"><i class="bi bi-globe2 text-info me-2"></i> <strong class="legal-label">Portafolio:</strong> <a href="https://breixoncamerodev.vercel.app" target="_blank" rel="noopener noreferrer" class="text-light">Breixon Camero Web</a></p>
      <p class="mb-0"><i class="bi bi-github text-white me-2"></i> <strong class="legal-label">Github:</strong> <a href="https://github.com/CameritoGod" target="_blank" rel="noopener noreferrer" class="text-light">CameritoGod</a></p>
    </div>
    <p class="mt-4 text-secondary text-end"><small>Todos los derechos reservados © ${new Date().getFullYear()}</small></p>
  `;

  const openModal = (type) => {
    const content = {
      terms: termsContent,
      privacy: privacyContent,
      copyright: copyrightContent
    };
    setModalContent(content[type]);
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
  };

  const closeModal = () => {
    setModalContent(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <footer className="footer">
        <div className="container-fluid px-4">
          <div className="footer-grid">

            <div>
              <h5>GameStore</h5>
              <p>
                Tu tienda digital de videojuegos. Compra, descubre y disfruta
                los mejores títulos en un solo lugar.
              </p>
            </div>

            <div>
              <h6>Enlaces</h6>
              <ul>
                <li><a href="#home">Inicio</a></li>
                <li onClick={() => handleNavigation('/AllGame')}>Catálogo</li>
                <li><a href="#offers">Ofertas</a></li>
                <li onClick={() => handleNavigation('/soporte')}>Soporte</li>
              </ul>
            </div>

            <div>
              <h6>Legal</h6>
              <ul>
                <li 
                  className="clickable" 
                  onClick={() => openModal('terms')}
                >
                  Términos y condiciones
                </li>
                <li 
                  className="clickable" 
                  onClick={() => openModal('privacy')}
                >
                  Política de privacidad
                </li>
                <li 
                  className="clickable" 
                  onClick={() => openModal('copyright')}
                >
                  Derechos de autor
                </li>
              </ul>
            </div>

            <div>
              <h6>Síguenos</h6>
              <div className="footer-socials">
                <i className="bi bi-facebook"></i>
                <i className="bi bi-instagram"></i>
                <i className="bi bi-twitter-x"></i>
              </div>
            </div>

          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} GameStore. Desarrollado por <strong>Breixon</strong>. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* 🪟 MODAL LEGAL */}
      {modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Cerrar modal">
              <i className="bi bi-x-lg"></i>
            </button>
            <div 
              className="modal-body"
              dangerouslySetInnerHTML={{ __html: modalContent }}
            />
            <div className="modal-footer">
              <button className="ud-btn-primary" onClick={closeModal}>
                Entendido
              </button>
              {/* Botón para imprimir/guardar como PDF */}
              <button 
                className="btn btn-secondary" 
                onClick={() => window.print()}
              >
                <i className="bi bi-printer"></i> Guardar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}