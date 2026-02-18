# 🧪 Tests del Proyecto

## Estructura de Tests

```
Backend/
└── src/__tests__/unit/
    ├── moderation.service.test.ts    # Servicio de moderación de reseñas
    └── auth.middleware.test.ts       # Middleware de autenticación JWT

Frontend/
├── src/
│   ├── utils/
│   │   └── apiParser.test.ts        # Parsing de respuestas de API
│   └── componentes/
│       └── SearchBar.test.tsx        # Componente de barra de búsqueda
└── e2e/
    └── resena-flow.spec.ts           # Test E2E: Login → Crear Reseña → Verificar
```

## Cómo Ejecutar

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

## Convenciones

- **Patrón AAA**: Arrange → Act → Assert en cada test
- **Mocks**: `vi.mock()` para dependencias externas (JWT, Sentiment, localStorage, APIs)
- **Limpieza**: `afterEach` con `vi.restoreAllMocks()` o `localStorage.clear()`
- **Nomenclatura**: `describe('función()')` → `it('debe + comportamiento esperado')`
- **Frameworks**: Vitest para unit tests, Playwright para E2E

## Qué Cubre Cada Test

| Área | Archivo | Tests | Cobertura |
|------|---------|-------|-----------|
| **Moderación** | `moderation.service.test.ts` | 34 | Profanidad, spam, toxicidad, scoring, cleanText |
| **Auth Middleware** | `auth.middleware.test.ts` | 15 | JWT válido/inválido, token expirado, payload |
| **API Parser** | `apiParser.test.ts` | 49 | Parsing de respuestas (libros, reseñas, autores, sagas, paginación) |
| **SearchBar** | `SearchBar.test.tsx` | 8 | Render, props, input, sugerencias, accesibilidad |
| **E2E** | `resena-flow.spec.ts` | 3 | Login → Navegar a libro del seed → Crear Reseña → Login inválido → Protección de rutas |
