const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserDAO = require('../dao/mysql/UserDAO');

const userDAO = new UserDAO();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_gamestore_2026';

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

const getDefaultAvatar = (user) => {
  const seed = user?.nickname || user?.nombre || 'User';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};

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

    // Asignar rol: 1 para admin si se especifica "admin", 2 para cliente
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userDAO.findByEmail(email);

    if (!user) {
      return res.status(444).json({ message: 'Si el correo existe, se enviará el enlace de recuperación.' });
    }

    // Generar token hash y vencimiento (1 hora)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1h

    await userDAO.setResetToken(email, tokenHash, expires);

    return res.json({
      message: 'Instrucciones de recuperación enviadas correctamente.',
      resetToken // Se devuelve para pruebas en entornos locales sin servidor SMTP
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    const user = await userDAO.findByResetToken(tokenHash);

    if (!user || user.email !== email) {
      return res.status(400).json({ message: 'Código o token de recuperación inválido o expirado' });
    }

    return res.json({ message: 'Código verificado exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userDAO.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await userDAO.updatePassword(user.id_usuario, hashedPassword);
    await userDAO.setResetToken(email, null, null);

    return res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    next(error);
  }
};
