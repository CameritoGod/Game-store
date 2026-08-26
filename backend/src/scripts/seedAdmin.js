const bcrypt = require('bcryptjs');
const pool = require('../config/db');

/**
 * Script de inicialización (Seed) para el usuario Administrador.
 * Verifica si ya existe un usuario con rol de Administrador (id_rol = 1) o email admin@gamestore.com.
 * Si no existe, genera el hash seguro con bcrypt e inserta el usuario en la base de datos.
 */
async function seedAdmin() {
  console.log('🌱 Iniciando script de inicialización de Administrador...');

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gamestore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminNickname = process.env.ADMIN_NICKNAME || 'admin';
    const adminNombre = process.env.ADMIN_NOMBRE || 'Administrador Principal';

    // 1. Verificar si ya existe un usuario administrador
    const [existingUsers] = await pool.query(
      `SELECT u.id_usuario, u.email, r.nombre AS rol
       FROM USUARIOS u
       JOIN ROLES r ON u.id_rol = r.id_rol
       WHERE u.email = ? OR u.id_rol = 1 OR u.nickname = ?`,
      [adminEmail, adminNickname]
    );

    if (existingUsers.length > 0) {
      console.log(`ℹ️ El usuario Administrador ya existe en la base de datos (${existingUsers[0].email}). Semilla omitida.`);
      process.exit(0);
    }

    // 2. Hashear la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Insertar el usuario Administrador (id_rol = 1)
    const [result] = await pool.query(
      `INSERT INTO USUARIOS (id_rol, nombre, nickname, email, password)
       VALUES (?, ?, ?, ?, ?)`,
      [1, adminNombre, adminNickname, adminEmail, hashedPassword]
    );

    console.log(`✅ ¡Usuario Administrador creado exitosamente!`);
    console.log(`   • ID Usuario: ${result.insertId}`);
    console.log(`   • Email: ${adminEmail}`);
    console.log(`   • Password: ${adminPassword} (Hasheada con bcrypt)`);
    console.log(`   • Rol: admin (id_rol: 1)`);

  } catch (error) {
    console.error('❌ Error en el script de seed para el Administrador:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedAdmin();
