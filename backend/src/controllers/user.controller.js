const bcrypt = require('bcryptjs');
const UserDAO = require('../dao/mysql/UserDAO');
const FavoriteDAO = require('../dao/mysql/FavoriteDAO');
const LibraryDAO = require('../dao/mysql/LibraryDAO');
const PurchaseDAO = require('../dao/mysql/PurchaseDAO');

const userDAO = new UserDAO();
const favoriteDAO = new FavoriteDAO();
const libraryDAO = new LibraryDAO();
const purchaseDAO = new PurchaseDAO();

const getDefaultAvatar = (user) => {
  const seed = user?.nickname || user?.nombre || 'User';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userDAO.findById(req.user.id_usuario);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const avatarUrl = user.avatar_url || getDefaultAvatar(user);

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const parsedId = req.params.id ? parseInt(req.params.id, 10) : NaN;
    const userId = !Number.isNaN(parsedId) ? parsedId : req.user.id_usuario;

    // Solo el usuario dueño de la cuenta o un admin puede editar
    if (req.user.id_usuario !== userId && req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No tiene permiso para modificar este perfil' });
    }

    const { name, nombre, nickname, password } = req.body;
    const newName = name || nombre;

    const updatedUser = await userDAO.updateProfile(userId, {
      nombre: newName,
      nickname: nickname
    });

    // Si envió nueva contraseña válida
    if (password && typeof password === 'string' && password.trim() !== '' && password !== '********' && password !== '[PASSWORD]' && password.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);
      await userDAO.updatePassword(userId, hashedPassword);
    }

    const avatarUrl = updatedUser.avatar_url || getDefaultAvatar(updatedUser);

    res.json({
      message: 'Perfil actualizado con éxito',
      user: {
        id: updatedUser.id_usuario,
        id_usuario: updatedUser.id_usuario,
        name: updatedUser.nombre,
        nombre: updatedUser.nombre,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        role: updatedUser.rol,
        rol: updatedUser.rol,
        avatar: avatarUrl,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar_url } = req.body;
    if (!avatar_url || typeof avatar_url !== 'string' || avatar_url.trim() === '') {
      return res.status(400).json({ message: 'Se requiere una URL o identificador válido para el avatar' });
    }

    const cleanAvatarUrl = avatar_url.trim();
    const updatedUser = await userDAO.updateAvatar(req.user.id_usuario, cleanAvatarUrl);

    res.json({
      message: 'Avatar actualizado con éxito',
      avatar_url: updatedUser.avatar_url || cleanAvatarUrl,
      user: {
        id: updatedUser.id_usuario,
        id_usuario: updatedUser.id_usuario,
        name: updatedUser.nombre,
        nombre: updatedUser.nombre,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        role: updatedUser.rol,
        rol: updatedUser.rol,
        avatar: updatedUser.avatar_url || cleanAvatarUrl,
        avatar_url: updatedUser.avatar_url || cleanAvatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// FAVORITOS
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteDAO.getUserFavorites(req.user.id_usuario);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { id_juego, nombre, imagen_url } = req.body;
    if (!id_juego) {
      return res.status(400).json({ message: 'Se requiere id_juego' });
    }

    await favoriteDAO.addFavorite(req.user.id_usuario, {
      id_juego: Number(id_juego),
      nombre: nombre || `Juego #${id_juego}`,
      imagen_url
    });

    res.status(201).json({ message: 'Juego agregado a favoritos con éxito' });
  } catch (error) {
    next(error);
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.gameId, 10);
    await favoriteDAO.removeFavorite(req.user.id_usuario, gameId);
    res.json({ message: 'Favorito eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};

// BIBLIOTECA
exports.getLibrary = async (req, res, next) => {
  try {
    const library = await libraryDAO.getUserLibrary(req.user.id_usuario);
    res.json(library);
  } catch (error) {
    next(error);
  }
};

// COMPRAS / CHECKOUT
exports.getPurchases = async (req, res, next) => {
  try {
    const purchases = await purchaseDAO.getUserPurchases(req.user.id_usuario);
    res.json(purchases);
  } catch (error) {
    next(error);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'El carrito no contiene productos válidos' });
    }

    const result = await purchaseDAO.processCheckout(req.user.id_usuario, items);
    res.status(201).json({
      message: '¡Compra completada con éxito! Los juegos se agregaron a tu biblioteca.',
      purchase: result
    });
  } catch (error) {
    next(error);
  }
};
