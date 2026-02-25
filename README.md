# TPDSW-COM304 - Sistema de Gestión de Libros y Reseñas

**Trabajo Práctico de Desarrollo de Software - COM304**  
**Universidad Tecnologica Nacional**

---

## 🎥 Video Demo

**📹 Link:** En proceso

---

## 🔗 Links de Deploy

https://tpdsww.vercel.app/

Infraestructura:

Frontend con Vercel, Backend con Render y bdd con Clever Cloud.

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
   Email: admin@gmail.com
   Password: 123456
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
| Backend Unit Tests | 49 | ✅ Pasando |
| Frontend Unit Tests | 57 | ✅ Pasando |
| Frontend E2E Tests | 3 (Escenarios) | ✅ Pasando |
| **Total** | **109** | **✅ 100% Pasando** |

### Backend (Unit Tests)

```bash
cd Backend
npm install
npx vitest run src/__tests__/unit/ --reporter verbose
```

### Frontend (Unit Tests)

```bash
cd Frontend
npm install
npx vitest run --reporter verbose
```

### E2E (Playwright)

> **Requisitos previos:** el Backend y el Frontend deben estar corriendo.

```bash
# 1. Levantar el Backend (en una terminal aparte)
cd Backend
npm run start  # o npm run dev

# 2. Ejecutar los tests E2E desde Frontend
cd Frontend
npx playwright install          # solo la primera vez (descarga navegadores)
npx playwright test             # ejecuta los tests
npx playwright test --ui        # modo interactivo con UI
npx playwright show-report      # ver reporte HTML tras la ejecución
```

> **Nota:** Los tests E2E tienen un timeout extendido de **120 segundos** para permitir la ejecución en entornos con carga alta o servidores de desarrollo más lentos.

La config de Playwright (`Frontend/playwright.config.ts`) levanta automáticamente el dev server del Frontend en `http://localhost:5173` si no está corriendo.

### Con cobertura

```bash
# Backend
cd Backend
npx vitest run --coverage

# Frontend
cd Frontend
npx vitest run --coverage
```

> Los reportes de cobertura se generan en `coverage/` (ignorados por `.gitignore`).

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

**Última actualización:** 24 de Febrero de 2026

