/**
 * Contrato Interface base para IUserDAO.
 * Lanzará un error si un método no es sobreescrito por una implementación concreta.
 */
class IUserDAO {
  async findById(id_usuario) {
    throw new Error("Method findById() not implemented");
  }

  async findByEmail(email) {
    throw new Error("Method findByEmail() not implemented");
  }

  async findByNickname(nickname) {
    throw new Error("Method findByNickname() not implemented");
  }

  async create(userData) {
    throw new Error("Method create() not implemented");
  }

  async updateProfile(id_usuario, profileData) {
    throw new Error("Method updateProfile() not implemented");
  }

  async updatePassword(id_usuario, hashedPassword) {
    throw new Error("Method updatePassword() not implemented");
  }

  async updateAvatar(id_usuario, avatar_url) {
    throw new Error("Method updateAvatar() not implemented");
  }

  async setResetToken(email, tokenHash, expiresDate) {
    throw new Error("Method setResetToken() not implemented");
  }

  async findByResetToken(tokenHash) {
    throw new Error("Method findByResetToken() not implemented");
  }

  async getAllUsers() {
    throw new Error("Method getAllUsers() not implemented");
  }
}

module.exports = IUserDAO;
