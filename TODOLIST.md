# TODO List - Sistema de Reseñas de Libros
## 📚 TPDSW-COM304--Carloni-GomezManna-Chacon-Mierez-2025

**Última actualización:** 29 de octubre de 2025

---

## 🎯 Alcance Mínimo (Regularidad)

### ✅ CRUD Simple - COMPLETADO
- [x] CRUD de Usuario
- [x] CRUD de Sagas (cambió de Editorial)
- [x] CRUD de Reseña (cambió de Categoría)
- [x] CRUD de Autor
- [x] CRUD de Categoría (implementado)
- [x] CRUD de Editorial (implementado)

### ✅ CRUD Dependiente - COMPLETADO
- [x] Libro depende del Autor
- [x] Las Sagas dependen de los Libros

### ✅ Listado + Detalle - COMPLETADO
- [x] Filtrado de libros por categoría
- [x] Filtrado de libros por mayor cantidad de estrellas (ratingLibro implementado)

### ✅ CUU/Epic - COMPLETADO
- [x] Listas de "Leído", "Ver más tarde", "Pendientes"
- [x] Reseñas de los Libros

---

## 🚀 Adicionales para Aprobación

### 1. Sistema de Moderación de Reseñas ✅ COMPLETADO (30/10/2025)

#### Backend ✅
- [x] **Servicio de moderación automática implementado** (`moderation.service.ts`)
  - [x] Análisis de sentimiento con librería `sentiment` (score -5 a +5)
  - [x] Detección de lenguaje ofensivo (lista personalizada de palabras)
  - [x] Detección de spam (mayúsculas excesivas, repetición, emojis)
  - [x] Sistema de puntuación 0-100 con auto-aprobación/rechazo
  - [x] Integración automática al crear reseñas

- [x] **Campos agregados a entidad Reseña**
  - [x] `moderationScore` (0-100)
  - [x] `moderationReasons` (JSON con razones)
  - [x] `autoModerated` (boolean)
  - [x] Migración ejecutada exitosamente

- [x] **Endpoints implementados**
  - [x] `POST /api/resenas` - Moderación automática integrada
  - [x] `POST /api/resenas/analyze` - Testing de moderación
  - [x] Estados auto-asignados: APPROVED (≥80), PENDING (40-79), FLAGGED (<40)

#### Frontend ✅
- [x] Página de moderación admin (`AdminModerationPage.tsx`)
- [x] **Interfaz de moderación mejorada** - ✅ COMPLETADO (30/10/2025)
  - [x] Mostrar score de moderación en reseñas (0-100 con colores)
  - [x] Indicadores visuales de análisis automático (badges + iconos)
  - [x] Filtros por estado de moderación (Alta/Media/Baja calidad)
  - [x] Mostrar razones específicas del flagging (panel expandible)
  - [x] Componente `ModerationBadge` con semántica de colores
  - [x] Componente `ModerationReasons` con detalles de análisis
  - [x] Mejoras en `ResenaList.tsx` con iconos de moderación
  - [x] Documentación en `SISTEMA_MODERACION_UI.md`
  - [x] **BUG CORREGIDO**: Filtro ahora trae reseñas PENDING y FLAGGED correctamente

#### Funcionalidades Implementadas
- [x] Moderación automática en creación de reseñas
- [x] Score calculado: sentiment + profanity + spam + toxicity
- [x] Auto-aprobación para contenido de calidad (80+)
- [x] Auto-rechazo para contenido problemático (<40)
- [x] Revisión manual para casos intermedios (40-79)
- [x] Documentación completa en `SISTEMA_MODERACION_IMPLEMENTADO.md`

#### Sistema de Auto-Rechazo ✅ IMPLEMENTADO (30/10/2025)
- [x] **Rechazo automático de contenido extremadamente inapropiado**
  - [x] Flag `shouldAutoReject` en servicio de moderación
  - [x] Bloqueo inmediato sin guardar en BD (HTTP 400)
  - [x] Umbrales de auto-rechazo: score <20 O múltiples flags críticos
  - [x] Campos agregados: `autoRejected`, `rejectionReason`, `deletedAt`
  - [x] Soft delete opcional para auditoría
  - [x] Endpoint `/admin/rechazadas` para ver historial
  - [x] Mensaje de error claro para el usuario
  - [x] Documentación completa en `SISTEMA_AUTO_RECHAZO.md`

