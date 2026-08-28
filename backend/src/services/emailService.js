const nodemailer = require('nodemailer');

// Limpiar espacios de la contraseña de aplicación de Gmail si existen
const emailUser = process.env.EMAIL_USER || '';
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

/**
 * Envía un correo electrónico con el código de verificación para la recuperación de contraseña.
 * @param {string} toEmail - Correo del destinatario.
 * @param {string} code - Código OTP de 6 dígitos.
 * @param {string} nickname - Nickname o nombre del usuario.
 */
exports.sendPasswordResetEmail = async (toEmail, code, nickname = 'Gamer') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña - GameStore</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #09090e;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #f1f5f9;
        }
        .container {
          max-width: 580px;
          margin: 30px auto;
          background: #12121e;
          border: 1px solid rgba(124, 58, 237, 0.35);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b, #12121e);
          padding: 32px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #ffffff;
        }
        .header span {
          color: #a78bfa;
        }
        .body {
          padding: 32px 28px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 14px;
        }
        .text {
          font-size: 14px;
          line-height: 1.6;
          color: #94a3b8;
          margin-bottom: 24px;
        }
        .code-box {
          display: inline-block;
          background: rgba(124, 58, 237, 0.15);
          border: 2px dashed #7c3aed;
          border-radius: 14px;
          padding: 16px 36px;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #38bdf8;
          margin: 10px 0 24px 0;
          user-select: all;
        }
        .badge {
          display: inline-block;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .footer {
          background: rgba(0, 0, 0, 0.35);
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Game<span>Store</span></h1>
        </div>
        <div class="body">
          <div class="greeting">¡Hola, ${nickname}!</div>
          <p class="text">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>GameStore</strong>.
            Ingresa el siguiente código de verificación de 6 dígitos en la aplicación:
          </p>
          <div class="code-box">${code}</div>
          <br>
          <div class="badge">⏱️ Este código expira en 15 minutos</div>
          <p class="text" style="font-size: 12px; color: #64748b;">
            Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña permanecerá intacta.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Camero Tech Studio. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"GameStore Security" <${emailUser}>`,
    to: toEmail,
    subject: `🔐 Tu código de recuperación de GameStore: ${code}`,
    text: `Hola ${nickname},\n\nTu código de verificación de 6 dígitos para restablecer tu contraseña en GameStore es: ${code}\n\nEste código es válido por 15 minutos.\nSi no solicitaste este cambio, ignora este mensaje.`,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};
