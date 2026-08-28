import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useToast } from "../../../context/useToast";
import { sanitizeInput } from "../../../utils/sanitizer";
import authService from "../../../services/authService";
import logoTitle from "../../../assets/logo/2.png";
import ForgotPasswordModal from "../Forgot/ForgotPasswordModal";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [nickname, setnickname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(name);
    const cleanNickname = sanitizeInput(nickname);
    const cleanPassword = password.trim();

    try {
      if (isRegister) {
        // Registro
        const response = await authService.register(cleanName, cleanNickname, cleanEmail, cleanPassword);
        login(response);
        showSuccess(`¡Bienvenido a GameStore, ${response.nickname || response.nombre}!`, 'Registro Exitoso');
        navigate(response.role === "admin" ? "/admin" : "/user");
      } else {
        // Login
        const response = await authService.login(cleanEmail, cleanPassword);
        login(response);
        showSuccess(`¡Hola de nuevo, ${response.nickname || response.nombre}!`, 'Sesión Iniciada');
        navigate(response.role === "admin" ? "/admin" : "/user");
      }
    } catch (error) {
      showError(error, isRegister ? "Error en el Registro" : "Error al Iniciar Sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMode = (registerMode) => {
    setIsRegister(registerMode);
    setShowPassword(false);
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="animated-bg"></div>

      {/* Barra superior con marca */}
      <header className="website-logo position-absolute top-0 start-0 mt-3 px-3 d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center gap-2">
          <img src={logoTitle} alt="GameStore Logo" className="img-fluid rounded-circle" width={40} height={40}/>
          <h3 className="text-white fw-bold m-0 fs-4">GameStore</h3>
        </div>
      </header>

      {/* Tarjeta simétrica Login / Register */}
      <main className="login-card-wrapper w-100 px-3">
        <div className="login-card p-4 p-md-5 mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-white fw-bold mb-2 fs-3">
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </h1>
            <p className="text-muted small m-0">
              {isRegister
                ? "Únete a GameStore y accede a tu biblioteca personalizada"
                : "Bienvenido de vuelta, accede a tus juegos favoritos"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {isRegister && (
              <>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control auth-input"
                    id="floatingName"
                    placeholder="Nombre Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingName">Nombre Completo</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control auth-input"
                    id="floatingNickname"
                    placeholder="Nickname de Jugador"
                    value={nickname}
                    onChange={(e) => setnickname(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingNickname">Nickname</label>
                </div>
              </>
            )}

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control auth-input"
                id="floatingEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="floatingEmail">Correo Electrónico</label>
            </div>

            <div className="form-floating position-relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control auth-input pe-5"
                id="floatingPassword"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="floatingPassword">Contraseña</label>
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn w-100 py-3 fw-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                isRegister ? "Registrarse en GameStore" : "Entrar a mi Cuenta"
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top border-secondary border-opacity-25">
            <small className="text-white d-block">
              {isRegister ? (
                <>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => handleToggleMode(false)}
                    className="switch-form-btn"
                  >
                    Inicia Sesión
                  </button>
                </>
              ) : (
                <>
                  ¿No tienes una cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => handleToggleMode(true)}
                    className="switch-form-btn"
                  >
                    Regístrate
                  </button>
                  <br />
                  <button
                    type="button"
                    className="forgot-link-btn mt-2"
                    onClick={() => setShowForgot(true)}
                  >
                    <i className="bi bi-question-circle me-1"></i> ¿Olvidaste tu contraseña?
                  </button>
                </>
              )}
            </small>
          </div>
        </div>
      </main>

      {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal
        show={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </div>
  );
}
