const IUserDAO = require('../../interfaces/IUserDAO');
const pool = require('../../config/db');

class UserDAO extends IUserDAO {
  async findById(id_usuario) {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.id_rol, r.nombre AS rol, u.nombre, u.nickname, u.email, u.avatar_url, u.creado_en
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [id_usuario]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  async findByNickname(nickname) {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       WHERE u.nickname = ?`,
      [nickname]
    );
    return rows[0] || null;
  }

  async create(userData) {
    const { id_rol = 2, nombre, nickname, email, password, avatar_url = null } = userData;
    const [result] = await pool.query(
      `INSERT INTO USUARIOS (id_rol, nombre, nickname, email, password, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_rol, nombre, nickname, email, password, avatar_url]
    );

    return this.findById(result.insertId);
  }

  async updateProfile(id_usuario, profileData) {
    const { nombre, nickname } = profileData;
    await pool.query(
      `UPDATE USUARIOS
       SET nombre = ?, nickname = ?
       WHERE id_usuario = ?`,
      [nombre, nickname, id_usuario]
    );
    return this.findById(id_usuario);
  }

  async updatePassword(id_usuario, hashedPassword) {
    const [result] = await pool.query(
      `UPDATE USUARIOS
       SET password = ?
       WHERE id_usuario = ?`,
      [hashedPassword, id_usuario]
    );
    return result.affectedRows > 0;
  }

  async updateAvatar(id_usuario, avatar_url) {
    await pool.query(
      `UPDATE USUARIOS
       SET avatar_url = ?
       WHERE id_usuario = ?`,
      [avatar_url, id_usuario]
    );

    return this.findById(id_usuario);
  }

  async setResetToken(email, tokenHash, expiresDate) {
    const [result] = await pool.query(
      `UPDATE USUARIOS
       SET reset_token_hash = ?, reset_expires = ?
       WHERE email = ?`,
      [tokenHash, expiresDate, email]
    );
    return result.affectedRows > 0;
  }

  async findByResetToken(tokenHash) {
    const [rows] = await pool.query(
      `SELECT * FROM USUARIOS
       WHERE reset_token_hash = ? AND reset_expires > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async getAllUsers() {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.nickname, u.email, u.avatar_url, r.nombre AS rol, u.creado_en
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       ORDER BY u.creado_en DESC`
    );
    return rows;
  }
}

module.exports = UserDAO;
