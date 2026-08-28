import { useState, useEffect } from "react";
import authService from "../../../services/authService";
import { useToast } from "../../../context/useToast";
import { sanitizeInput } from "../../../utils/sanitizer";
import "./forgot.css";

export default function ForgotPasswordModal({ show, onClose }) {
  const [step, setStep] = useState("email"); // "email" | "code" | "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { showSuccess, showError, showWarning } = useToast();

  // Temporizador para el botón de reenvío de código
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Resetear estados al cerrar
  const handleModalClose = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setResendCooldown(0);
    onClose();
  };

  if (!show) return null;

  // ======================
  // 1. SOLICITAR CÓDIGO POR EMAIL
  // ======================
  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const cleanEmail = sanitizeInput(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      showWarning("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(cleanEmail);
      showSuccess(`Código de verificación enviado a ${cleanEmail}`, "Correo Enviado");
      setStep("code");
      setResendCooldown(60); // 60 segundos de espera para reenvío
    } catch (err) {
      showError(err, "Recuperación de Contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // 2. VERIFICAR CÓDIGO OTP
  // ======================
  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const cleanEmail = sanitizeInput(email);
    const cleanCode = sanitizeInput(code).trim();

    if (!cleanCode || cleanCode.length < 4) {
      showWarning("Por favor ingresa el código de verificación completo.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyCode(cleanEmail, cleanCode);
      showSuccess("Código verificado correctamente. Ahora define tu nueva contraseña.", "Código Válido");
      setStep("reset");
    } catch (err) {
      showError(err, "Código Inválido o Expirado");
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    const cleanEmail = sanitizeInput(email);
    setLoading(true);
    try {
      await authService.forgotPassword(cleanEmail);
      showSuccess(`Hemos reenviado un nuevo código a ${cleanEmail}`, "Código Reenviado");
      setResendCooldown(60);
    } catch (err) {
      showError(err, "Error al Reenviar");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // 3. CAMBIAR CONTRASEÑA
  // ======================
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    const cleanEmail = sanitizeInput(email);
    const cleanCode = sanitizeInput(code).trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPassword.length < 4) {
      showWarning("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      showWarning("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(cleanEmail, cleanCode, cleanPassword);
      showSuccess("¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.", "Contraseña Restablecida");
      handleModalClose();
    } catch (err) {
      showError(err, "Error al Cambiar Contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-backdrop" onClick={handleModalClose}>
      <div className="fp-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="fp-modal shadow-2xl">
          
          {/* HEADER */}
          <div className="fp-modal-header">
            <div className="fp-header-title">
              <div className="fp-icon-wrapper">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div>
                <h4 className="m-0 fw-bold text-white">Recuperar Contraseña</h4>
                <span className="fp-step-badge">
                  {step === "email" && "Paso 1: Identificación"}
                  {step === "code" && "Paso 2: Verificación OTP"}
                  {step === "reset" && "Paso 3: Nueva Contraseña"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="fp-close-btn"
              onClick={handleModalClose}
              aria-label="Cerrar modal"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* BODY */}
          <div className="fp-modal-body">

            {/* PASO 1: INGRESAR EMAIL */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="fp-form">
                <p className="fp-description text-center">
                  Ingresa el correo electrónico registrado en tu cuenta de <strong>GameStore</strong>. Te enviaremos un código de seguridad de 6 dígitos.
                </p>

                <div className="fp-input-group mb-4">
                  <span className="fp-input-icon">
                    <i className="bi bi-envelope-at-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control fp-input"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="fp-actions">
                  <button
                    type="submit"
                    className="btn fp-btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Enviar Código de Seguridad
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 2: INGRESAR CÓDIGO OTP */}
            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="fp-form">
                <div className="fp-email-pill text-center mb-3">
                  <i className="bi bi-envelope-check-fill text-info me-2"></i>
                  <span className="text-white small">Enviado a: <strong>{email}</strong></span>
                </div>

                <p className="fp-description text-center mb-3">
                  Ingresa el código numérico de 6 dígitos que enviamos a tu correo (válido por 15 minutos):
                </p>

                <div className="fp-otp-wrapper mb-3">
                  <input
                    type="text"
                    className="form-control fp-otp-input"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    required
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                  <button
                    type="button"
                    className="fp-link-btn"
                    onClick={() => setStep("email")}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Cambiar correo
                  </button>

                  <button
                    type="button"
                    className="fp-link-btn"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                  >
                    {resendCooldown > 0 ? (
                      <span className="text-muted">Reenviar en {resendCooldown}s</span>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-1"></i> Reenviar código
                      </>
                    )}
                  </button>
                </div>

                <div className="fp-actions">
                  <button
                    type="submit"
                    className="btn fp-btn-primary w-100"
                    disabled={loading || code.length < 4}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verificando código...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Verificar Código
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: NUEVA CONTRASEÑA */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="fp-form">
                <p className="fp-description text-center mb-3">
                  Crea una nueva contraseña segura para tu cuenta.
                </p>

                {/* NUEVA CONTRASEÑA */}
                <div className="fp-password-wrapper mb-3">
                  <span className="fp-input-icon">
                    <i className="bi bi-key-fill"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control fp-input"
                    placeholder="Nueva contraseña (mínimo 4 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="fp-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                  </button>
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div className="fp-password-wrapper mb-4">
                  <span className="fp-input-icon">
                    <i className="bi bi-check2-circle"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control fp-input"
                    placeholder="Confirma la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="fp-eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                  </button>
                </div>

                <div className="fp-actions">
                  <button
                    type="submit"
                    className="btn fp-btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Actualizando contraseña...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Restablecer Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
