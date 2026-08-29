const IUserDAO = require('../../interfaces/IUserDAO');
const pool = require('../../config/db');

/**
 * Data Access Object para gestión y persistencia de usuarios en MySQL.
 */
class UserDAO extends IUserDAO {
  /**
   * Busca un usuario por su identificador primario incluyendo su rol.
   */
  async findById(id_usuario) {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.nickname, u.email, u.avatar_url, u.creado_en
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [id_usuario]
    );
    return rows[0] || null;
  }

  /**
   * Busca un usuario por correo electrónico para autenticación y recuperación.
   */
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Busca un usuario por su nickname único.
   */
  async findByNickname(nickname) {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.nickname = ?`,
      [nickname]
    );
    return rows[0] || null;
  }

  /**
   * Inserta un nuevo registro de usuario y retorna la entidad creada.
   */
  async create(userData) {
    const { id_rol = 2, nombre, nickname, email, password, avatar_url = null } = userData;
    const [result] = await pool.query(
      `INSERT INTO usuarios (id_rol, nombre, nickname, email, password, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_rol, nombre, nickname, email, password, avatar_url]
    );

    return this.findById(result.insertId);
  }

  /**
   * Actualiza el nombre y nickname del usuario.
   */
  async updateProfile(id_usuario, profileData) {
    const { nombre, nickname } = profileData;
    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, nickname = ?
       WHERE id_usuario = ?`,
      [nombre, nickname, id_usuario]
    );
    return this.findById(id_usuario);
  }

  /**
   * Actualiza la contraseña hasheada del usuario.
   */
  async updatePassword(id_usuario, hashedPassword) {
    const [result] = await pool.query(
      `UPDATE usuarios
       SET password = ?
       WHERE id_usuario = ?`,
      [hashedPassword, id_usuario]
    );
    return result.affectedRows > 0;
  }

  /**
   * Actualiza la URL del avatar del usuario.
   */
  async updateAvatar(id_usuario, avatar_url) {
    await pool.query(
      `UPDATE usuarios
       SET avatar_url = ?
       WHERE id_usuario = ?`,
      [avatar_url, id_usuario]
    );

    return this.findById(id_usuario);
  }

  /**
   * Almacena el hash del token OTP y su fecha de expiración para recuperación.
   */
  async setResetToken(email, tokenHash, expiresDate) {
    const [result] = await pool.query(
      `UPDATE usuarios
       SET reset_token_hash = ?, reset_expires = ?
       WHERE email = ?`,
      [tokenHash, expiresDate, email]
    );
    return result.affectedRows > 0;
  }

  /**
   * Busca un usuario por hash de recuperación activo y no expirado.
   */
  async findByResetToken(tokenHash) {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios
       WHERE reset_token_hash = ? AND reset_expires > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  /**
   * Valida correo y código OTP comprobando que no haya expirado.
   */
  async verifyResetCode(email, tokenHash) {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios
       WHERE email = ? AND reset_token_hash = ? AND reset_expires > NOW()`,
      [email, tokenHash]
    );
    return rows[0] || null;
  }

  /**
   * Retorna la lista de todos los usuarios registrados ordenados por fecha.
   */
  async getAllUsers() {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.nickname, u.email, u.avatar_url, r.nombre AS rol, u.creado_en
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.creado_en DESC`
    );
    return rows;
  }
}

module.exports = UserDAO;