#### Mejoras Implementadas ✅ (30/10/2025)
- [x] **Optimización del sistema de moderación automática**
  - [x] Ajustados umbrales: auto-aprobación 70+, auto-rechazo <30
  - [x] Lista expandida de palabras ofensivas (35+ español, 20+ inglés)
  - [x] Detección mejorada de evasión de filtros (mi3rd4 → mierda, etc.)
  - [x] Sistema de penalizaciones más severo (-50 profanidad, -45 toxicidad)
  - [x] Detección de toxicidad más agresiva (2+ palabras vs 3+ antes)
  - [x] Penalización adicional por múltiples flags (-15/-25 puntos)
  - [x] Documentación completa en `MEJORAS_MODERACION.md`

#### Mejoras Implementadas ✅ (30/10/2025 - Sesión 2)
- [x] **Frontend: mensaje de error mejorado con normas de comunidad** - ✅ COMPLETADO
  - [x] Componente `ModerationErrorModal` creado con diseño profesional
  - [x] Normas de comunidad dinámicas según razones de rechazo
  - [x] Muestra razones específicas con iconos
  - [x] Sugerencias para mejorar la reseña
  - [x] Guía completa de reseñas incluida
  - [x] Integrado en `DetalleLibro.tsx` con detección automática
  - [x] Modal solo se muestra en errores de moderación

#### Pendientes (Mejoras Opcionales)
- [ ] Dashboard de estadísticas de moderación
- [ ] Sistema de apelaciones para reseñas rechazadas
- [ ] Histórico de decisiones de moderación con gráficos
- [ ] Machine Learning para mejorar precisión

---

### 2. Sistema de Reacciones a Reseñas ✅ COMPLETADO (30/10/2025)

- [x] Entidad Reaccion implementada
- [x] Controlador de reacciones (`reaccion.controller.ts`)
- [x] Rutas de API (`/api/reacciones`)
- [x] Tipos de reacción: 'like', 'dislike', 'corazon'
- [x] Constraint único: usuario-reseña
- [x] Relación bidireccional con Resena

#### Endpoints Implementados
- [x] `GET /api/reacciones/resena/:resenaId` - Obtener reacciones de reseña
- [x] `POST /api/reacciones` - Crear reacción
- [x] `DELETE /api/reacciones/:usuarioId/:resenaId` - Eliminar reacción
- [x] Validación de tipo de reacción en backend

#### Sistema de Contadores ✅ COMPLETADO (30/10/2025)
- [x] **Backend: Contador de reacciones en reseñas**
  - [x] Campo `reaccionesCount` agregado dinámicamente en respuestas
  - [x] Contadores desglosados: `likes`, `dislikes`, `corazones`, `total`
  - [x] Implementado en `getResenas` y `getResenaById`
  - [x] Contadores incluidos en respuestas anidadas

- [x] **Backend: Ordenar reseñas por popularidad**
  - [x] Endpoint `/api/resenas/populares?libroId=X&limit=10` implementado
  - [x] Algoritmo de popularidad: likes + (corazones × 2) - dislikes
  - [x] Ordenamiento por score de popularidad descendente
  - [x] Servicio frontend `obtenerResenasPopulares()` creado

- [x] **Frontend: Visualización de contadores** ✅ COMPLETADO (30/10/2025)
  - [x] Componente `ReaccionContadores` creado con iconos de lucide-react
  - [x] Mostrar contadores en reseñas principales y respuestas
  - [x] Estilos con colores: verde (likes), rojo (corazones), gris (dislikes)
  - [x] Integrado en `DetalleLibro.tsx`

- [x] **Frontend: Toggle de ordenamiento** ✅ COMPLETADO (30/10/2025)
  - [x] Botón "Más populares" agregado al toggle
  - [x] useEffect para recargar reseñas según orden seleccionado
  - [x] Consumo de endpoint `/api/resenas/populares` cuando se selecciona
  - [x] Estados: "Más recientes", "Mejor valoradas", "Más populares"

- [x] **Frontend: Actualización en tiempo real** ✅ COMPLETADO (30/10/2025)
  - [x] Función `handleToggleLike` actualizada para modificar contadores
  - [x] Actualización optimista de likes en reaccionesCount
  - [x] Actualización en reseñas principales y respuestas anidadas
  - [x] Rollback en caso de error en la API

