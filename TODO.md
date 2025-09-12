# Plan para mostrar autores y sinopsis en libros populares

## Información recopilada
- El backend solo fetch id, title, slug, activities_count, coverUrl para trending.
- La página de detalle ya muestra autores y sinopsis correctamente.
- Necesito actualizar el backend para incluir authors y description en trending.
- Actualizar la interfaz HardcoverBook.
- Actualizar el frontend para usar authors en las tarjetas de libros populares.

## Plan
1. Actualizar Backend/src/services/hardcoverService.ts: Agregar authors y description a la interfaz y query.
2. Actualizar el mapping en refreshTrendingBooks.
3. Actualizar Frontend/src/paginas/LibrosPopulares.tsx: Agregar authors y description a la interfaz, mapping, y pasar authors a LibroCard.

## Pasos de ejecución
- [x] Actualizar interfaz HardcoverBook en backend
- [x] Actualizar query GraphQL para incluir authors y description
- [x] Actualizar mapping en refreshTrendingBooks
- [x] Actualizar interfaz LibroTrending en frontend
- [x] Actualizar mapping en LibrosPopulares.tsx
- [x] Pasar authors a LibroCard en ambos lugares

## Seguimiento
- Completado: Actualización del backend y frontend para mostrar autores en libros populares.
- La sinopsis ya se muestra en la página de detalle.

---

# Plan para remover cache de Google Books en Upstash

## Información recopilada
- El servicio googleBooks.service.ts está guardando datos en Redis (Upstash).
- El usuario no quiere que las keys de Google Books se guarden en Upstash.
- Mantener el cache en memoria local para performance.

## Plan
1. Remover todas las llamadas a redis.setex() en googleBooks.service.ts
2. Mantener el cache en memoria local
3. Mantener la funcionalidad de obtener datos desde Redis si existen

## Pasos de ejecución
- [x] Remover Redis caching en getBookById (caso exitoso)
- [x] Remover Redis caching en buscarLibro (caso exitoso)
- [x] Remover Redis caching en buscarLibro (caso de error)
- [x] Remover Redis caching en buscarLibro (catch block)

## Seguimiento
- Completado: Removido todo el caching de Google Books en Redis/Upstash.
- El servicio mantiene cache en memoria local para performance.
- Los datos de Google Books ya no se guardan en Upstash.

---

# Project Phases for Backend and Frontend Improvements

## Phase 1: Backend Moderation System
- [x] Create admin middleware for role checking
- [x] Add approveResena and rejectResena endpoints in resena.controller.ts
- [x] Update resena.routes.ts with admin-protected routes

## Phase 2: Frontend Lists Management
- [x] Update FavoritosPage to fetch user's lists from backend
- [ ] Add UI for creating new lists and managing list contents
- [x] Connect book state buttons to Lista operations
- [ ] Update lista.controller.ts with auth checks

## Phase 3: Recommendations Implementation
- [x] Implement LibrosRecomendados.tsx to fetch from /recomendacion endpoint
- [x] Display recommended books with proper UI

## Phase 4: Follow System Integration
- [x] Update follow/unfollow buttons in user profiles to call seguimiento endpoints
- [ ] Display real follow counts and follower lists

## Phase 5: Admin Moderation UI
- [ ] Create AdminModerationPage component
- [ ] Fetch pending reviews and allow approve/reject actions
- [ ] Add admin navigation/routing
