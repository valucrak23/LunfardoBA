# 🎭 Eventos Culturales Buenos Aires

Aplicación full-stack desarrollada con MERN (MongoDB, Express, React, Node.js) para la gestión de eventos culturales, recitales y talleres en la ciudad de Buenos Aires.

## 📋 Descripción

Esta aplicación permite a los usuarios:
- **Explorar eventos culturales**: Ver recitales, eventos culturales y talleres disponibles en Buenos Aires
- **Gestionar eventos**: Crear, editar y eliminar eventos (requiere autenticación)
- **Gestionar categorías**: Organizar eventos por categorías personalizadas
- **Filtrar eventos**: Por tipo (Recital, Evento Cultural, Taller) y por categoría

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19.1.1** - Biblioteca de JavaScript para construir interfaces de usuario
- **React Router DOM 7.9.4** - Enrutamiento para aplicaciones React
- **Vite 7.1.7** - Herramienta de construcción y desarrollo
- **JWT Decode 4.0.0** - Decodificación de tokens JWT

### Backend (API Externa)
- La aplicación consume una API REST alojada en: `https://altadataba.onrender.com`
- **Autenticación JWT**: Sistema de autenticación mediante JSON Web Tokens
- **MongoDB**: Base de datos NoSQL para almacenar eventos, categorías y usuarios

## 📦 Instalación

1. **Clonar el repositorio** (o navegar al directorio del proyecto)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
```

4. **Abrir en el navegador**:
La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── Nav.jsx
│   │   ├── Footer.jsx
│   │   ├── Loading.jsx
│   │   └── MainLayout.jsx
│   ├── context/            # Context API para estado global
│   │   └── AuthContext.jsx # Manejo de autenticación
│   ├── services/           # Servicios para comunicación con API
│   │   ├── api.js          # Configuración base de API
│   │   ├── authService.js  # Servicios de autenticación
│   │   ├── eventosService.js    # CRUD de eventos
│   │   └── categoriasService.js # CRUD de categorías
│   ├── views/              # Vistas/páginas de la aplicación
│   │   ├── Home.jsx        # Página principal (listado de eventos)
│   │   ├── Login.jsx       # Inicio de sesión
│   │   ├── Register.jsx    # Registro de usuarios
│   │   ├── Eventos.jsx     # Gestión de eventos (CRUD)
│   │   ├── Categorias.jsx  # Gestión de categorías (CRUD)
│   │   └── NotFound.jsx    # Página 404
│   ├── App.jsx             # Componente principal y routing
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── package.json
└── README.md
```

## 🔑 Funcionalidades

### Autenticación
- ✅ **Registro de usuarios**: Crear cuenta con nombre, email y contraseña
- ✅ **Login**: Iniciar sesión con email y contraseña
- ✅ **JWT**: Tokens almacenados en localStorage
- ✅ **Validación**: Validación de formularios en frontend

### Gestión de Eventos
- ✅ **Listar eventos**: Ver todos los eventos disponibles
- ✅ **Crear evento**: Formulario completo con validación
- ✅ **Editar evento**: Modificar eventos existentes
- ✅ **Eliminar evento**: Borrar eventos con confirmación
- ✅ **Filtros**: Por tipo y categoría

### Gestión de Categorías
- ✅ **Listar categorías**: Ver todas las categorías
- ✅ **Crear categoría**: Con nombre, descripción, icono y color
- ✅ **Editar categoría**: Modificar categorías existentes
- ✅ **Eliminar categoría**: Borrar categorías con confirmación

### Características Adicionales
- ✅ **Separación de lógica**: Servicios separados de las vistas
- ✅ **Manejo de estado**: Context API para autenticación
- ✅ **Validación**: Validación en frontend y backend
- ✅ **Mensajes de error**: Feedback al usuario
- ✅ **Loading states**: Indicadores de carga
- ✅ **Responsive**: Diseño adaptable

## 🔌 Endpoints de la API

La aplicación consume los siguientes endpoints:

### Autenticación
- `POST /api/usuarios/auth` - Login
- `POST /api/usuarios` - Registro

### Eventos
- `GET /api/eventos` - Listar todos los eventos
- `GET /api/eventos/:id` - Obtener un evento por ID
- `POST /api/eventos` - Crear un nuevo evento
- `PUT /api/eventos/:id` - Actualizar un evento
- `DELETE /api/eventos/:id` - Eliminar un evento

### Categorías
- `GET /api/categorias` - Listar todas las categorías
- `GET /api/categorias/:id` - Obtener una categoría por ID
- `POST /api/categorias` - Crear una nueva categoría
- `PUT /api/categorias/:id` - Actualizar una categoría
- `DELETE /api/categorias/:id` - Eliminar una categoría

## 📝 Uso

### Para Usuarios No Autenticados
1. Navegar a la página principal para ver eventos
2. Filtrar eventos por tipo o categoría
3. Registrarse o iniciar sesión para gestionar eventos

### Para Usuarios Autenticados
1. **Gestionar Eventos**:
   - Ir a la sección "Eventos" en el menú
   - Crear nuevos eventos con el botón "➕ Nuevo Evento"
   - Editar o eliminar eventos existentes

2. **Gestionar Categorías**:
   - Ir a la sección "Categorías" en el menú
   - Crear nuevas categorías con el botón "➕ Nueva Categoría"
   - Editar o eliminar categorías existentes

## 🎯 Criterios de Evaluación Cumplidos

### Backend (API Externa)
- ✅ API REST completa
- ✅ Autenticación JWT implementada
- ✅ Base de datos MongoDB
- ✅ Gestión de usuarios
- ✅ Al menos 2 entidades (Eventos y Categorías)
- ✅ Operaciones CRUD completas

### Frontend
- ✅ Componentes funcionales con hooks
- ✅ División clara de componentes
- ✅ Enrutamiento con React Router
- ✅ Separación de lógica de API (servicios)
- ✅ Manejo de estado con Context API
- ✅ Validación de datos en frontend

### Ambos
- ✅ Validación de datos (frontend y backend)
- ✅ Autenticación con JWT
- ✅ README completo con información del proyecto

## 👥 Autores

**Aplicaciones Híbridas** — Docente: Jhonatan Cruz — Comisión: DWM4AP

Alumnos: Agostina Cruz, Alfredo Cubillo, Valentina Ijelchuk

## 📄 Licencia

Este proyecto fue desarrollado como parte del examen parcial 2 de la materia Aplicaciones Híbridas.

---
