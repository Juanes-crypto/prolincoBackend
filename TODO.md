# TODO - Correcciones Críticas del Backend de Lácteos Prolinco

## Fase 1: Seguridad Crítica ✅ EN PROGRESO
- [x] Proteger `/api/auth/register` con middleware de admin
- [x] Validar existencia de variables de entorno críticas en server.js
- [ ] Mejorar validación de contraseñas (longitud mínima, complejidad)

## Fase 2: Limpieza de Código
- [ ] Unificar controladores de autenticación (eliminar duplicación authController vs userController)
- [ ] Estandarizar manejo de roles (cambiar 'basico' por 'invitado' consistentemente)
- [ ] Corregir permisos en contentRoutes (permitir talento/servicio editar sus secciones)

## Fase 3: Mejoras de UX/API
- [ ] Mejorar mensajes de error consistentes
- [ ] Implementar paginación para listas largas
- [ ] Agregar validaciones más estrictas (email, URLs)

## Fase 4: Optimización
- [ ] Agregar índices de base de datos
- [ ] Implementar cache donde sea necesario
- [ ] Mejorar logging y monitoreo

## Estado Actual
- Backend corriendo correctamente en localhost:5000
- Conexión MongoDB Atlas exitosa
- Validación de email funcionando en backend
- Pendiente: pruebas del frontend y correcciones de permisos