---

### 3. Sistema de Recomendaciones Personalizadas ✅ COMPLETADO (30/10/2025)

#### Backend Implementado ✅
- [x] **Servicio de recomendaciones avanzado** (`recomendacion.service.ts`)
  - [x] Algoritmo multi-factor: favoritos (peso 3) + reseñas 4+ estrellas (peso 2-3)
  - [x] Análisis de categorías y autores preferidos
  - [x] Ponderación por cantidad de estrellas en reseñas
  - [x] Bonus por recencia de libros (+10 si < 30 días)
  - [x] Exclusión inteligente de libros ya conocidos
  - [x] Fallback a libros populares para usuarios nuevos

- [x] **Sistema de puntuación implementado**
  - [x] Score = (Match Categoría × 50) + (Match Autor × 30) + Bonus Recencia
  - [x] Análisis de preferencias con weights normalizados
  - [x] Top categorías y autores por frecuencia de interacción

- [x] **Caché Redis implementado**
  - [x] TTL: 1 hora (3600 segundos)
  - [x] Clave: `recomendaciones:usuario:{id}`
  - [x] Endpoint de invalidación: `DELETE /api/recomendaciones/cache`
  - [x] Invalidación automática configurable

#### Endpoints Implementados
- [x] `GET /api/recomendaciones?limit=10` - Obtener recomendaciones
- [x] `DELETE /api/recomendaciones/cache` - Invalidar caché manualmente
- [x] Respuesta incluye metadatos del algoritmo usado

#### Documentación
- [x] `SISTEMA_RECOMENDACIONES_MEJORADO.md` (250+ líneas)
- [x] Explicación completa del algoritmo
- [x] Ejemplos de cálculo de scores
- [x] Guía de uso e integración

#### Frontend Implementado ✅ (30/10/2025)
- [x] **Servicio de recomendaciones** (`recomendacionService.ts`)
  - [x] Función `obtenerRecomendaciones(limit)` - Consume GET endpoint
  - [x] Función `invalidarCacheRecomendaciones()` - DELETE endpoint
  - [x] Interfaces TypeScript con metadata completa

- [x] **Página de recomendaciones completa** (`LibrosRecomendados.tsx`)
  - [x] Integración con servicio backend
  - [x] Mostrar razones de cada recomendación (categorías + autores matched)
  - [x] Score del algoritmo con porcentaje de match visual
  - [x] Badge "Lanzamiento reciente" para libros nuevos
  - [x] Botón "Actualizar recomendaciones" con invalidación de caché
  - [x] Estados de carga y error bien manejados
  - [x] Diseño mejorado con Tailwind CSS e iconos lucide-react
  - [x] Click en tarjetas navega al detalle del libro
  - [x] Info del algoritmo con tooltip explicativo

- [x] **Componente LibroCard mejorado**
  - [x] Modificado `extraInfo` para aceptar `string | React.ReactNode`
  - [x] Permite componentes personalizados en tarjetas
  - [x] Renderizado condicional según tipo de contenido

#### Mejoras Futuras (Opcional)
- [ ] Machine Learning para scoring más preciso
- [ ] Collaborative filtering real (usuarios similares)
- [ ] A/B testing de diferentes algoritmos
- [ ] Feedback loop (aprender de clicks/no clicks)
- [ ] Context-aware recommendations (hora, estación)

---

### 4. Feed de Actividades de Usuarios Seguidos ✅ COMPLETADO (30/10/2025)

#### Backend Implementado ✅
- [x] **Servicio de feed completo** (`feed.service.ts`)
  - [x] Método `getFeedActividades()` con paginación
  - [x] Obtiene actividades de usuarios seguidos (seguimiento.seguido)
  - [x] Ordenamiento cronológico descendente
  - [x] Soporte para filtrado por tipo de actividad
  - [x] Metadatos completos: usuario, libro, reseña, lista
  - [x] Populate automático de relaciones necesarias

- [x] **Sistema de caché Redis**
  - [x] TTL: 5 minutos (300 segundos)
  - [x] Clave: `feed:usuario:{id}:page:{page}:limit:{limit}:tipo:{tipo}`
  - [x] Invalidación manual: `DELETE /api/feed/cache`
  - [x] Método `invalidarCacheFeed()` reutilizable

