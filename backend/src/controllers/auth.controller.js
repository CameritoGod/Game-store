const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserDAO = require('../dao/mysql/UserDAO');
const emailService = require('../services/emailService');

const userDAO = new UserDAO();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_gamestore_2026';

/**
 * Genera un token JWT firmado con los datos de rol e identidad del usuario.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id_usuario: user.id_usuario,
      nickname: user.nickname,
      email: user.email,
      rol: user.rol,
      id_rol: user.id_rol
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Retorna URL de avatar DiceBear predeterminado para el usuario.
 */
const getDefaultAvatar = (user) => {
  const seed = user?.nickname || user?.nombre || 'User';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * Registra un nuevo usuario con contraseña hasheada y asignación de rol.
 */
exports.register = async (req, res, next) => {
  try {
    const { nombre, nickname, email, password, rol } = req.body;

    if (!nombre || !nickname || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados' });
    }

    const existingEmail = await userDAO.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const existingNickname = await userDAO.findByNickname(nickname);
    if (existingNickname) {
      return res.status(400).json({ message: 'El nickname ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const id_rol = rol === 'admin' ? 1 : 2;

    const newUser = await userDAO.create({
      id_rol,
      nombre,
      nickname,
      email,
      password: hashedPassword
    });

    const token = generateToken(newUser);
    const avatarUrl = newUser.avatar_url || getDefaultAvatar(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id_usuario,
        id_usuario: newUser.id_usuario,
        name: newUser.nombre,
        nombre: newUser.nombre,
        nickname: newUser.nickname,
        email: newUser.email,
        role: newUser.rol,
        rol: newUser.rol,
        avatar: avatarUrl,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Autentica al usuario validando correo y contraseña con bcrypt.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Proporcione email y contraseña' });
    }

    const user = await userDAO.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    const avatarUrl = user.avatar_url || getDefaultAvatar(user);

    return res.json({
      token,
      user: {
        id: user.id_usuario,
        id_usuario: user.id_usuario,
        name: user.nombre,
        nombre: user.nombre,
        nickname: user.nickname,
        email: user.email,
        role: user.rol,
        rol: user.rol,
        avatar: avatarUrl,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera código OTP de 6 dígitos con hash SHA-256 y lo envía por correo electrónico.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim();
    const user = await userDAO.findByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({ message: 'No encontramos ninguna cuenta asociada a este correo electrónico.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await userDAO.setResetToken(cleanEmail, tokenHash, expires);

    try {
      await emailService.sendPasswordResetEmail(cleanEmail, code, user.nickname || user.nombre);
    } catch {
      return res.status(500).json({ message: 'Error al enviar el correo de recuperación. Revisa la configuración del servidor.' });
    }

    return res.json({
      message: 'Código de verificación enviado correctamente a tu correo.',
      email: cleanEmail,
      nickname: user.nickname || user.nombre
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Valida si el código OTP suministrado coincide y está vigente.
 */
exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    const tokenHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    const user = await userDAO.verifyResetCode(cleanEmail, tokenHash);

    if (!user) {
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado.' });
    }

    return res.json({
      message: 'Código verificado exitosamente.',
      valid: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza la contraseña del usuario tras validar el código OTP.
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    const tokenHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    const user = await userDAO.verifyResetCode(cleanEmail, tokenHash);

    if (!user) {
      return res.status(400).json({ message: 'El código de verificación es inválido o ha expirado. Solicita uno nuevo.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    await userDAO.updatePassword(user.id_usuario, hashedPassword);
    await userDAO.setResetToken(cleanEmail, null, null);

    return res.json({ message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};
