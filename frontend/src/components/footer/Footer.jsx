import './footer.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
  };

  //  Contenido de Términos y Condiciones
  const termsContent = `
    <h3>📋 Términos y Condiciones</h3>
    <ul>
      <li>✅ El sitio web es de <strong>uso totalmente gratuito</strong>.</li>
      <li>✅ Este sitio fue desarrollado como <strong>proyecto de práctica y portafolio</strong>.</li>
      <li>✅ El sitio web me pertenece y está protegido por derechos de autor.</li>
      <li>⚠️ El sitio <strong>no cuenta con seguridad robusta</strong>. No me hago responsable si se ingresan datos sensibles.</li>
      <li>✅ El sitio <strong>no requiere datos sensibles</strong>, solo un correo electrónico válido para registro.</li>
      <li>✅ Los pagos con tarjeta de crédito son <strong>simulados</strong>. No se solicitan ni almacenan datos reales.</li>
      <li>✅ Este proyecto fue desarrollado por <strong>Breixon</strong> como prueba técnica para su portafolio profesional.</li>

      <!-- 🎮 NUEVO: Atribución RAWG API -->
      <li class="mt-3 pt-3 border-top border-secondary">
        <i class="bi bi-database text-info"></i> 
        <strong>Fuente de datos de juegos:</strong> 
        La información de videojuegos (títulos, imágenes, descripciones, géneros y calificaciones) es proporcionada por la API de 
        <a href="https://rawg.io" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
          <strong>RAWG.io</strong>
        </a>. 
        Este sitio no está afiliado ni endosado por RAWG. Todos los derechos de los datos pertenecen a sus respectivos propietarios.
      </li>
    </ul>
    <p class="mt-3 text-white"><small>Última actualización: ${new Date().toLocaleDateString('es-ES')}</small></p>
  `;

  // 🔒 Contenido de Política de Privacidad
  const privacyContent = `
    <h3>🔒 Política de Privacidad</h3>
    <ul>
      <li><i class="bi bi-lock-fill text-warning"></i> <strong>Correo electrónico:</strong> Solo utilizamos tu email para crear tu cuenta y comunicarnos contigo. No lo compartimos con terceros.</li>
      <li><i class="bi bi-shield-lock-fill text-warning"></i> <strong>Datos sensibles:</strong> Este sitio NO solicita ni almacena información sensible como tarjetas de crédito, documentos de identidad o direcciones físicas.</li>
      <li><i class="bi bi-controller text-white"></i> <strong>Datos de juego:</strong> Guardamos tu historial de compras simuladas y preferencias para mejorar tu experiencia.</li>
      <li><i class="bi bi-globe text-white"></i> <strong>Cookies:</strong> Usamos cookies técnicas para mantener tu sesión activa. No usamos cookies de rastreo publicitario.</li>
      <li><i class="bi bi-trash text-danger"></i> <strong>Eliminación de datos:</strong> Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactando al desarrollador.</li>
      <li><i class="bi bi-exclamation-triangle text-warning"></i> <strong>Advertencia de seguridad:</strong> Al ser un proyecto de portafolio, no garantiza niveles de seguridad de producción. No ingreses información confidencial.</li>
    </ul>
    <p class="mt-3 text-white"><small>Última actualización: 28/02/2025</small></p>
  `;

  // © Derechos de autor
  const copyrightContent = `
    <h3>© Derechos de Autor</h3>
    <p>Este sitio web y todo su contenido (código, diseño, textos y elementos visuales) son propiedad intelectual de:</p>
    <p class="text-center fw-bold mt-3"><i class="bi bi-person-circle text-white"></i> <strong>Breixon Camero Dev</strong></p>
    <p class="text-center">Desarrollador Full Stack</p>
    <hr/>
    <p><strong><i class="bi bi-person-rolodex text-white"></i> Contacto:</strong> breixonalejandro29c@gmail.com</p>
    <p><strong><i class="bi bi-suitcase-lg-fill text-white"></i> Portafolio:</strong> <a href="https://camerodev.com" target="_blank">CameroDev.com</a></p>
    <p><strong><i class="bi bi-github text-white"></i> GitHub:</strong> <a href="https://github.com/CameritoGod" target="_blank">BreixonCamero</a></p>
    <p class="mt-3 text-white"><small>Todos los derechos reservados. Prohibida la reproducción total o parcial sin autorización escrita.</small></p>
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
            <button className="modal-close" onClick={closeModal}>
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