- [x] **Registrador de actividades**
  - [x] `registrarActividad()` para crear nuevas actividades
  - [x] Mapeo de tipo de actividad
  - [x] Soporte para reseña, favorito, lista, seguimiento, rating

- [x] **Optimización de queries**
  - [x] Populate estratégico con solo campos necesarios
  - [x] Query eficiente con filtrado en base de datos
  - [x] Limit/offset nativos de MikroORM

#### Controlador y Rutas Implementados ✅
- [x] `GET /api/feed?page=1&limit=20&tipo=resena` - Obtener feed
- [x] `DELETE /api/feed/cache` - Invalidar caché manualmente
- [x] Validación de parámetros de paginación
- [x] Respuesta con metadatos: total, página, tienesMas

#### Documentación
- [x] `SISTEMA_FEED_ACTIVIDADES.md` (215+ líneas)
- [x] Ejemplos de respuesta de API
- [x] Arquitectura de caché explicada
- [x] Guía de integración frontend

#### Mejoras Futuras (Opcional)
- [ ] Agregación de actividades similares ("Juan y 5 más añadieron este libro")
- [ ] Notificaciones push para nuevas actividades
- [ ] Filtros avanzados (rango de fechas, múltiples tipos)
- [ ] Vista de "lo que te perdiste" para usuarios inactivos
- [ ] Algoritmo de relevancia (no solo cronológico)

#### Frontend Pendiente
- [x] Vista timeline/feed básica (existente en código)
- [ ] **Mejoras necesarias:**
  - [ ] Infinite scroll implementado
  - [ ] Filtros visuales por tipo de actividad
  - [ ] Iconos y estilos mejorados por tipo
  - [ ] Links clickeables a reseñas/listas/libros
  - [ ] Componente de "Cargar más" o paginación visual
  - [ ] Indicador de feed vacío personalizado
  - [ ] Pull-to-refresh en mobile
  - [ ] Transiciones/animaciones suaves

---

## 🐛 Bugs y Correcciones Identificados

### Backend

#### ✅ Listas - CORREGIDO (29/10/2025)
- [x] ~~`getListaById` no populaba contenidos~~ → Corregido
- [x] ~~`getListas` no populaba contenidos~~ → Corregido  
- [x] ~~Relación obsoleta `Libro.lista`~~ → Eliminada del código
- [x] ~~Migración para eliminar `lista_id` de tabla libro~~ → BD ya correcta

#### Pendientes
- [ ] **Validación de datos**
  - [ ] Agregar validación con `class-validator` en DTOs
  - [ ] Validar emails únicos en registro
  - [ ] Validar rangos de estrellas (1-5)
  - [ ] Validar longitud de comentarios de reseñas

- [ ] **Gestión de errores**
  - [ ] Crear middleware global de manejo de errores
  - [ ] Logging estructurado con Winston o similar
  - [ ] Respuestas de error consistentes

- [ ] **Autenticación y Seguridad**
  - [ ] Implementar refresh tokens
  - [ ] Rate limiting en endpoints públicos
  - [ ] Sanitización de inputs
  - [ ] CORS configurado correctamente para producción

- [ ] **Testing**
  - [ ] Tests unitarios para controladores
  - [ ] Tests de integración para endpoints
  - [ ] Tests para servicios (solo existe `externalAuthor.controller.test.ts`)
  - [ ] Coverage mínimo del 70%

### Frontend

- [ ] **Manejo de estados**
  - [ ] Implementar estado global con Context API o Zustand
  - [ ] Manejo consistente de loading states
  - [ ] Manejo de errores en llamadas API

- [ ] **UX/UI**
  - [ ] Feedback visual en acciones (agregar a favoritos, seguir usuario)
  - [ ] Confirmaciones para acciones destructivas
  - [ ] Mensajes de error amigables
  - [ ] Loading skeletons en vez de spinners

- [ ] **Optimización**
  - [ ] Lazy loading de componentes
  - [ ] Paginación infinita en listados largos
  - [ ] Debounce en búsquedas
  - [ ] Caché de imágenes

---

## 📊 Optimización y Performance

### Backend
- [ ] **Base de datos**
  - [ ] Índices en columnas frecuentemente consultadas
  - [ ] Análisis de queries N+1
  - [ ] Optimizar populate en queries complejas
  - [ ] Implementar paginación en todos los listados

