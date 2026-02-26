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

## 📄 Propuesta TP DSW

### 👥 Grupo

#### Integrantes
| Legajo | Nombre | Mail |
|--------|--------|------|
| 47791 | Gomez Manna, Joaquina Esperanza |  |
| 51095 | Carloni, Nahuel Iván |  |
| 50980 | Chacón, Agustina Celeste |  |
| 49938 | Mierez, Joaquín |  |

### 📚 Tema

#### Descripción
El sistema permitirá a los usuarios ingresar a la página web y observar diferentes reseñas de libros junto con recomendaciones categorizadas por géneros. Los usuarios podrán agregar reseñas con calificación (1-5 estrellas) y comentario, marcar libros como favoritos y guardarlos en su lista personal.

#### Modelo
[Modelo de Dominio](https://drive.google.com/file/d/10CZM5P55DNUaeEiIdEiqubp5iLLYt8Ha/view?usp=sharing)

### 🎯 Alcance Funcional

#### Alcance Mínimo

Regularidad:

| Req | Detalle |
|:-|:-|
| CRUD simple | 1. CRUD de Usuario<br>2. CRUD de Editorial - Se cambio a CRUD de Sagas<br>3. CRUD de Categoría - Se cambio a CRUD de Reseña<br>4. CRUD de Autor |
| CRUD dependiente | 1. Libro depende del Autor<br>2. Las Sagas dependen de los Libros. |
| Listado + Detalle | 1. Ingresando una categoría, se muestra un listado de libros coincidentes<br>2. Filtrado de libros por mayor cantidad de estrellas |
| CUU/Epic | 1. Listas de "Leído", "Ver más tarde", "Pendientes".<br>2. Reseñas de los Libros. |

#### Adicionales para Aprobación

| Req | Detalle |
|:-|:-|
| CRUD | 1. CRUD completo de todos los elementos |
| CRUD dependiente | 1. Todas las relaciones establecidas |
| CUU/Epic | 1. Implementar un sistema automático para revisar y moderar reseñas de usuarios usando alguna librería especifica.<br>2. Permitir a los usuarios reaccionar a reseñas (ej. likes)<br>3. Mostrar recomendaciones personalizadas<br>4. Implementar la funcionalidad de "seguir" para que los usuarios puedan seguir a otros y ver sus actividades o reseñas. |


## 📚 Documentación API

***

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

