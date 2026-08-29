const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'plataforma_juegos',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  ssl: {
    ca: process.env.DB_CA_CERT 
      ? process.env.DB_CA_CERT 
      : fs.readFileSync(path.join(__dirname, '../../../database/ca.pem'))
  }
};

const pool = mysql.createPool(dbConfig);

// Función para inicializar tablas y datos por defecto si es necesario
async function initDB() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la Base de Datos MySQL');

    // Asegurar que existan los roles base
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ROLES (
        id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    // Insertar roles iniciales si no existen
    await connection.query(`
      INSERT INTO ROLES (id_rol, nombre) VALUES (1, 'admin'), (2, 'cliente')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
    `);

    connection.release();
  } catch (error) {
    console.error('⚠️ Error al verificar/conectar con MySQL:', error.message);
  }
}

// Iniciar verificación en segundo plano al importar
initDB();

module.exports = pool;
