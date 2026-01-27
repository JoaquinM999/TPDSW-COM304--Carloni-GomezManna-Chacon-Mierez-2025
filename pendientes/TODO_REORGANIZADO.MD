# 📋 TODO - BookCode (Reorganizado por Viabilidad)

> **Última actualización:** 27 de enero de 2026  
> **Cambios:** Eliminado lo inviable, reorganizado por plazos realistas  
**Versión:** 2.1

---

## 🎓 URGENTE - ENTREGA ACADÉMICA (Prioridad Máxima)

> **Nota:** Ver [TODO1.md](./TODO1.md) para detalles completos de requisitos académicos

### 🚨 Tareas Críticas Pendientes

#### 🌐 Deploy de Producción (Alta Prioridad)
- [ ] **Deploy Backend en Render/Railway/Coolify**
  - [ ] Crear servicio PostgreSQL en producción
  - [ ] Configurar variables de entorno (JWT_SECRET, DATABASE_*, REDIS_URL)
  - [ ] Verificar que API responde correctamente
  - [ ] URL objetivo: `https://biblioteca-api.onrender.com` (ejemplo)

- [ ] **Deploy Frontend en Vercel/Netlify**
  - [ ] Configurar VITE_API_URL apuntando al backend
  - [ ] Configurar redirects SPA (/* -> /index.html)
  - [ ] Verificar que app carga sin errores
  - [ ] URL objetivo: `https://biblioteca-dsw.vercel.app` (ejemplo)

#### 🎥 Video Demo (Alta Prioridad) ⏱️ 8-10 minutos
- [ ] **Preparación del ambiente**
  - [ ] Backend/Frontend corriendo en producción sin errores
  - [ ] Usuarios de demo creados y verificados
  - [ ] Datos de prueba cargados

- [ ] **Grabación** (seguir [VIDEO_DEMO_SCRIPT.md](../VIDEO_DEMO_SCRIPT.md))
  - [ ] Grabar demostración 8-10 minutos
  - [ ] Mostrar 3 roles: Usuario, Moderador, Admin
  - [ ] Demostrar CRUDs, búsquedas, moderación, notificaciones
  - [ ] Mostrar tests y arquitectura
  - [ ] Sin errores en consola

- [ ] **Edición y Publicación**
  - [ ] Renderizar Full HD (1920x1080)
  - [ ] Añadir títulos/secciones
  - [ ] Subir a YouTube (unlisted) o Google Drive
  - [ ] Obtener link para compartir

#### 📋 Entrega Final
- [ ] **Completar formulario** (https://kutt.it/DSWEntregaSistemaFinal)
  - [ ] Link al video demo
  - [ ] Link al repositorio
  - [ ] Links a deploys (Frontend + Backend)
  - [ ] Credenciales de acceso (demo/moderador/admin)
  - [ ] Link a [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
  - [ ] Contacto para defensa oral

#### 🗣️ Defensa Oral
- [ ] Coordinar fecha con docentes
- [ ] Preparar presentación 10-15 minutos
- [ ] Asignar partes a cada integrante
- [ ] Preparar respuestas técnicas

#### ✅ Verificación Pre-Entrega
- [ ] Deploys funcionando
- [ ] Login con 3 credenciales OK
- [ ] Video accesible
- [ ] README.md actualizado
- [ ] Sin errores en consola

---

## 🚀 CORTO PLAZO (1-4 semanas) - Quick Wins

### 🔴 Prioridad Crítica - Performance

#### Bugs Críticos (1-2 días)
- [ ] Revisar comportamiento del botón "Volver"
- [ ] Corregir problemas de caché en imágenes
- [ ] Mejorar manejo de errores 404
- [ ] Revisar duplicados en búsquedas

#### Frontend Performance (3-5 días)
- [ ] **Lazy loading de imágenes** - 2-3h
- [ ] **Skeleton loaders** en lugar de spinners - 3-4h
- [ ] **Error boundaries** en componentes críticos - 2-3h
- [ ] **Mejorar responsividad tablets** (768px-1024px) - 4-6h

#### Backend Performance (2-3 días)
- [ ] **Full-Text Search en MySQL** - 2-3h
  ```sql
  ALTER TABLE autor ADD FULLTEXT INDEX idx_fulltext_autor (nombre, apellido);
  ```
- [ ] **Cache de APIs Externas** (24h TTL) - 2h
- [ ] **Rate limiting granular** - 3-4h
- [ ] **Health checks** - 2-3h
- [ ] **Logging mejorado** - 4-6h

### 🎨 UI/UX Rápida (1 semana)

- [ ] Animaciones de transición entre páginas
- [ ] Sistema de toasts/notificaciones mejorado
- [ ] Micro-interacciones en botones (hover, click)
- [ ] Breadcrumbs en páginas profundas
- [ ] Modo compacto/expandido para listas

### 📚 Mejoras de Libros (3-4 días)

- [ ] Badges (nuevos, populares, bestsellers)
- [ ] Más información al hover en tarjetas
- [ ] Vista de tabla alternativa
- [ ] Lightbox para portadas (zoom)
- [ ] Compartir en redes sociales
- [ ] Tabs para organizar información
- [ ] "Leer más tarde" con recordatorios

### ✍️ Mejoras de Reseñas (2-3 días)

- [ ] Mejorar diseño de tarjetas
- [ ] Highlighting de reseñas verificadas
- [ ] Badges de "top reviewer"
- [ ] Indicador visual de moderación
- [ ] Sistema de reacciones emoji

---

## ⚙️ MEDIO PLAZO (1-3 meses) - Features Sustanciales

### 🟡 Frontend Avanzado (2-3 semanas)

- [ ] **Code splitting por rutas** - 8-12h
- [ ] **Service workers PWA** - 12-16h
- [ ] **Virtual scrolling** para listas grandes - 8-10h
- [ ] Optimizar bundle size
- [ ] Caché inteligente
- [ ] Modo offline básico

### 👥 Autores - Mejoras Medias (1-2 semanas)

- [ ] **Wikipedia API** para biografías - 3-4h
- [ ] **Infinite Scroll** - 6-8h (usar `react-infinite-scroll-component`)
- [ ] **Búsqueda Fonética** - 4-6h (usar `natural@8.1.0`)
- [ ] Línea de tiempo de obras
- [ ] Seguimiento de autores
- [ ] Notificaciones de lanzamientos

### 🔍 Búsqueda y Filtros (1-2 semanas)

- [ ] Búsqueda fuzzy mejorada
- [ ] Filtros dinámicos
- [ ] Historial de búsquedas
- [ ] Autocompletado inteligente
- [ ] Corrección ortográfica
- [ ] Highlighting de términos

### 📝 Listas y Favoritos (1 semana)

- [ ] Mejorar drag & drop visual
- [ ] Covers personalizados
- [ ] Vista de mosaico
- [ ] Importar/exportar listas
- [ ] Plantillas predefinidas
- [ ] Lista de deseos compartible

### 👤 Perfil de Usuario (1-2 semanas)

- [ ] Banner personalizable
- [ ] Estadísticas visuales (gráficos)
- [ ] Línea de tiempo de actividad
- [ ] Objetivos de lectura
- [ ] Gráficos de progreso
- [ ] Exportación de datos

### 🎮 Gamificación Básica (1-2 semanas)

- [ ] Sistema de puntos/XP
- [ ] Achievements/trofeos
- [ ] Racha de lectura (streak)
- [ ] Desafíos diarios/semanales
- [ ] Leaderboards

### 🔒 Seguridad (1 semana)

- [ ] Rate limiting por IP
- [ ] CAPTCHA en formularios críticos
- [ ] Content Security Policy (CSP)
- [ ] Logs de seguridad
- [ ] Validación de inputs mejorada

### 📱 Móvil/Responsive (1 semana)

- [ ] Bottom navigation bar
- [ ] Pull-to-refresh
- [ ] Tamaño de touch targets
- [ ] Performance en dispositivos low-end
- [ ] Modo de lectura móvil

### ♿ Accesibilidad (1 semana)

- [ ] Navegación por teclado
- [ ] ARIA labels completos
- [ ] Skip links
- [ ] Modo alto contraste
- [ ] Soporte lectores de pantalla

### 📄 Backend Avanzado (2 semanas)

- [ ] **Swagger/OpenAPI** - 8-10h
- [ ] Versionado de API
- [ ] Tests de integración
- [ ] Respaldos automáticos
- [ ] Índices adicionales

---

## 🌟 LARGO PLAZO (3+ meses) - Features Avanzadas

### 🤖 IA Gratuita - Implementación Progresiva

#### Fase 1: Análisis Básico (1-2 semanas)
- [ ] **Análisis de sentimiento** - Hugging Face
  - Modelo: `distilbert-base-uncased-finetuned-sst-2-english`
  - 30k requests/mes gratis
- [ ] **Detección de spoilers** - Regex + palabras clave
  - 100% gratis, sin APIs

#### Fase 2: Recomendaciones (2-4 semanas)
- [ ] **Recomendaciones ML** - TensorFlow.js
  - Filtrado colaborativo
  - Ejecuta en navegador, gratis
- [ ] **Categorización automática**
  - Zero-shot: `facebook/bart-large-mnli`

#### Fase 3: Características Avanzadas (1-2 meses)
- [ ] **Resúmenes automáticos** - `facebook/bart-large-cnn`
- [ ] **Predicción de calificaciones** - Regresión TensorFlow.js
- [ ] **Chatbot** - Dialogflow (gratis) o Rasa (open source)

### 💬 Social/Seguimiento (2-3 semanas)

- [ ] Grupos de lectura
- [ ] Feed de actividades
- [ ] Eventos de lectura conjunta
- [ ] Desafíos entre amigos

### 📧 Comunicaciones (2-3 semanas)

- [ ] Emails transaccionales
- [ ] Newsletter personalizada
- [ ] Notificaciones push
- [ ] Mensajería interna
- [ ] Notificaciones en tiempo real
- [ ] Digest semanal

### 🔧 Administración (2 semanas)

- [ ] Panel de moderación mejorado
- [ ] Bulk actions
- [ ] Dashboard de estadísticas
- [ ] Sistema de reportes
- [ ] Roles granulares
- [ ] Logs de auditoría

### 🌐 Integraciones (3-4 semanas)

- [ ] API pública documentada
- [ ] Webhooks
- [ ] Integración Goodreads (evaluar)

### 📊 SEO y Marketing (1-2 semanas)

- [ ] Meta tags dinámicos
- [ ] Sitemap XML dinámico
- [ ] Structured data (Schema.org)
- [ ] Open Graph + Twitter Cards
- [ ] URLs amigables
- [ ] Canonical URLs

### 🌍 Internacionalización (Si hay demanda)

- [ ] Soporte multiidioma
- [ ] Detección automática idioma
- [ ] Formatos de fecha localizados
- [ ] Soporte RTL

### 🗄️ Base de Datos Avanzada

- [ ] Particionamiento de tablas
- [ ] Archivado de datos antiguos
- [ ] Replicación para lectura
- [ ] Auditoría de cambios

### 🔐 Seguridad Avanzada

- [ ] 2FA (autenticación dos factores)
- [ ] OAuth Google/Facebook
- [ ] Detección sesiones sospechosas
- [ ] Rotación automática tokens
- [ ] Backup encryption

---

## 📚 Documentación (Continuo)

- [ ] Guía de usuario completa
- [ ] FAQ interactivo
- [ ] Documentación API
- [ ] Guía de contribución
- [ ] Changelog automático
- [ ] Guía de estilo

---

## ❌ ELIMINADO - Inviable o Duplicado

### 🚫 Demasiado Complejo
- ❌ Job Queue con Bull (20+ horas, overkill)
- ❌ Clean Architecture (60-80 horas refactoring)
- ❌ Búsqueda por imagen (ML avanzado costoso)
- ❌ Traducción automática (muy costoso)
- ❌ Chat en tiempo real (WebSockets + infra)
- ❌ Integración Amazon (API compleja/costosa)
- ❌ Bibliotecas locales (acuerdos externos)
- ❌ Programa afiliados (legal/comercial)

### 🚫 Bajo Impacto vs Esfuerzo
- ❌ Galería imágenes libro (solo hay portadas)
- ❌ Historial precios (no es tienda)
- ❌ Comparador de libros (nicho)
- ❌ Timeline actualizaciones (dato inexistente)
- ❌ Listas colaborativas (permisos complejos)
- ❌ Versionado de listas (overkill)
- ❌ Eventos/firmas autores (gestión eventos)
- ❌ Comparación autores (métrica poco clara)
- ❌ Conexiones autores (grafo complejo)
- ❌ Calculadora tiempo lectura (muy variable)
- ❌ Modo maratón (nicho)
- ❌ Predicción tendencias (ML complejo)
- ❌ Recomendaciones por humor (subjetivo)
- ❌ Stories de lectura (copia redes)
- ❌ Funnel analysis (usar tools externas)
- ❌ User journey (usar tools externas)
- ❌ Sync dispositivos (infra cloud)
- ❌ Subtítulos videos (no hay videos)
- ❌ Conversión monedas (no es tienda)
- ❌ Virtual Scrolling TanStack (hay alternativa)

### ✅ Ya Implementado
- ✅ Moderación automática reseñas
- ✅ Auto-rechazo de reseñas
- ✅ Búsqueda híbrida autores
- ✅ Redis cache
- ✅ 620 tests unitarios backend
- ✅ Búsqueda predictiva SearchBar
- ✅ Dropdown notificaciones
- ✅ Menú móvil animado
- ✅ Accesos rápidos
- ✅ Newsletter section
- ✅ Stats section
- ✅ Iconos redes animados

---

## 📊 Resumen de Prioridades

### 🔴 **Hacer YA** (Esta semana)
1. Full-Text Search MySQL
2. Lazy loading imágenes
3. Error boundaries
4. Bugs críticos

### 🟡 **Hacer Pronto** (Este mes)
1. Code splitting
2. PWA básica
3. Infinite scroll
4. Gamificación básica

### 🟢 **Hacer Después** (3+ meses)
1. IA con Hugging Face
2. Comunicaciones avanzadas
3. Features sociales
4. Internacionalización

---

**Equipo BookCode** | Versión 2.0 | 27 enero 2026
