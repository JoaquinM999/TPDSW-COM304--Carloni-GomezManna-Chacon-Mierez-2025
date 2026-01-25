# 📋 Checklist de Entrega Final - DSW COM304

**Fecha límite:** 17/10/2025 (Regularidad/Aprobación Directa)  
**Última instancia:** 14/11/2025

---

## 🎯 Resumen de Estado del Proyecto

| Categoría | Estado | Detalle |
|-----------|--------|---------|
| Backend Regularidad | ✅ COMPLETO | 9/9 requisitos |
| Backend Aprobación | ✅ COMPLETO | 6/6 requisitos |
| Frontend Regularidad | ✅ COMPLETO | 16/16 requisitos |
| Frontend Aprobación | ✅ COMPLETO | 5/5 requisitos |
| Funcional Regularidad | ✅ COMPLETO | CRUDs, listados, CUU |
| Funcional Aprobación | ✅ COMPLETO | CUU adicionales |
| **Documentación API** | ✅ COMPLETO | [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) creado |
| **README.md** | ✅ COMPLETO | Actualizado con links de entrega |
| **Deploy** | 🔄 EN PROCESO | Archivos de configuración listos |
| **Video Demo** | 🔄 CASI LISTO | Script listo, falta grabar |
| **Entrega Final** | ❌ PENDIENTE | Formulario y defensa |

---

## 1. 📦 Deploy y Configuración de Producción

### 1.1 Backend Deploy
- [ ] **Deploy Backend en Render/ Railway/ Railway/ Coolify**
  - [ ] Crear servicio de base de datos PostgreSQL
  - [ ] Configurar variables de entorno en el servicio
  - [ ] Conectar con base de datos de producción
  - [ ] Configurar Redis (opcional, para sesiones)
  - [ ] URL del backend: `https://biblioteca-api.onrender.com` (ejemplo)

