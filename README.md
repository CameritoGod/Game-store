<div align="center">

# 🎮 GameStore — Full-Stack Video Game E-Commerce & Management Platform

**Plataforma web Full-Stack moderna para la exploración, comercialización y gestión de videojuegos digitales.**  
Desarrollada bajo una arquitectura desacoplada por capas con **React**, **Node.js**, **Express**, **MySQL (Patrón DAO)** y consumo en tiempo real de la **API oficial de IGDB**.

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![IGDB](https://img.shields.io/badge/API-Twitch_IGDB_v4-9146FF?style=flat-square&logo=twitch&logoColor=white)](https://api-docs.igdb.com/)
[![Security](https://img.shields.io/badge/Security-Helmet_|_RateLimit_|_XSS_|_Bcrypt-E53E3E?style=flat-square&logo=shield)](https://expressjs.com/)

[**Explorar Demo en Vivo**](https://gamestore-demo.vercel.app) • [**Reportar Inconveniente**](https://github.com/CameritoGod/Game-store/issues)

</div>

---

## 📑 Tabla de Contenidos

- [📌 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏛️ Arquitectura de Software y Principios SOLID](#️-arquitectura-de-software-y-principios-solid)
- [🛡️ Ciberseguridad y Blindaje Defensivo](#️-ciberseguridad-y-blindaje-defensivo)
- [👥 Roles de Usuario y Flujos del Sistema](#-roles-de-usuario-y-flujos-del-sistema)
- [🔑 Credenciales de Prueba (Demo / Sandbox)](#-credenciales-de-prueba-demo--sandbox)
- [🚀 Instalación y Despliegue Local](#-instalación-y-despliegue-local)
- [📂 Estructura del Repositorio](#-estructura-del-repositorio)

---

## 📌 Descripción del Proyecto

**GameStore** es una plataforma e-commerce de alto rendimiento orientada a la comercialización y consumo de videojuegos. Resuelve el desafío de combinar **millones de metadatos actualizados** de la industria del gaming (carátulas en alta resolución, capturas de pantalla, puntuaciones agregadas, fechas de lanzamiento y géneros) provistos por la API de **IGDB/Twitch**, con un **motor transaccional propio** en MySQL que gestiona usuarios, catálogo de precios, campañas de descuento, favoritos, librerías digitales y órdenes de compra con garantías ACID.

Diseñada con un enfoque centrado en la experiencia de usuario (**UX/UI**), implementa una interfaz *Glassmorphic* oscura, animaciones fluidas, notificaciones globales tipo Toast y un sistema de galería interactiva de avatares con **DiceBear**.

---

## ✨ Características Principales

- 🔍 **Buscador Inteligente con Algoritmo de Relevancia**: Ponderación en 4 niveles (coincidencia exacta, prefijo, categoría principal y volumen de valoraciones) con *debounce* de 400ms y almacenamiento en memoria caché.
- 🏷️ **Motor Dinámico de Descuentos y Precios Deterministas**: Cálculo automático de precios comerciales y aplicación en tiempo real de campañas de oferta por rangos de fecha (`fecha_inicio` / `fecha_fin`).
- 🛒 **Carrito de Compras Reactivo**: Sincronización en `localStorage`, cálculo en tiempo real de subtotales, ahorro total por descuentos y valor neto a pagar.
- 💳 **Pasarela de Pago Simulada**: Procesamiento visual en 3 pasos con confirmación de licencia y generación de identificadores de transacción.
- 📚 **Biblioteca Personal Digital**: Los títulos adquiridos se integran permanentemente a la biblioteca del cliente con bloqueo de compra duplicada.
- 📬 **Recuperación de Contraseña con Nodemailer**: Envío de códigos de seguridad OTP de 6 dígitos mediante transporte SMTP Gmail con hash SHA-256 y expiración automática en 15 minutos.
- 📊 **Panel de Administración (Backoffice)**: Visualización de KPIs de negocio (ingresos totales, ventas del mes, ticket promedio, juego más vendido), gestión del catálogo y creación/eliminación de descuentos.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** + **Vite 7**: Rendimiento extremo con compilación instantánea y soporte SPA.
- **React Router DOM 7**: Enrutamiento declarativo y protección de rutas privadas por rol.
- **Context API (`useAuth`, `useCart`, `useToast`)**: Gestión global del estado sin dependencias pesadas.
- **Framer Motion**: Micro-interacciones y animaciones de entrada fluidas.
- **Vanilla CSS3 Moderno**: Variables personalizadas, *glassmorphism*, efectos *backdrop-filter* y diseño 100% responsivo.
- **DiceBear API**: Generación dinámica y previsualización de avatares SVG estilo *Bottts* y *Adventurer*.

### Backend
- **Node.js** + **Express**: Servidor REST estructurado y modular.
- **MySQL2/Promise**: Conexión a base de datos relacional mediante *Connection Pool*.
- **JSON Web Tokens (JWT)** + **Bcrypt.js**: Autenticación stateless y hashing seguro de credenciales (10 rondas de salt).
- **Nodemailer**: Integración de correo electrónico transaccional con plantillas HTML personalizadas.
- **Helmet**, **HPP** y **Express-Rate-Limit**: Capas defensivas contra vulnerabilidades web comunes.
- **Axios** + **Apicalypse (IGDB)**: Consumo optimizado con cabeceras de autorización Twitch OAuth2.

---

## 🏛️ Arquitectura de Software y Principios SOLID

El Backend fue construido siguiendo una arquitectura desacoplada por capas:

```
[ Cliente HTTP / Frontend React ]
               │
               ▼
[ Middleware de Seguridad (Helmet, CORS, RateLimit, Sanitize) ]
               │
               ▼
[ Capa de Rutas (games, auth, user, admin) ]
               │
               ▼
[ Capa de Controladores (Auth, Games, User, Admin) ]
        │                             │
        ▼                             ▼
[ Capa de Servicios ]        [ Interfaces / Contratos DAO ]
(IGDB, PriceService, Email)           │
                                      ▼
                             [ Implementación DAO MySQL ]
                                      │
                                      ▼
                             [ Base de Datos MySQL ]
```

### Principios Aplicados:
1. **Separación de Responsabilidades (SRP)**: Los controladores delegan la lógica matemática a `PriceService`, la entrega de correos a `EmailService` y la persistencia a los DAOs.
2. **Inversión de Dependencias (DIP)**: Los controladores consumen las clases DAO a través de interfaces formales (`IUserDAO`, `IPurchaseDAO`, `IDiscountDAO`, `ICatalogDAO`, etc.), permitiendo sustituir el motor de persistencia sin alterar la lógica de negocio.
3. **Transacciones ACID**: El proceso de compra ejecuta transacciones atómicas (`beginTransaction` -> `commit` / `rollback`), garantizando que la inserción de cabecera de orden, partidas de compra y asignación en biblioteca ocurran de forma indivisible.

---

## 🛡️ Ciberseguridad y Blindaje Defensivo

| Amenaza / Vector de Ataque | Solución Implementada |
| :--- | :--- |
| **SQL Injection (SQLi)** | 100% de consultas preparadas y parametrizadas (`?`) en todos los DAOs de MySQL. |
| **Cross-Site Scripting (XSS)** | Sanitización defensiva en Frontend (`sanitizer.js`) y middleware global en Express para sanear cadenas. |
| **Fuerza Bruta & Spam** | `express-rate-limit` con límites dedicados: `authLimiter` (10 req/15min), `checkoutLimiter` (10 req/15min) y `searchLimiter` (100 req/min). |
| **Parameter Pollution (HPP)** | Middleware `hpp` para neutralizar inyecciones de parámetros duplicados en query strings. |
| **Secuestro de Cabeceras** | `helmet` configurado con políticas estrictas de seguridad (noSniff, xssFilter, hidePoweredBy). |
| **Fugas de Información en Cliente** | Consola del navegador completamente saneada (0 logs expuestos) y respuestas de error neutralizadas. |

---

## 👥 Roles de Usuario y Flujos del Sistema

### 1. Rol Cliente
- **Exploración**: Navegación por catálogo con paginación, filtros por género y año de lanzamiento.
- **Detalle de Juego**: Sinopsis completa, capturas en alta resolución, valoraciones y botón de favoritos.
- **Carrito y Checkout**: Adición reactiva con detección automática de ofertas, desglose de ahorro y pasarela.
- **Biblioteca**: Acceso a los juegos adquiridos con badge de posesión permanente.
- **Perfil**: Edición de datos personales, cambio de contraseña y personalización de avatar con DiceBear.

### 2. Rol Administrador
- **Dashboard de Métricas**: Monitor de ingresos totales, ventas del mes, ticket promedio y usuarios activos.
- **Catálogo Comercial**: Fijación de precios personalizados y activación/pausa de visibilidad de títulos.
- **Gestor de Descuentos**: Creación de campañas promocionales con porcentaje, fechas de vigencia y asignación múltiple de juegos.
- **Historial Global**: Auditoría integral de todas las compras realizadas en la plataforma.

---

## 🔑 Credenciales de Prueba (Demo / Sandbox)

Para facilitar la revisión del proyecto, se incluyen las siguientes cuentas de prueba:

### 👑 Cuenta Administrador
- **Correo Electrónico**: `admin@gamestore.com`
- **Contraseña**: `Admin123!`
- **Rol**: `admin` *(Acceso completo al Backoffice y Panel de Administración)*

### 🎮 Cuenta Cliente Estándar
- **Correo Electrónico**: `gamer@gamestore.com`
- **Contraseña**: `Gamer123!`
- **Rol**: `cliente` *(O crea tu propia cuenta desde el formulario de registro)*

---

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
- [Node.js](https://nodejs.org/) (Versión 18 o superior)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (Versión 8.0+)
- Cuenta de desarrollador en [Twitch Developer Portal](https://dev.twitch.tv/) *(para credenciales de IGDB)*

### 1. Clonar el Repositorio
```bash
git clone https://github.com/CameritoGod/Game-store.git
cd Game-store
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

Crea el archivo `.env` tomando como base `.env.example`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Credenciales de IGDB (Twitch Developer)
IGDB_CLIENT_ID=tu_client_id
IGDB_CLIENT_SECRET=tu_client_secret

# Base de Datos MySQL
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=game_store_v2
DB_PORT=3306

# Clave Secreta JWT
JWT_SECRET=tu_clave_secreta_jwt

# Credenciales SMTP Gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

Ejecuta el script de semilla para inicializar roles y crear el usuario administrador:
```bash
npm run seed
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```

### 3. Configurar el Frontend
En otra terminal:
```bash
cd ../frontend
npm install
```

Crea el archivo `.env` con la URL del API:
```env
VITE_API_URL=http://localhost:5000/api
```

Inicia el entorno de desarrollo:
```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

---

## 📂 Estructura del Repositorio

```
Game-store/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión al Pool de MySQL
│   │   ├── controllers/     # Controladores (Auth, Games, User, Admin)
│   │   ├── dao/             # Data Access Objects (MySQL)
│   │   ├── interfaces/      # Contratos e Interfaces de los DAOs
│   │   ├── middleware/      # Seguridad, Rate Limiter, Sanitización y Errores
│   │   ├── routes/          # Definición de rutas del API Express
│   │   ├── scripts/         # Scripts de inicialización y seeds
│   │   ├── services/        # Servicios (IGDB, PriceService, EmailService)
│   │   └── utils/           # Utilidades y caché en memoria
│   ├── .env.example
│   ├── package.json
│   └── server.js            # Punto de entrada del servidor Backend
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Clientes Axios estructurados
│   │   ├── assets/          # Fuentes, imágenes y recursos estáticos
│   │   ├── auth/            # Contexto y hooks de autenticación
│   │   ├── components/      # Componentes reutilizables (Navbar, Cards, Modales)
│   │   ├── context/         # CartContext, ToastContext y estados globales
│   │   ├── pages/           # Vistas (Home, AllGames, GameDetail, Auth, Dashboards)
│   │   ├── services/        # Servicios de autenticación en frontend
│   │   └── utils/           # Sanitizadores de input y utilidades de avatar
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js       # Configuración de empaquetado con Vite
│
└── README.md
```

---

## 👨‍💻 Autor

**Breixon Camero**  
*Desarrollador Full-Stack & Diseñador de Soluciones Web*  
- GitHub: [@CameritoGod](https://github.com/CameritoGod)
- Proyecto: [Game-store Repository](https://github.com/CameritoGod/Game-store)

---

<div align="center">
  <sub>Construido con pasión por los videojuegos y las mejores prácticas de ingeniería de software.</sub>
</div>
