import { useState } from "react";
import authService from "../../../services/authService";
import { useToast } from "../../../context/useToast";
import { sanitizeInput } from "../../../utils/sanitizer";
import "./forgot.css";

export default function ForgotPasswordModal({ show, onClose }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  if (!show) return null;

  // ======================
  // PEDIR CÓDIGO
  // ======================
  const handleEmailSubmit = async () => {
    if (loading) return;
    const cleanEmail = sanitizeInput(email);
    if (!cleanEmail) {
      showWarning("Por favor ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(cleanEmail);
      setNickname(res.nickname);
      setStep("confirm");
      showSuccess("Código de verificación enviado correctamente");
    } catch (err) {
      showError(err, "Recuperación de contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // VERIFICAR CÓDIGO
  // ======================
  const handleVerifyCode = async () => {
    if (loading) return;
    const cleanEmail = sanitizeInput(email);
    const cleanCode = sanitizeInput(code);

    if (!cleanCode) {
      showWarning("Por favor ingresa el código de verificación.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyCode(cleanEmail, cleanCode);
      setStep("reset");
      showSuccess("Código verificado exitosamente");
    } catch (err) {
      showError(err, "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // CAMBIAR CONTRASEÑA
  // ======================
  const handleResetPassword = async () => {
    if (loading) return;
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPassword !== cleanConfirm) {
      return showWarning("Las contraseñas ingresadas no coinciden.");
    }
    if (cleanPassword.length < 4) {
      return showWarning("La contraseña debe tener al menos 4 caracteres.");
    }

    setLoading(true);
    try {
      await authService.resetPassword(cleanEmail, cleanPassword);
      showSuccess("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      onClose();
    } catch (err) {
      showError(err, "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-backdrop">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content fp-modal">

          {/* HEADER */}
          <div className="modal-header border-1 border-primary">
            <h5 className="modal-title fw-bold text-center w-100 gap-6">
              <i className="bi bi-lock-fill"></i> Recuperación de contraseña{" "}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body px-4 pb-4 d-flex flex-column justify-content-center align-items-center">

            {/* PASO 1 */}
            {step === "email" && (
              <>
                <p className="text-white text-center mb-4">
                  Ingresa tu correo para enviarte un código de verificación
                </p>

                <input
                  className="form-control mb-3"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn fp-btn w-50"
                  onClick={handleEmailSubmit}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </>
            )}

            {/* PASO 2 */}
            {step === "confirm" && (
              <>
                <div className="text-center mb-3">
                  <p className="text-info mb-1">Cuenta encontrada</p>
                  <h5 className="fw-bold">{nickname}</h5>
                </div>

                <p className="text-center text-white">
                  ¿Esta es tu cuenta?
                </p>

                <button
                  className="btn fp-btn w-100"
                  onClick={() => setStep("code")}
                >
                  Sí, continuar
                </button>
              </>
            )}

            {/* PASO 3 */}
            {step === "code" && (
              <>
                <p className="text-white text-center mb-4">
                  Ingresa el código que enviamos a tu correo
                </p>

                <input
                  className="form-control mb-3 text-center fs-5"
                  placeholder="Código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <button
                  className="btn fp-btn w-100"
                  onClick={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </button>
              </>
            )}

            {/* PASO 4 */}
            {step === "reset" && (
              <>
                <p className="text-white text-center mb-4">
                  Crea una nueva contraseña segura
                </p>

                {/* PASSWORD */}
                <div className="fp-password-wrapper mb-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Nueva contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} fp-eye`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="fp-password-wrapper mb-3">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirmar contraseña"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <i
                    className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} fp-eye`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></i>
                </div>

                <button
                  className="btn fp-btn w-50"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Cambiar contraseña"}
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
