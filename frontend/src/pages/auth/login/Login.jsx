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
      console.error("Error de autenticación", error);
      showError(error, isRegister ? "Error en el Registro" : "Error al Iniciar Sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
  <div className="animated-bg"></div>

  {/* Nombre de la web en la esquina superior izquierda */}
  <div className="website-logo position-absolute top-0 start-0 mt-3 px-2 d-flex align-items-center justify-content-between w-100">
    <div>
      <h3 className="text-white fw-bold">GameStore</h3>
    </div>
    <div>
      <a href="">
        <img src={logoTitle} alt="Logo" className="img-fluid rounded-circle" width={50}/>
      </a>
    </div>
  </div>

  <div
    className={`card login-card p-4 shadow-lg bg-dark ${
      isRegister ? "register-active" : ""
    }`}
  >
    <h2 className="text-white text-center mb-2">
      {isRegister ? "Registrarse" : "Iniciar Sesión"}
    </h2>
    <p className="text-white text-center mb-4">
      {isRegister
        ? "Crea tu cuenta para acceder a tu biblioteca"
        : "Accede a tu biblioteca de juegos"}
    </p>

    <form onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              id="floatingName"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="floatingName" className="text-white">
              Nombre
            </label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              id="floatingName"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setnickname(e.target.value)}
              required
            />
            <label htmlFor="floatingName" className="text-white">
              Nickname
            </label>
          </div>
        </>
      )}

      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control bg-dark text-white border-secondary"
          id="floatingEmail"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingEmail" className="text-white">
          Email
        </label>
      </div>

      <div className="form-floating mb-4">
        <input
          type="password"
          className="form-control bg-dark text-white border-secondary"
          id="floatingPassword"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword" className="text-white">
          Contraseña
        </label>
      </div>

      <button type="submit" className="btn btn-primary w-100 py-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
          </>
        ) : (
          isRegister ? "Registrarse" : "Entrar"
        )}
      </button>
    </form>

    <div className="text-center mt-3">
      <small className="text-white d-block text-center">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <a
              href="#"
              onClick={() => setIsRegister(false)}
              className="switch-form"
            >
              Iniciar Sesión
            </a>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{" "}
            <a
              href="#"
              onClick={() => setIsRegister(true)}
              className="switch-form"
            >
              Regístrate
            </a>
            <br />
            <a
              href="#"
              className="text-info mt-1 d-inline-block"
              onClick={() => setShowForgot(true)}
            >
              ¿Olvidaste tu contraseña?
            </a>
                    
            <ForgotPasswordModal
              show={showForgot}
              onClose={() => setShowForgot(false)}
            />
          </>
        )}
      </small>
    </div>
  </div>
</div>
  );
}
