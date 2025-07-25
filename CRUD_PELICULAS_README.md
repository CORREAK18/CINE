# CRUD de Películas - Sistema de Cine

## Funcionalidades Implementadas

### ✅ CRUD Completo de Películas
- **Crear**: Agregar nuevas películas al catálogo
- **Leer**: Visualizar todas las películas con información detallada
- **Actualizar**: Editar información de películas existentes
- **Eliminar**: Remover películas del catálogo

### 🎯 Características del CRUD

#### 1. **Listado de Películas**
- Tabla responsive con todas las películas del sistema
- Información mostrada:
  - ID de la película
  - Título
  - Año de estreno
  - Director asignado
  - Estado (Publicado/Borrador)
  - Calificación promedio
  - Acciones (Editar/Eliminar)

#### 2. **Formulario de Película**
- **Campos obligatorios:**
  - Título de la película
  - Año de estreno
- **Campos opcionales:**
  - Sinopsis
  - Director (selección desde dropdown)
  - URL del poster
  - URL del trailer
  - Fecha de publicación
  - Estado (Publicado/Borrador)
  - Calificación promedio

#### 3. **Validaciones**
- Año de estreno entre 1900 y año actual
- Formato de URL válido para poster y trailer
- Campos obligatorios marcados con asterisco (*)

## 🔧 Implementación Técnica

### Frontend (React)
- **Componente**: `CrudPeliculas.js`
- **Ubicación**: `/src/componenetes/CrudPeliculas.js`
- **Estilos**: `/src/componenetes/css/crudpeliculas.css`
- **Tecnologías**: React, React Bootstrap, useState, useEffect

### Backend (Node.js)
- **Endpoints implementados**:
  - `GET /admin/peliculas` - Obtener todas las películas (solo admin)
  - `POST /peliculas/registro` - Crear nueva película (solo admin)
  - `PUT /peliculas/actualizar/:id` - Actualizar película (solo admin)
  - `DELETE /peliculas/eliminar/:id` - Eliminar película (solo admin)
  - `GET /directores` - Obtener lista de directores

### Base de Datos
- **Tabla principal**: `Peliculas`
- **Relaciones**: 
  - `Directores` (FK: IdDirector)
  - `Generos` (muchos a muchos vía `PeliculaGenero`)
  - `Actores` (muchos a muchos vía `PeliculaActor`)

## 🚀 Cómo Acceder al CRUD

### 1. **Requisitos previos**
- Tener permisos de **Administrador** en el sistema
- Backend ejecutándose en `http://localhost:5000`
- Frontend ejecutándose en `http://localhost:3001`

### 2. **Acceso**
1. Iniciar sesión como administrador
2. En el menú de navegación, hacer clic en **"Gestión de Películas"**
3. Se abrirá la interfaz del CRUD con la lista de películas

### 3. **Operaciones**

#### ➕ **Agregar Película**
1. Hacer clic en "Agregar Nueva Película"
2. Llenar el formulario con la información requerida
3. Hacer clic en "Agregar"

#### ✏️ **Editar Película**
1. En la tabla, hacer clic en "Editar" en la fila de la película deseada
2. Modificar los campos necesarios en el formulario
3. Hacer clic en "Actualizar"

#### 🗑️ **Eliminar Película**
1. En la tabla, hacer clic en "Eliminar" en la fila de la película deseada
2. Confirmar la eliminación en el diálogo que aparece

## 🎨 Interfaz de Usuario

### Diseño Responsivo
- Tabla adaptable a diferentes tamaños de pantalla
- Modal centrado para formularios
- Alertas de confirmación y estado

### Estados Visuales
- **Loading**: Indicadores de carga durante operaciones
- **Success**: Alertas verdes para operaciones exitosas
- **Error**: Alertas rojas para errores
- **Estados de película**: Badges de colores (Verde=Publicado, Amarillo=Borrador)

## 🔐 Seguridad

### Autorización
- Solo usuarios con rol "Administrador" pueden acceder
- Verificación de token JWT en cada operación
- Redirección automática si no hay permisos

### Validación
- Validación frontend y backend
- Sanitización de datos de entrada
- Manejo de errores robusto

## 📝 Notas Técnicas

### Estado del Componente
- Manejo de estado local con React Hooks
- Sincronización automática con backend
- Actualización en tiempo real de la lista

### API Integration
- Comunicación RESTful con el backend
- Manejo de tokens de autenticación
- Gestión de errores de red

### Próximas Mejoras
- [ ] Gestión de géneros de películas
- [ ] Gestión de actores por película
- [ ] Filtros y búsqueda avanzada
- [ ] Paginación para grandes volúmenes de datos
- [ ] Carga de imágenes de posters
- [ ] Previsualización de trailers

---

**Desarrollado para el Sistema de Gestión de Cine**  
*Tecnología de Desarrollo Web - Universidad*
