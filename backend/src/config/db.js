const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Resolver la ruta del certificado CA (busca en backend/ca.pem o la raíz)
const resolveCert = () => {
  if (process.env.DB_CA_CERT) return process.env.DB_CA_CERT;
  
  const possiblePaths = [
    path.join(__dirname, '../ca.pem'),
    path.join(__dirname, '../../ca.pem'),
    path.join(__dirname, '../../../database/ca.pem'),
    path.join(process.cwd(), 'ca.pem')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }
  return undefined;
};

const cert = resolveCert();

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
  ...(cert && {
    ssl: {
      ca: cert,
      rejectUnauthorized: true
    }
  })
};

const pool = mysql.createPool(dbConfig);

// Inicializar y verificar conexión
async function initDB() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la Base de Datos MySQL en Aiven');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ROLES (
        id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      INSERT INTO ROLES (id_rol, nombre) VALUES (1, 'admin'), (2, 'cliente')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
    `);

    connection.release();
  } catch (error) {
    console.error('⚠️ Error al verificar/conectar con MySQL:', error.message);
  }
}

initDB();

module.exports = pool;