- [ ] **Caché**
  - [x] Redis básico implementado
  - [ ] Estrategia de caché para listados populares
  - [ ] Caché de contadores (likes, seguidores, etc.)
  - [ ] Invalidación inteligente de caché

- [ ] **APIs Externas**
  - [x] Google Books API implementada
  - [x] Hardcover API implementada
  - [ ] Rate limiting para APIs externas
  - [ ] Fallback cuando APIs no responden
  - [ ] Caché agresivo de datos de APIs externas

### Frontend
- [ ] **Code Splitting**
  - [ ] Separar bundle por rutas
  - [ ] Lazy loading de componentes pesados

- [ ] **Assets**
  - [ ] Optimizar imágenes (WebP, compresión)
  - [ ] Lazy loading de imágenes
  - [ ] CDN para assets estáticos

---

## 📝 Documentación

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI para endpoints
  - [ ] Ejemplos de requests/responses
  - [ ] Autenticación y permisos documentados

- [ ] **README**
  - [ ] Instrucciones de instalación detalladas
  - [ ] Variables de entorno requeridas
  - [ ] Comandos útiles
  - [ ] Arquitectura del proyecto

- [ ] **Código**
  - [ ] JSDoc en funciones complejas
  - [ ] Comentarios explicativos donde sea necesario
  - [ ] Diagramas de flujo para lógica compleja

---

## 🔒 Seguridad

- [ ] **Autenticación**
  - [ ] Implementar refresh tokens
  - [ ] Expiración de tokens configurable
  - [ ] Logout en todas las sesiones

- [ ] **Autorización**
  - [ ] Middleware de permisos por rol
  - [ ] Verificar ownership en operaciones
  - [ ] Proteger endpoints administrativos

- [ ] **Datos sensibles**
  - [ ] Encriptar datos sensibles en BD
  - [ ] No exponer información de error en producción
  - [ ] Sanitizar inputs antes de guardar

---

## 🎨 Funcionalidades Adicionales (Nice to Have)

### Sistema de Notificaciones
- [ ] Backend: tabla de notificaciones
- [ ] Notificaciones en tiempo real (WebSockets/SSE)
- [ ] Centro de notificaciones en frontend
- [ ] Configuración de preferencias de notificación

### Sistema de Insignias/Logros
- [ ] Insignias por cantidad de reseñas
- [ ] Insignias por libros leídos
- [ ] Sistema de niveles de usuario
- [ ] Mostrar en perfil

### Estadísticas de Usuario
- [ ] Dashboard personal con estadísticas
- [ ] Libros leídos por año/mes
- [ ] Géneros favoritos
- [ ] Gráficos de actividad

### Búsqueda Avanzada
- [ ] Búsqueda por múltiples criterios
- [ ] Autocompletado inteligente
- [ ] Búsqueda por autor, categoría, saga simultáneamente
- [ ] Filtros avanzados (fecha, rating, etc.)

### Exportar Datos
- [ ] Exportar listas a CSV/PDF
- [ ] Exportar historial de reseñas
- [ ] Compartir listas públicas con URL

### Integración Social
- [ ] Compartir reseñas en redes sociales
- [ ] Open Graph tags para previews
- [ ] Login con OAuth (Google, Facebook)

---

## 🚀 Deploy y DevOps

- [ ] **CI/CD**
  - [ ] Pipeline de GitHub Actions
  - [ ] Tests automáticos en PRs
  - [ ] Deploy automático a staging

- [ ] **Producción**
  - [ ] Configurar variables de entorno
  - [ ] HTTPS configurado
  - [ ] Backup automático de BD
  - [ ] Monitoring con Sentry o similar
  - [ ] Logs centralizados

- [ ] **Docker**
  - [ ] Dockerfile para backend
  - [ ] Dockerfile para frontend
  - [ ] docker-compose para desarrollo local

---

## 📋 Priorización (Actualizada 30/10/2025)