### 1.2 Frontend Deploy
- [ ] **Deploy Frontend en Vercel/ Netlify**
  - [ ] Conectar con repositorio de GitHub
  - [ ] Configurar variables de entorno (VITE_API_URL)
  - [ ] Configurar redirects para SPA (/* -> /index.html)
  - [ ] URL del frontend: `https://biblioteca-dsw.vercel.app` (ejemplo)

### 1.3 Variables de Entorno Requeridas
```env
# Backend (.env.production)
DATABASE_NAME=...
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_HOST=...
JWT_SECRET=...
REDIS_URL=...
PORT=3000

# Frontend (.env.production)
VITE_API_URL=https://biblioteca-api.onrender.com
```

---

## 2. 🎥 Video Demo

### 2.1 Preparación (del VIDEO_DEMO_SCRIPT.md)
- [ ] **Setup Técnico**
  - [ ] Backend corriendo sin errores
  - [ ] Frontend corriendo sin errores
  - [ ] Usuarios de demo creados
  - [ ] Datos de prueba cargados

- [ ] **Grabación**
  - [ ] Grabar video demo (8-10 minutos)
  - [ ] Seguir estructura del script
  - [ ] Mostrar 3 roles: Usuario, Moderador, Admin
  - [ ] Mostrar aspectos técnicos (tests, arquitectura)
  - [ ] Sin errores en consola durante demo

- [ ] **Edición**
  - [ ] Renderizar en Full HD (1920x1080)
  - [ ] Añadir títulos/secciones
  - [ ] Mostrar URLs y credenciales claramente
  - [ ] Duración entre 8-12 minutos

- [ ] **Publicación**
  - [ ] Subir a YouTube (unlisted) o Google Drive
  - [ ] Obtener link para compartir

---

## 3. 📚 Documentación API del Backend

- [ ] **Generar Documentación API**
  - [ ] Si usan Swagger/OpenAPI: Generar spec
  - [ ] Endpoint de auth (login, register)
  - [ ] Endpoints de libros (CRUD, búsqueda, filtros)
  - [ ] Endpoints de autores
  - [ ] Endpoints de reseñas
  - [ ] Endpoints de listas
  - [ ] Endpoints de moderación
  - [ ] Endpoints de notificaciones
  - [ ] Endpoints de votaciones

- [ ] **Formato de Documentación**
  - [ ] URL base de la API
  - [ ] Headers requeridos (Authorization)
  - [ ] Modelos de request/response
  - [ ] Códigos de error
  - [ ] Ejemplos de uso

---

## 4. 📋 Entrega de Formulario

- [ ] **Llenar Formulario de Entrega**
  - [ ] Link al video demo
  - [ ] Link al repositorio (GitHub/GitLab)
  - [ ] Links a deploys (Frontend y Backend)
  - [ ] Credenciales de acceso a la app
    - Usuario: `demo@biblioteca.com` / `Demo123!`
    - Moderador: `moderador@biblioteca.com` / `Mod123!`
    - Admin: `admin@biblioteca.com` / `Admin123!`
  - [ ] Link a la propuesta actualizada
  - [ ] Link a Pull Requests de back/front
  - [ ] Contacto para coordinar defensa

- [ ] **Link del formulario:** `https://kutt.it/DSWEntregaSistemaFinal`

---

## 5. 🔐 Credenciales para la App Deployada

- [ ] **Verificar que las credenciales funcionan en producción**
  - [ ] Login de usuario normal
  - [ ] Login de moderador
  - [ ] Login de administrador
  - [ ] Verificar permisos por rol

### Credenciales a incluir en README.md y entrega:
```
==========================================
🔐 CREDENCIALES DE PRUEBA
==========================================

👤 USUARIO NORMAL
   Email: demo@biblioteca.com
   Password: Demo123!

👮 MODERADOR
   Email: moderador@biblioteca.com
   Password: Mod123!

👑 ADMINISTRADOR
   Email: admin@biblioteca.com
   Password: Admin123!

==========================================
```

---

## 6. 🗣️ Defensa Oral

- [ ] **Coordinar Defensa**
  - [ ] Contactar docentes para agendar fecha
  - [ ] Confirmar disponibilidad de todos los integrantes
  - [ ] Preparar presentación de 10-15 minutos
  - [ ] Asignar partes a cada integrante

- [ ] **Contenido de la Defensa**
  - [ ] Explicar arquitectura del proyecto
  - [ ] Mostrar funcionalidades principales
  - [ ] Demostrar 3 roles de usuario
  - [ ] Explicar decisiones técnicas
  - [ ] Responder preguntas de los docentes

---

## 7. 📖 README.md Actualizado

- [ ] **Secciones a incluir/actualizar**
  - [ ] ✅ Descripción del proyecto
  - [ ] ✅ Tecnologías usadas
  - [ ] ✅ Instrucciones de instalación local
  - [ ] ✅ Scripts disponibles (npm run ...)
  - [ ] ✅ Estado de tests (756 tests pasando)
  - [ ] ✅ 🎥 Link al video demo
  - [ ] ✅ 🔗 Links a deploys
  - [ ] ✅ 🔐 Credenciales de prueba
  - [ ] ✅ 📚 Documentación API (link)
  - [ ] ✅ 👥 Integrantes del grupo

---

## 8. 📊 Verificación de Requisitos

### Backend - Regularidad (9/9 ✅)
- [x] Desarrollarse en JavaScript/TypeScript
- [x] Framework web (Express con middlewares)
- [x] API REST
- [x] Base de datos persistente (PostgreSQL)
- [x] Mapper (MikroORM)
- [x] Arquitectura en capas
- [x] Validación de datos
- [x] Manejo de errores
- [x] Dependencias en package.json

### Backend - Aprobación Directa (6/6 ✅)
- [x] Cumple regularidad
- [x] Tests automatizados (620 tests, 4x por integrante)
- [x] Test de integración (varios implementados)
- [x] Login con autenticación JWT
- [x] 2+ niveles de acceso (3: Usuario, Moderador, Admin)
- [x] Rutas protegidas y ambientes (.env)

### Frontend - Regularidad (16/16 ✅)
- [x] Framework (React)
- [x] HTML5 semántico
- [x] CSS con Tailwind CSS
- [x] Metodología BEM/Airbnb
- [x] Mobile-first
- [x] 3+ breakpoints (sm, md, lg, xl, 2xl)
- [x] Buenas prácticas UX/UI
- [x] Manejo de eventos (click, input, submit)
- [x] Manejo de errores amigable
- [x] Reactividad (React hooks)
- [x] Input/Output properties
- [x] Servicios (API calls)
- [x] Modelos con interfaces/classes
- [x] Patrones de diseño (Observer, Strategy, etc.)
- [x] Dependencias en package.json
- [x] Tests unitarios (136 tests)

### Frontend - Aprobación Directa (5/5 ✅)
- [x] Cumple regularidad
- [x] Test unitario de componente
- [x] Test E2E (resena-flow.spec.ts)
- [x] Login implementado
- [x] Rutas protegidas por rol

### Funcional - Regularidad
- [x] CRUD simple por integrante (4+ miembros = 4+ CRUDs)
  - [x] CRUD Usuario
  - [x] CRUD Autor
  - [x] CRUD Libro
  - [x] CRUD Reseña
  - [x] CRUD Lista
- [x] CRUD dependiente (2+ relaciones)
  - [x] Libro -> Autor
  - [x] Reseña -> Usuario, Libro
  - [x] Lista -> Usuario
  - [x] Saga -> Libros
- [x] Listado con filtro (2+ por fracción)
  - [x] Listado de libros por categoría
  - [x] Búsqueda de libros
  - [x] Filtros avanzados
- [x] CUU/Epic por fracción
  - [x] Sistema de reseñas
  - [x] Listas personalizadas
  - [x] Moderación de contenido
  - [x] Notificaciones

### Funcional - Aprobación Directa
- [x] CRUDs de todas las clases de negocio
- [x] CUU/Epic por integrante (4+)
- [x] CUU relacionados entre sí (reseñas -> notificaciones)

---

## 9. ✅ Checklist Final Pre-Entrega

- [ ] **Día antes de la entrega:**
  - [ ] Verificar que deploys funcionan
  - [ ] Probar login con todas las credenciales
  - [ ] Verificar que video está accesible
  - [ ] Revisar README.md completo
  - [ ] Confirmar formulario listo

- [ ] **Día de la entrega:**
  - [ ] Submitir formulario
  - [ ] Enviar link a docentes
  - [ ] Confirmar fecha de defensa

---

## 📞 Contacto del Equipo

| Rol | Nombre | Mail |
|-----|--------|------|
| Desarrollador | Gomez Manna, Joaquina Esperanza | 47791@ucc.edu.ar |
| Desarrollador | Carloni, Nahuel Iván | 51095@ucc.edu.ar |
| Desarrollador | Chacón, Agustina Celeste | 50980@ucc.edu.ar |
| Desarrollador | Mierez, Joaquín | 49938@ucc.edu.ar |

---

## 📅 Fechas Importantes

| Entrega | Fecha |
|---------|-------|
| **Regularidad/Aprobación Directa** | **17/10/2025** |
| Primer Recuperatorio | 31/10/2025 |
| Última instancia | 14/11/2025 |

---

## 📋 Tareas Completadas (Hoy)

- [x] Crear [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) con todos los endpoints
- [x] Actualizar [`README.md`](./README.md) con links de entrega, credenciales y estado de requisitos
- [x] Crear [`Backend/.env.example`](./Backend/.env.example) para configuración de producción
- [x] Crear [`Frontend/.env.example`](./Frontend/.env.example) para configuración de producción

---

## 🎯 Próximas Tareas Pendientes

### Deploy (Alta Prioridad)
1. [ ] **Deploy Backend en Render:**
   - [ ] Crear cuenta en Render.com
   - [ ] Crear servicio Web Service
   - [ ] Conectar con repositorio GitHub
   - [ ] Configurar variables de entorno en Render
   - [ ] Crear base de datos PostgreSQL en Render
   - [ ] Configurar start command: `npm start`

2. [ ] **Deploy Frontend en Vercel:**
   - [ ] Crear cuenta en Vercel.com
   - [ ] Importar repositorio
   - [ ] Configurar VITE_API_URL production
   - [ ] Deploy automático configurado

### Video Demo (Alta Prioridad)
- [ ] Grabar video demo (8-10 minutos)
- [ ] Editar video (añadir títulos, transiciones)
- [ ] Subir a YouTube (unlisted)
- [ ] Actualizar link en README.md

### Formulario de Entrega (Media Prioridad)
- [ ] Llenar formulario: https://kutt.it/DSWEntregaSistemaFinal
- [ ] Incluir: links a deploys, video, repo
- [ ] Incluir credenciales de prueba
- [ ] Incluir contacto para defensa

---

## 📅 Fechas Límite

| Entrega | Fecha | Estado |
|---------|-------|--------|
| **Regularidad/Aprobación Directa** | **17/10/2025** | ⏰ 22 días |
| Primer Recuperatorio | 31/10/2025 | ⏰ 36 días |
| Última instancia | 14/11/2025 | ⏰ 50 días |

---

**Última actualización:** 25 de Enero de 2026  
**Progreso de hoy:** +4 tareas completadas  
**Próxima sesión:** Deploy del backend

