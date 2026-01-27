# 🎊 TPDSW-COM304 - Sistema de Gestión de Libros y Reseñas

**Trabajo Práctico de Desarrollo de Software - COM304**  
**Universidad Tecnologica Nacional**

---

## 🎥 Video Demo

**📹 Link:** [Ver Video Demo]()  
**⏱️ Duración:** 10 minutos  
**📋 Contenido:**
- Demostración de funcionalidades principales
- 3 roles: Usuario, Moderador, Administrador
- Aspectos técnicos (tests, arquitectura, responsive)
- Credenciales de prueba incluidas

---

## 🔗 Links de Deploy

| Entorno | URL | Estado |
|---------|-----|--------|
| **Frontend (Vercel)** | `https://biblioteca-dsw.vercel.app` | 🔄 Por configurar |
| **Backend (Render)** | `https://biblioteca-api.onrender.com` | 🔄 Por configurar |
| **Repositorio** | `https://github.com/usuario/TPDSW-COM304--Carloni-GomezManna-Chacon-Mierez-2025` | ✅ Activo |

---

## 🔐 Credenciales de Prueba

```
==========================================
🔐 CREDENCIALES PARA PRUEBA DE LA APP
==========================================

👤 USUARIO NORMAL
   Email: demo@biblioteca.com
   Password: Demo123!
   Permisos: Crear reseñas, listas, favoritos, seguir usuarios

👮 MODERADOR
   Email: moderador@biblioteca.com
   Password: Mod123!
   Permisos: Aprobar/rechazar reseñas, ver estadísticas

👑 ADMINISTRADOR
   Email: admin@biblioteca.com
   Password: Admin123!
   Permisos: Acceso total al sistema

==========================================
```

---

## 📚 Documentación API

**📖 Documentación completa:** [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

La API incluye endpoints para:
- Autenticación (login, register, password reset)
- Libros (CRUD, búsqueda, filtros)
- Usuarios (perfil, gestión)
- Reseñas (CRUD, moderación, respuestas)
- Listas (CRUD, contenido)
- Favoritos
- Reacciones (likes, helpful)
- Seguimiento de usuarios
- Notificaciones
- Votaciones
- Newsletter
- Estadísticas (Admin)

---

## 👥 Integrantes del Grupo

| Legajo | Nombre | Mail | Rol |
|--------|--------|------|-----|
| 47791 | Gomez Manna, Joaquina Esperanza | Desarrollador Backend/Frontend |
| 51095 | Carloni, Nahuel Iván | Desarrollador Backend/Frontend |
| 50980 | Chacón, Agustina Celeste  | Desarrollador Backend/Frontend |
| 49938 | Mierez, Joaquín | Desarrollador Backend/Frontend |

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- Redis (opcional, para sesiones)

### Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run migrate

# Iniciar servidor (desarrollo)
npm run dev

# Ejecutar tests
npm test

# Ver cobertura
npm run test:coverage
```

### Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Tests E2E
npm run e2e
```

---

## 🧪 Testing

| Suite | Tests | Estado |
|-------|-------|--------|
| Backend Unit Tests | 620 | ✅ Pasando |
| Backend Integration Tests | Multiple | ✅ Pasando |
| Frontend Unit Tests | 136 | ✅ Pasando |
| Frontend E2E Tests | 1 | ✅ Pasando |
| **Total** | **756+** | **✅ 100% Pasando** |

```bash
# Ejecutar todos los tests
cd Backend && npm test -- --run
cd Frontend && npm test -- --run

# Tests con UI
cd Backend && npm run test:ui
cd Frontend && npm run test:ui
```

---

## 📋 Cumplimiento de Requisitos

### ✅ Backend - Regularidad (9/9)
- [x] Desarrollarse en JavaScript/TypeScript
- [x] Framework web (Express con middlewares)
- [x] API REST
- [x] Base de datos persistente (PostgreSQL)
- [x] Mapper (MikroORM)
- [x] Arquitectura en capas
- [x] Validación de datos
- [x] Manejo de errores
- [x] Dependencias en package.json

### ✅ Backend - Aprobación Directa (6/6)
- [x] Cumple regularidad
- [x] Tests automatizados (620 tests, 4x por integrante)
- [x] Test de integración
- [x] Login con autenticación JWT
- [x] 3 niveles de acceso (Usuario, Moderador, Admin)
- [x] Rutas protegidas y ambientes (.env)

### ✅ Frontend - Regularidad (16/16)
- [x] Framework (React 18)
- [x] HTML5 semántico
- [x] CSS con Tailwind CSS 4
- [x] Metodología Airbnb JS
- [x] Mobile-first design
- [x] 5 breakpoints (sm, md, lg, xl, 2xl)
- [x] Buenas prácticas UX/UI
- [x] Manejo de eventos
- [x] Manejo de errores amigable
- [x] Reactividad (React hooks)
- [x] Input/Output properties
- [x] Servicios (API calls)
- [x] Modelos con interfaces/classes
- [x] Patrones de diseño (Observer, Strategy)
- [x] Dependencias en package.json
- [x] Tests unitarios (136 tests)

### ✅ Frontend - Aprobación Directa (5/5)
- [x] Cumple regularidad
- [x] Test unitario de componente
- [x] Test E2E (resena-flow.spec.ts)
- [x] Login implementado
- [x] Rutas protegidas por rol

### ✅ Funcional - Regularidad
- [x] CRUD Usuario, Autor, Libro, Reseña, Lista
- [x] CRUD dependientes (Libro→Autor, Reseña→Usuario/Libro)
- [x] Listados con filtros (categoría, rating, búsqueda)
- [x] CUU: Reseñas, Listas personalizadas

### ✅ Funcional - Aprobación Directa
- [x] CRUDs de todas las clases de negocio
- [x] CUU: Moderación, Notificaciones, Recomendaciones
- [x] CUU relacionados (reseñas → notificaciones)

---

## 🏗️ Arquitectura

```
Backend/
├── src/
│   ├── entities/          # Modelos de datos (MikroORM)
│   ├── repositories/      # Acceso a datos
│   ├── services/          # Lógica de negocio
│   ├── controllers/       # Endpoints REST
│   ├── middleware/        # Auth, validación, errores
│   ├── routes/            # Definición de rutas
│   └── __tests__/         # Tests automatizados

Frontend/
├── src/
│   ├── componentes/       # Componentes UI reutilizables
│   ├── paginas/           # Vistas/pages
│   ├── services/          # Llamadas a API
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # Estado global
│   └── __tests__/         # Tests unitarios
└── e2e/                   # Tests end-to-end (Playwright)
```

---

## 📅 Fechas Importantes

| Entrega | Fecha |
|---------|-------|
| **Regularidad/Aprobación Directa** | **17/10/2025** |
| Primer Recuperatorio | 31/10/2025 |
| Última instancia | 14/11/2025 |

---

**Última actualización:** 25 de Enero de 2026  
**Estado del Proyecto:** 🚀 LISTO PARA ENTREGA