### ✅ COMPLETADOS (Sesión actual - 30/10/2025)
1. ~~Sistema de moderación automática de reseñas~~ - ✅ COMPLETADO
2. ~~Mejorar sistema de recomendaciones~~ - ✅ COMPLETADO
3. ~~Implementar feed de actividades de seguidos~~ - ✅ COMPLETADO
4. ~~Caché estratégico Redis (recomendaciones + feed)~~ - ✅ COMPLETADO
5. ~~Contadores de reacciones en reseñas (backend)~~ - ✅ COMPLETADO
6. ~~Endpoint de reseñas populares por reacciones~~ - ✅ COMPLETADO
7. ~~Optimización sistema de moderación (umbrales, detección, penalizaciones)~~ - ✅ COMPLETADO
8. ~~Frontend de contadores de reacciones~~ - ✅ COMPLETADO (30/10/2025)
   - ~~Componente ReaccionContadores con iconos~~
   - ~~Toggle "Más recientes/Mejor valoradas/Más populares"~~
   - ~~Actualización en tiempo real de contadores~~

### 🔴 ALTA PRIORIDAD (Para aprobar - Siguiente sprint)
1. **Frontend de sistemas nuevos** - Feed completo, página de recomendaciones
3. **Validación completa de datos** - class-validator en todos los endpoints
4. **Tests básicos** - Jest + Supertest en endpoints críticos
5. **Documentación de API** - Swagger o Postman collection completa

### 🟡 MEDIA PRIORIDAD (Mejoras importantes)
1. **Sistema de notificaciones básico** - WebSocket o SSE
2. **Optimización de queries** - Revisar N+1 problems
3. **Dashboard de estadísticas** - Página de perfil con métricas
4. **Exportar datos de usuario** - CSV de listas y reseñas
5. **Invalidación automática de caché** - Hooks post-creación/actualización

### 🟢 BAJA PRIORIDAD (Nice to have)
1. Sistema de insignias/logros
2. Estadísticas avanzadas con gráficos
3. Integración social (OAuth, compartir)
4. Búsqueda super avanzada con filtros múltiples
5. Temas/personalización visual

---

## ✅ Checklist Pre-Entrega

### Funcionalidad Backend
- [x] Todos los CRUDs funcionan correctamente
- [x] Sistema de moderación implementado ✅
- [x] Recomendaciones personalizadas funcionan ✅
- [x] Feed de seguidos implementado ✅
- [x] Reacciones a reseñas (endpoints) ✅
- [x] **Contadores de reacciones en respuesta** - ✅ COMPLETADO
- [ ] Validación con class-validator
- [ ] Tests unitarios básicos

### Funcionalidad Frontend
- [x] Autenticación y registro
- [x] Vista de libros y detalles
- [x] Sistema de listas (leído, pendiente)
- [x] Reseñas CRUD básico
- [x] Sistema de seguimiento
- [x] **Contadores de reacciones en reseñas** - ✅ COMPLETADO (30/10/2025)
- [x] **Toggle de ordenamiento (recientes/valoradas/populares)** - ✅ COMPLETADO (30/10/2025)
- [ ] **Feed de actividades (UI completa)** - PENDIENTE
- [ ] **Página de recomendaciones** - PENDIENTE
- [ ] Notificaciones visuales

### Calidad
- [x] Backend sin errores críticos
- [ ] Frontend sin errores en consola
- [ ] Sin warnings importantes
- [ ] Tests básicos pasando (0% cobertura actualmente)
- [ ] Performance aceptable (<2s carga inicial)

### Documentación
- [x] README principal con estructura
- [x] Documentación de sistemas nuevos (3 archivos MD)
- [ ] API documentada (Swagger o Postman)
- [x] Instrucciones de instalación claras
- [ ] Variables de entorno documentadas en .env.example

### Infraestructura
- [x] MySQL configurado y funcionando
- [x] Redis configurado y funcionando
- [x] Migraciones ejecutadas correctamente
- [ ] Scripts de seed actualizados
- [ ] Docker compose configurado

### Despliegue (Opcional)
- [ ] Backend desplegado (Render/Railway/Fly.io)
- [ ] Frontend desplegado (Vercel/Netlify)
- [ ] Base de datos en producción
- [ ] Redis en producción
- [ ] Variables de entorno configuradas
- [ ] HTTPS configurado

---

## 📞 Contacto y Asignaciones

Asignar tareas entre los miembros del equipo:
- **Joaquina Gomez Manna** (47791)
- **Nahuel Carloni** (51095)
- **Agustina Chacón** (50980)
- **Joaquín Mierez** (49938)

---

**Nota:** Este TODO refleja el estado actual del proyecto basado en el análisis del código. Priorizar las funcionalidades marcadas como "Para Aprobación" en el README original.
