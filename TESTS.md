# 🧪 Tests del Proyecto

## Estructura de Tests

```
Backend/
└── src/__tests__/unit/
    ├── moderation.service.test.ts    # Servicio de moderación de reseñas
    ├── auth.middleware.test.ts       # Middleware de autenticación JWT
    ├── usuarioParser.test.ts         # Parsing y validación de usuarios
    ├── resenaParser.test.ts          # Parsing y validación de reseñas
    ├── resenaHelpers.test.ts         # Helpers de reseñas (where clause, contadores)
    ├── resenaPopulateHelpers.test.ts # Estrategias de populate para reseñas
    ├── libroParser.test.ts           # Parsing y validación de libros
    ├── libroHelpers.test.ts          # Helpers de libros (crear, buscar entidades)
    ├── libroSearchHelpers.test.ts    # Búsqueda de libros (filtros, dedup, sanitize)
    ├── autorParser.test.ts           # Parsing y validación de autores
    ├── autorSearchHelpers.test.ts    # Búsqueda de autores (local, externa, cache)
    ├── authValidationHelpers.test.ts # Validación de auth (login, registro, passwords)
    └── sagaHelpers.test.ts           # Helpers de sagas (validación, autores)

Frontend/
├── src/utils/
│   ├── slugUtils.test.ts            # Generación y validación de slugs
│   ├── jwtUtils.test.ts             # Decodificación JWT y roles
│   ├── tokenUtil.test.ts            # Gestión de tokens en localStorage
│   └── apiParser.test.ts            # Parsing de respuestas de API
├── src/componentes/
│   ├── SearchBar.test.tsx            # Componente de barra de búsqueda
│   └── LibroCard.test.tsx            # Componente de tarjeta de libro
└── e2e/
    └── resena-flow.spec.ts           # Test E2E: Login → Crear Reseña → Verificar
```

## Cómo Ejecutar

### Backend

```bash
cd Backend
npm install
npx vitest run src/__tests__/unit/ --reporter verbose
```

### Frontend

```bash
cd Frontend
npm install
npx vitest run --reporter verbose
```

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
- **Framework**: Vitest para unit tests, Playwright para E2E

## Qué Cubre Cada Test

| Área | Archivos | Tests | Cobertura |
|------|----------|-------|-----------|
| **Moderación** | `moderation.service.test.ts` | 34 | Profanidad, spam, toxicidad, scoring, cleanText |
| **Auth Middleware** | `auth.middleware.test.ts` | 15 | JWT válido/inválido, token expirado, payload |
| **Parsers Backend** | `*Parser.test.ts` (×4) | ~120 | Input validation, sanitización HTML, filtros, queries |
| **Helpers Backend** | `*Helpers.test.ts` (×5) | ~150 | Where clauses, búsqueda, dedup, serialización |
| **Auth Validation** | `authValidationHelpers.test.ts` | ~30 | Login, registro, password strength, email |
| **Utils Frontend** | `slugUtils`, `jwtUtils`, `tokenUtil` | 53 | Slugs, JWT decode, localStorage tokens |
| **API Parser** | `apiParser.test.ts` | 49 | Parsing de respuestas (libros, reseñas, autores) |
| **Componentes** | `SearchBar`, `LibroCard` | 17 | Render, props, interacción, accesibilidad |
| **E2E** | `resena-flow.spec.ts` | 3 | Login → Crear Reseña → Verificar publicación |
