# 🎬 Sistema de Gestión de Cine

Sistema web fullstack para la gestión y catálogo de películas de un cine. Permite a administradores gestionar el contenido completo (películas, directores, actores, usuarios) y a usuarios regulares explorar el catálogo, ver detalles y escribir reseñas.

---

## 📋 Tabla de Contenidos

- [¿Para qué sirve?](#-para-qué-sirve)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [API - Endpoints Disponibles](#-api---endpoints-disponibles)
- [Cómo Usarlo](#-cómo-usarlo)
- [Roles y Permisos](#-roles-y-permisos)
- [Funcionalidades por Módulo](#-funcionalidades-por-módulo)

---

## 🎯 ¿Para qué sirve?

Este sistema permite:

- **Administradores**: Gestionar el catálogo completo de películas (CRUD), registrar directores y actores, administrar usuarios, y generar reportes en Excel/PDF con estadísticas de reseñas por género, película y usuario.
- **Usuarios registrados**: Navegar el catálogo de películas, ver detalles completos de cada película (sinopsis, director, actores, géneros, trailer) y escribir/gestionar sus propias reseñas con puntuación del 1 al 10.

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | LTS | Entorno de ejecución del servidor |
| **Express** | 5.x | Framework web para la API REST |
| **Sequelize** | 6.x | ORM para manejo de la base de datos |
| **mssql / tedious** | 11.x / 18.x | Driver de conexión a SQL Server |
| **JSON Web Token (JWT)** | 9.x | Autenticación y autorización de usuarios |
| **bcrypt** | 6.x | Hash de contraseñas |
| **dotenv** | 16.x | Gestión de variables de entorno |
| **cors** | 2.x | Habilitación de peticiones cross-origin |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19.x | Framework de interfaz de usuario |
| **React Router DOM** | 7.x | Enrutamiento de la SPA |
| **Bootstrap + React Bootstrap** | 5.x / 2.x | Componentes y estilos visuales |
| **Axios** | 1.x | Cliente HTTP para consumir la API |
| **jwt-decode** | 4.x | Decodificación del token JWT en el cliente |
| **jsPDF + jspdf-autotable** | 3.x | Generación de reportes en PDF |
| **xlsx** | 0.18.x | Exportación de reportes a Excel |
| **React Bootstrap Icons** | 1.x | Iconografía de la interfaz |

### Base de Datos

- **Microsoft SQL Server** (hospedado en `SQL1004.site4now.net`)
- Conexión por puerto **1433**

---

## 📁 Estructura del Proyecto

```
nuevo-crud-sqlserver/
├── backend/                        # Servidor Node.js / Express
│   ├── datos/
│   │   ├── modelodatosCINE.js      # Modelos Sequelize (tablas y relaciones)
│   │   ├── modelodatos.js          # Modelos alternativos
│   │   ├── loguearse.js            # Lógica auxiliar de autenticación
│   │   └── scripts.js              # Scripts SQL de utilidad
│   ├── server.js                   # Servidor principal con todos los endpoints
│   ├── package.json
│   └── .env                        # Variables de entorno (DB credentials)
│
├── frontend/                       # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── componenetes/           # Todos los componentes de la app
│   │   │   ├── CrudPeliculas.js    # Gestión completa de películas (Admin)
│   │   │   ├── Directores.js       # Gestión de directores (Admin)
│   │   │   ├── Actores.js          # Gestión de actores (Admin)
│   │   │   ├── GestionUsuario.js   # Gestión de usuarios (Admin)
│   │   │   ├── Reportes.js         # Reportes PDF/Excel (Admin)
│   │   │   ├── PeliculasUsuario.js # Catálogo de películas (Usuario)
│   │   │   ├── DetallePelicula.js  # Vista de detalle de una película
│   │   │   ├── Resenas.js          # Mis reseñas (Usuario)
│   │   │   ├── VerResenaUser.js    # Ver reseñas de un usuario (Admin)
│   │   │   ├── Login.js            # Pantalla de inicio de sesión
│   │   │   ├── RegistrarUsuarios.js# Registro de nuevos usuarios
│   │   │   ├── Inicio.js           # Pantalla de bienvenida
│   │   │   ├── Menu.js             # Menú de navegación lateral/superior
│   │   │   ├── Header.js           # Encabezado de la aplicación
│   │   │   ├── Footer.js           # Pie de página
│   │   │   ├── Precios.js          # Módulo de precios
│   │   │   ├── ReporteVentas.js    # Reporte de ventas
│   │   │   ├── Rutas.js            # Configuración de rutas (React Router)
│   │   │   └── css/                # Estilos CSS por componente
│   │   ├── api/                    # Configuración Axios / llamadas a la API
│   │   ├── App.js                  # Componente raíz
│   │   └── index.js                # Punto de entrada de React
│   └── package.json
│
└── README.md
```

---

## 🗄️ Modelo de Base de Datos

El sistema usa las siguientes tablas en SQL Server:

```
Roles           → Define los roles: Administrador / usuario
Usuarios        → Usuarios registrados (nombre, correo, contraseña hash, rol)
Directores      → Directores de cine (nombre, apellido, fecha de nacimiento)
Actores         → Actores (nombre, apellido, fecha de nacimiento)
Generos         → Géneros cinematográficos
Peliculas       → Catálogo de películas (título, sinopsis, año, director, poster, trailer, estado, calificación)
PeliculaGenero  → Relación N:N entre Peliculas y Generos
PeliculaActor   → Relación N:N entre Peliculas y Actores (incluye nombre del personaje)
Resenas         → Reseñas de usuarios sobre películas (puntuación 1-10, texto, estado)
```

### Diagrama de relaciones

```
Roles ──── Usuarios ──── Resenas ──── Peliculas ──── Directores
                                           │
                               ┌───────────┼───────────┐
                          PeliculaGenero  PeliculaActor
                               │                │
                            Generos           Actores
```

---

## 🔌 API - Endpoints Disponibles

### Autenticación (públicos)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/login` | Iniciar sesión, retorna JWT |
| `POST` | `/usuarios/registro` | Registrar nuevo usuario |

### Películas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/admin/peliculas` | Admin | Listar todas las películas |
| `GET` | `/peliculas/publicas` | Usuario | Listar películas publicadas |
| `GET` | `/peliculas/:id` | Autenticado | Ver detalle de una película |
| `POST` | `/peliculas/registro` | Admin | Crear nueva película |
| `PUT` | `/peliculas/actualizar/:id` | Admin | Actualizar película |
| `DELETE` | `/peliculas/eliminar/:id` | Admin | Eliminar película |
| `GET` | `/peliculas/:id/actores` | Autenticado | Actores de una película |
| `GET` | `/peliculas/:id/generos` | Autenticado | Géneros de una película |
| `POST` | `/peliculas/:id/generos` | Admin | Asignar géneros a película |
| `POST` | `/peliculas/:id/actores` | Admin | Asignar actores a película |

### Directores

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/directores` | Autenticado | Listar todos los directores |
| `GET` | `/directores/:id` | Autenticado | Ver director por ID |
| `POST` | `/directores` | Admin | Crear director |
| `PUT` | `/directores/:id` | Admin | Actualizar director |
| `DELETE` | `/directores/:id` | Admin | Eliminar director |

### Actores

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/actores` | Autenticado | Listar todos los actores |
| `GET` | `/actores/:id` | Autenticado | Ver actor por ID |
| `POST` | `/actores` | Admin | Crear actor |
| `PUT` | `/actores/:id` | Admin | Actualizar actor |
| `DELETE` | `/actores/:id` | Admin | Eliminar actor |

### Reseñas

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/resenas/usuario` | Usuario | Mis reseñas |
| `GET` | `/resenas/usuario/:id` | Admin | Reseñas de un usuario |
| `POST` | `/resenas` | Usuario | Crear reseña |
| `PUT` | `/resenas/:id` | Usuario | Actualizar reseña |
| `DELETE` | `/resenas/:id` | Usuario | Eliminar reseña |

### Géneros y Reportes

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `GET` | `/generos` | Autenticado | Listar todos los géneros |
| `GET` | `/reportes/resenas-por-pelicula` | Admin | Reporte: reseñas por película |
| `GET` | `/reportes/peliculas-genero/:idGenero` | Admin | Reporte: películas por género |

---

## 🚀 Cómo Usarlo

### Prerrequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Acceso a la base de datos SQL Server configurada en `.env`

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd nuevo-crud-sqlserver
```

### 2. Configurar el Backend

```bash
cd backend
```

Crear o verificar el archivo `.env` con las credenciales de base de datos:

```env
DB_SERVER=tu-servidor-sqlserver
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

Instalar dependencias e iniciar:

```bash
npm install
node server.js
```

> El backend quedará corriendo en **http://localhost:5000**

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
npm start
```

> El frontend quedará corriendo en **http://localhost:3001** (o el puerto que asigne React)

### 4. Acceder a la aplicación

Abrir el navegador en `http://localhost:3001`

- **Registro**: Crear una cuenta nueva en `/registro`
- **Login**: Iniciar sesión en `/`
- Usuarios con rol **Administrador** tendrán acceso al panel de gestión completo

---

## 👥 Roles y Permisos

| Funcionalidad | Usuario Regular | Administrador |
|---|:---:|:---:|
| Ver catálogo de películas | ✅ | ✅ |
| Ver detalle de película | ✅ | ✅ |
| Escribir reseñas | ✅ | ❌ |
| Gestionar mis reseñas | ✅ | ❌ |
| CRUD de películas | ❌ | ✅ |
| CRUD de directores | ❌ | ✅ |
| CRUD de actores | ❌ | ✅ |
| Gestión de usuarios | ❌ | ✅ |
| Ver reseñas de todos los usuarios | ❌ | ✅ |
| Generar reportes PDF/Excel | ❌ | ✅ |

---

## 📦 Funcionalidades por Módulo

### 🎬 Gestión de Películas (Admin — `/admin/peliculas`)
- Crear, editar y eliminar películas del catálogo
- Asignar director, géneros y actores con nombre de personaje
- Subir URL de poster y trailer
- Controlar estado: **Publicado** / **Borrador**
- Ver calificación promedio basada en reseñas de usuarios

### 🎭 Directores y Actores (Admin)
- CRUD completo de directores (`/admin/directores`)
- CRUD completo de actores (`/admin/actores`)
- Protección: no se puede eliminar un director/actor con películas asociadas

### 👤 Gestión de Usuarios (Admin — `/admin/usuarios`)
- Ver listado de todos los usuarios registrados
- Activar o desactivar cuentas

### 📊 Reportes (Admin — `/admin/reportes`)
- Reporte de reseñas por película
- Reporte de películas filtradas por género
- Exportación a **Excel** (xlsx) y **PDF** (jsPDF)

### 🍿 Catálogo de Películas (Usuario — `/peliculas`)
- Explorar todas las películas en estado Publicado
- Ver detalle completo: sinopsis, géneros, actores, director, trailer

### ⭐ Reseñas (Usuario — `/mis-resenas`)
- Escribir reseñas con título, texto y puntuación (1-10)
- Ver, editar y eliminar reseñas propias

---

## 🔐 Seguridad

- **Autenticación**: JWT con expiración de 24 horas
- **Autorización**: Middleware de verificación de token y rol en cada endpoint protegido
- **Rutas protegidas**: El frontend redirige automáticamente si el usuario no tiene el rol adecuado
- **Validaciones**: Campos obligatorios validados tanto en frontend como en backend

---

*Desarrollado para el Sistema de Gestión de Cine — Tecnología de Desarrollo Web - Universidad*
