# Backend de Lácteos Prolinco

## Descripción del Proyecto

Este es el backend de la aplicación web de Lácteos Prolinco, desarrollado con Node.js, Express y MongoDB. Proporciona una API RESTful para gestionar usuarios, contenido estratégico, documentos y auditoría.

## Características Principales

### Gestión de Usuarios
- Autenticación JWT
- Roles: admin, talento, servicio, invitado
- Cambio de contraseña obligatorio para nuevos usuarios

### Gestión de Contenido Estratégico
- Secciones: Administración, Talento Humano, Servicio al Cliente, Identidad Organizacional
- Permisos específicos por rol para editar contenido
- Historial de cambios auditado

### Gestión de Documentos
- Subida y descarga de archivos
- Categorización por tipo de documento
- Control de acceso por roles

### Sistema de Auditoría
- Registro completo de todas las acciones del sistema
- Historial detallado con usuario, fecha y descripción

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `PUT /api/users/change-password` - Cambiar contraseña

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id/role` - Actualizar rol

### Contenido
- `GET /api/content/:section` - Obtener contenido de sección
- `PUT /api/content/:section` - Actualizar contenido (con permisos)
- `GET /api/content/:section/history` - Ver historial
- `PUT /api/content/:section/tool/:toolName` - Actualizar URL de herramienta

### Documentos
- `GET /api/documents` - Listar documentos
- `POST /api/documents` - Subir documento
- `GET /api/documents/:id/download` - Descargar documento
- `DELETE /api/documents/:id` - Eliminar documento

### Auditoría (Admin)
- `GET /api/audit/logs` - Ver logs de auditoría

## Permisos por Rol

### Administrador (admin)
- Acceso completo a todas las funcionalidades
- Gestionar usuarios y roles
- Editar todas las secciones de contenido
- Ver auditoría completa

### Talento Humano (talento)
- Editar sección de Talento Humano
- Ver contenido de otras secciones
- Gestionar documentos relacionados

### Servicio al Cliente (servicio)
- Editar sección de Servicio al Cliente
- Ver contenido de otras secciones
- Gestionar documentos relacionados

### Invitado (invitado)
- Solo lectura de contenido
- Acceso limitado a documentos

## Instalación y Configuración

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`
4. Ejecutar: `npm run dev`

## Variables de Entorno

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=tu_clave_secreta_muy_segura
```

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- bcryptjs para hash de contraseñas
- Multer para subida de archivos
- CORS para manejo de orígenes cruzados

## Seguridad

- Validación de URLs en herramientas
- Exclusión de datos sensibles en respuestas
- Control de permisos granular
- Auditoría completa de acciones
- Hash seguro de contraseñas

## Gestión de Archivos

El módulo de Gestión de Archivos permite a usuarios autorizados:
- Subir documentos clasificados por categorías
- Descargar archivos de forma segura
- Mantener un registro auditado de todas las operaciones
- Controlar permisos de acceso según el rol del usuario
