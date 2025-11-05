# 📋 TODO - Mejoras del Proyecto BookCode

## 🎨 Mejoras Visuales Generales

### UI/UX Global
- [ ] Implementar animaciones de transición entre páginas más suaves
- [ ] Agregar skeleton loaders en lugar de spinners genéricos
- [ ] Mejorar responsividad en tablets (768px - 1024px)
- [ ] Implementar sistema de toasts/notificaciones más atractivo
- [ ] Agregar micro-interacciones en botones y tarjetas (hover, click)
- [ ] Mejorar contraste de colores para accesibilidad WCAG
- [ ] Implementar modo compacto/expandido para vistas de lista
- [ ] Agregar breadcrumbs en páginas profundas

### Header/Navegación
- [ ] Agregar indicador visual de página activa en la navegación
- [ ] Implementar búsqueda predictiva con sugerencias en tiempo real
- [ ] Agregar dropdown de notificaciones más visual
- [ ] Mejorar animación del menú móvil (hamburger menu)
- [ ] Agregar accesos rápidos personalizables
- [ ] Implementar búsqueda por voz
- [ ] Agregar filtros rápidos en la barra de búsqueda

### Footer
- [ ] Agregar sección de newsletter más atractiva
- [ ] Implementar mapa del sitio visual
- [ ] Agregar estadísticas generales de la plataforma
- [ ] Mejorar enlaces de redes sociales con iconos animados

---

## 📄 Mejoras por Página

### 🏠 Página Principal (Home)
**Visuales:**
- [ ] Mejorar diseño del Hero Section con parallax
- [ ] Agregar sección de estadísticas en tiempo real
- [ ] Implementar carrusel de reseñas destacadas
- [ ] Agregar sección "Libro del día"
- [ ] Mejorar featured content con hover effects
- [ ] Agregar preview de autores destacados

**Funcionalidad:**
- [ ] Implementar personalización del feed según preferencias
- [ ] Agregar sistema de recomendaciones basado en tendencias
- [ ] Implementar scroll infinito para contenido
- [ ] Agregar filtros rápidos por género
- [ ] Implementar modo "descubrir" aleatorio

### 📚 Página de Libros
**Visuales:**
- [ ] Mejorar grid de libros con diferentes tamaños
- [ ] Agregar vista de tabla alternativa
- [ ] Implementar modo de vista compacta
- [ ] Mejorar tarjetas de libro con más información al hover
- [ ] Agregar badges para libros nuevos, populares, bestsellers

**Funcionalidad:**
- [ ] Implementar filtros avanzados (rango de páginas, año, idioma)
- [ ] Agregar ordenamiento por múltiples criterios
- [ ] Implementar comparador de libros (seleccionar múltiples)
- [ ] Agregar vista previa rápida sin salir de la página
- [ ] Implementar búsqueda dentro de resultados
- [ ] Agregar exportación de listas a CSV/PDF
- [ ] Implementar paginación con "ir a página"

### 📖 Detalle de Libro
**Visuales:**
- [ ] Mejorar diseño de la portada con zoom/lightbox
- [ ] Agregar galería de imágenes del libro
- [ ] Mejorar visualización de estadísticas con gráficos
- [ ] Implementar tabs para organizar información
- [ ] Agregar timeline de actualizaciones del libro
- [ ] Mejorar diseño de sección de reseñas

**Funcionalidad:**
- [ ] Implementar sistema de citado de fragmentos
- [ ] Agregar "libros similares" mejorado con IA
- [ ] Implementar sistema de etiquetas personalizadas
- [ ] Agregar historial de cambios de precio
- [ ] Implementar compartir en redes sociales
- [ ] Agregar comparación con otros libros
- [ ] Implementar sistema de notas privadas
- [ ] Agregar recordatorio de lanzamiento (para pre-ordenes)
- [ ] Implementar "leer más tarde" con recordatorios

### ✍️ Reseñas
**Visuales:**
- [ ] Mejorar diseño de tarjetas de reseña
- [ ] Agregar avatares de usuario más prominentes
- [ ] Implementar highlighting de reseñas verificadas
- [ ] Mejorar sistema de respuestas (threading visual)
- [ ] Agregar badges de "top reviewer"
- [ ] Mostrar indicador visual de moderación automática

**Funcionalidad:**
- [x] ✅ **Sistema de moderación automática** - Ya implementado (moderationScore, autoModerated)
- [x] ✅ **Auto-rechazo de reseñas** - Ya implementado (autoRejected, rejectionReason)
- [x] ✅ **Estados de reseña** - Sistema completo (PENDING/APPROVED/FLAGGED/REJECTED)
- [ ] Implementar sistema de reacciones emoji
- [ ] Agregar filtros por calificación y utilidad
- [ ] Implementar búsqueda dentro de reseñas
- [ ] Agregar sistema de "útil/no útil" con feedback
- [ ] Implementar edición de reseñas con historial
- [ ] Agregar opción de reseña anónima
- [ ] Agregar traducción automática de reseñas

### 👤 Perfil de Usuario
**Visuales:**
- [ ] Mejorar diseño del header del perfil
- [ ] Agregar banner personalizable
- [ ] Implementar estadísticas visuales (gráficos)
- [ ] Mejorar diseño de la biblioteca personal
- [ ] Agregar línea de tiempo de actividad

**Funcionalidad:**
- [ ] Implementar niveles/logros de usuario
- [ ] Agregar racha de lectura (streak)
- [ ] Implementar objetivos de lectura personalizables
- [ ] Agregar gráficos de progreso de lectura
- [ ] Implementar exportación de datos personales
- [ ] Agregar gestión de privacidad granular
- [ ] Implementar desafíos de lectura
- [ ] Agregar calendario de lectura

### 📝 Listas
**Visuales:**
- [ ] Mejorar diseño de tarjetas de listas
- [ ] Agregar covers/thumbnails personalizados
- [ ] Implementar vista de mosaico de portadas
- [ ] Mejorar drag & drop visual (backend ya soporta campo `orden`)

**Funcionalidad:**
- [x] ✅ **Ordenamiento personalizado** - Campo `orden` implementado en ContenidoLista
- [x] ✅ **Constraint único lista-libro** - Evita duplicados en misma lista
- [ ] Implementar listas colaborativas
- [ ] Agregar versionado de listas
- [ ] Implementar importar/exportar listas
- [ ] Agregar sugerencias automáticas para listas
- [ ] Implementar plantillas de listas predefinidas
- [ ] Agregar modo de presentación de lista
- [ ] Implementar lista de deseos compartible

### ⭐ Favoritos
**Visuales:**
- [ ] Mejorar organización visual por categorías
- [ ] Agregar vista de línea de tiempo
- [ ] Implementar modo de cuadrícula adaptativa

**Funcionalidad:**
- [ ] Agregar subcategorías de favoritos
- [ ] Implementar sincronización entre dispositivos
- [ ] Agregar notas rápidas en favoritos
- [ ] Implementar recordatorios de revisión
- [ ] Agregar exportación a diferentes formatos

### 🔍 Búsqueda
**Visuales:**
- [ ] Mejorar diseño de la página de resultados
- [ ] Agregar highlighting de términos buscados
- [ ] Implementar vista previa de resultados

**Funcionalidad:**
- [ ] Implementar búsqueda fuzzy mejorada
- [ ] Agregar búsqueda por similitud semántica
- [ ] Implementar filtros dinámicos basados en resultados
- [ ] Agregar historial de búsquedas
- [ ] Implementar búsqueda por imagen (portada)
- [ ] Agregar autocompletado inteligente
- [ ] Implementar corrección ortográfica

### 👥 Autores
**Visuales:**
- [ ] Mejorar diseño de tarjetas de autor
- [ ] Agregar biografía expandible visualmente (biografía ya viene de APIs)
- [ ] Implementar línea de tiempo de obras
- [ ] Mostrar origen de datos (local vs API externa)

**Funcionalidad:**
- [x] ✅ **Fotos de autores** - Campo `foto` implementado
- [x] ✅ **Biografías** - Campo `biografia` desde APIs externas
- [x] ✅ **Búsqueda híbrida** - Local + Google Books + OpenLibrary
- [x] ✅ **Prevención de duplicados** - Constraint único + reconciliación
- [x] ✅ **IDs externos** - googleBooksId y openLibraryKey
- [ ] Agregar seguimiento de autores
- [ ] Implementar notificaciones de nuevos lanzamientos
- [ ] Agregar eventos/firmas de autores
- [ ] Implementar comparación entre autores
- [ ] Agregar estadísticas de popularidad
- [ ] Implementar conexiones entre autores

### 📚 Sagas
**Visuales:**
- [ ] Mejorar visualización de orden de lectura
- [ ] Agregar línea de tiempo visual de publicaciones
- [ ] Implementar progreso visual de lectura de saga

**Funcionalidad:**
- [ ] Agregar tracking automático de progreso
- [ ] Implementar recordatorios de continuación
- [ ] Agregar calculadora de tiempo de lectura total
- [ ] Implementar modo maratón de lectura
- [ ] Agregar discusiones por saga

### 🆕 Nuevos Lanzamientos
**Visuales:**
- [ ] Mejorar badges de "NUEVO"
- [ ] Agregar countdown para próximos lanzamientos
- [ ] Implementar vista de calendario

**Funcionalidad:**
- [ ] Agregar pre-orden tracking
- [ ] Implementar alertas de disponibilidad
- [ ] Agregar wishlist de próximos lanzamientos
- [ ] Implementar filtros por fecha de lanzamiento

### 🏆 Libros Populares
**Visuales:**
- [ ] Agregar ranking visual más atractivo
- [ ] Implementar gráficos de tendencias
- [ ] Mejorar indicadores de posición en ranking

**Funcionalidad:**
- [ ] Agregar filtros por período de tiempo
- [ ] Implementar comparación histórica
- [ ] Agregar alertas de cambio de ranking
- [ ] Implementar predicciones de tendencias

### 💡 Recomendaciones
**Visuales:**
- [ ] Mejorar explicación de por qué se recomienda
- [ ] Agregar tarjetas de match percentage
- [ ] Implementar vista de exploración

**Funcionalidad:**
- [ ] Mejorar algoritmo de recomendación con ML
- [ ] Agregar ajuste de preferencias en tiempo real
- [ ] Implementar feedback loop de recomendaciones
- [ ] Agregar modo "sorpréndeme"
- [ ] Implementar recomendaciones por estado de ánimo

### 👥 Social/Seguimiento
**Visuales:**
- [ ] Mejorar diseño del feed de actividades
- [ ] Agregar stories de lectura
- [ ] Implementar vista de actividad de amigos

**Funcionalidad:**
- [ ] Agregar grupos de lectura
- [ ] Implementar chat entre usuarios
- [ ] Agregar eventos de lectura conjunta
- [ ] Implementar desafíos entre amigos
- [ ] Agregar recomendaciones de seguimiento

---

## ⚙️ Mejoras Técnicas y de Rendimiento

### Frontend
- [ ] Implementar lazy loading de imágenes
- [ ] Agregar service workers para PWA
- [ ] Implementar code splitting por rutas
- [ ] Mejorar manejo de errores global
- [ ] Agregar modo offline básico
- [ ] Implementar caché inteligente
- [ ] Optimizar bundle size
- [ ] Agregar error boundaries en componentes críticos
- [ ] Implementar virtual scrolling para listas grandes
- [ ] Mejorar gestión de estado global

### Backend
- [x] ✅ **Sistema de caché con Redis** - Implementado en redis.ts con modo mock
- [x] ✅ **Índices de base de datos** - Implementados en autores (nombre, apellido, IDs externos)
- [ ] Implementar rate limiting más granular
- [ ] Mejorar logging y monitoreo
- [ ] Implementar health checks
- [ ] Agregar documentación API (Swagger)
- [ ] Implementar versionado de API
- [ ] Mejorar manejo de errores
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar respaldos automáticos
- [ ] Optimizar queries de base de datos (considerar más índices)

### Base de Datos
- [ ] Agregar índices en columnas frecuentemente consultadas
- [ ] Implementar particionamiento de tablas grandes
- [ ] Agregar archivado de datos antiguos
- [ ] Implementar replicación para lectura
- [ ] Mejorar esquema de caché
- [ ] Agregar auditoría de cambios

---

## 🔒 Seguridad

- [ ] Implementar autenticación de dos factores (2FA)
- [ ] Agregar OAuth con Google/Facebook
- [ ] Implementar rate limiting por IP
- [ ] Mejorar validación de inputs
- [ ] Agregar CAPTCHA en formularios críticos
- [ ] Implementar Content Security Policy (CSP)
- [ ] Agregar detección de sesiones sospechosas
- [ ] Implementar rotación automática de tokens
- [ ] Agregar logs de seguridad
- [ ] Implementar backup encryption

---

## 📱 Móvil/Responsive

- [ ] Mejorar navegación móvil con gestos
- [ ] Implementar bottom navigation bar
- [ ] Agregar modo de lectura móvil optimizado
- [ ] Mejorar performance en dispositivos de baja gama
- [ ] Implementar pull-to-refresh
- [ ] Agregar soporte para modo landscape
- [ ] Mejorar tamaño de touch targets
- [ ] Implementar modo de una mano

---

## ♿ Accesibilidad

- [ ] Mejorar navegación por teclado
- [ ] Agregar ARIA labels completos
- [ ] Implementar skip links
- [ ] Mejorar contraste de colores
- [ ] Agregar modo de alto contraste
- [ ] Implementar soporte para lectores de pantalla
- [ ] Agregar subtítulos en videos
- [ ] Implementar reducción de movimiento
- [ ] Agregar opción de texto grande

---

## 🌍 Internacionalización

- [ ] Implementar soporte multiidioma completo
- [ ] Agregar detección automática de idioma
- [ ] Implementar conversión de monedas
- [ ] Agregar formatos de fecha localizados
- [ ] Implementar traducciones de contenido generado por usuarios
- [ ] Agregar soporte RTL (right-to-left)

---

## 📊 Analytics y Métricas

- [ ] Implementar tracking de eventos de usuario
- [ ] Agregar dashboard de métricas para admins
- [ ] Implementar A/B testing framework
- [ ] Agregar heatmaps de interacción
- [ ] Implementar funnel analysis
- [ ] Agregar retention metrics
- [ ] Implementar user journey tracking

---

## 🎮 Gamificación

- [ ] Implementar sistema de puntos/XP
- [ ] Agregar achievements/trofeos
- [ ] Implementar leaderboards
- [ ] Agregar desafíos diarios/semanales
- [ ] Implementar sistema de niveles
- [ ] Agregar badges coleccionables
- [ ] Implementar eventos especiales
- [ ] Agregar recompensas por actividad

---

## 🤖 Inteligencia Artificial

### ✅ Funciones Implementables con IA Gratuita

**Recomendaciones basadas en ML:**
- [ ] **Implementar con TensorFlow.js** (gratis, corre en el navegador)
  - Algoritmo de filtrado colaborativo
  - Basado en similitud de coseno entre usuarios
  - Usar datos de favoritos, calificaciones y listas
- [ ] **Alternative: Usar API de Hugging Face** (tier gratuito)
  - Modelos pre-entrenados de embeddings
  - 30,000 requests/mes gratis

**Análisis de Sentimiento en Reseñas:**
- [ ] **Sentiment Analysis con Hugging Face** ✅ GRATIS
  - Modelo: `distilbert-base-uncased-finetuned-sst-2-english`
  - Detecta sentimiento positivo/negativo
  - API gratuita: 30k requests/mes
- [ ] **Alternative: TensorFlow.js + modelo local**
  - Sin límites de requests
  - Ejecuta en el servidor Node.js

**Detección Automática de Spoilers:**
- [ ] **Clasificador personalizado con Hugging Face** ✅ GRATIS
  - Modelo: `bert-base-uncased` fine-tuned
  - Entrenar con dataset de reseñas etiquetadas
  - Google Colab gratuito para entrenamiento
- [ ] **Alternative: Regex + palabras clave** (muy básico pero efectivo)
  - Detectar patrones como "al final", "termina con", "muere"
  - 100% gratis, sin APIs

**Generación de Resúmenes Automáticos:**
- [ ] **Hugging Face Inference API** ✅ GRATIS
  - Modelo: `facebook/bart-large-cnn` o `t5-base`
  - 30k requests/mes gratis
  - Resumir sinopsis largas
- [ ] **Alternative: OpenAI API** (tier gratuito limitado)
  - $5 de crédito inicial
  - Usar GPT-3.5-turbo (más barato)

**Chatbot de Soporte:**
- [ ] **Dialogflow de Google** ✅ GRATIS
  - Tier gratuito generoso
  - Integraciones pre-construidas
  - NLP incluido
- [ ] **Alternative: Hugging Face + DialoGPT** ✅ GRATIS
  - Modelo: `microsoft/DialoGPT-medium`
  - Host en tu propio servidor
  - Sin límites de conversaciones
- [ ] **Alternative: Rasa Open Source** ✅ GRATIS
  - 100% open source
  - Self-hosted
  - Personalización completa

**Predicción de Calificaciones:**
- [ ] **Implementar regresión con TensorFlow.js** ✅ GRATIS
  - Entrenar con datos históricos
  - Variables: género, autor, año, páginas
  - Ejecuta localmente sin API
- [ ] **Alternative: Scikit-learn en backend** ✅ GRATIS
  - Python + Flask endpoint
  - Modelos de regresión simple
  - Sin costos de API

**Categorización Automática:**
- [ ] **Zero-shot Classification con Hugging Face** ✅ GRATIS
  - Modelo: `facebook/bart-large-mnli`
  - Clasificar sin entrenar
  - 30k requests/mes gratis
- [ ] **Alternative: Embeddings + K-means clustering** ✅ GRATIS
  - Usar `sentence-transformers` (gratis)
  - Agrupar libros similares automáticamente
  - 100% local

---

### 🆓 Recursos y APIs Gratuitas Recomendadas

**Hugging Face (⭐ MÁS RECOMENDADO):**
- 30,000 requests/mes GRATIS
- Cientos de modelos pre-entrenados
- Inference API incluida
- Documentación excelente
- URL: https://huggingface.co/

**TensorFlow.js:**
- 100% gratis, sin límites
- Corre en navegador o Node.js
- Modelos pre-entrenados disponibles
- Bueno para comenzar con ML
- URL: https://www.tensorflow.org/js

**Google Colab:**
- GPU gratis para entrenar modelos
- 12 horas de sesión continua
- Ideal para fine-tuning
- URL: https://colab.research.google.com/

**Ollama (Local AI):**
- 100% gratis, self-hosted
- Modelos: Llama 2, Mistral, CodeLlama
- Sin límites de tokens
- Privacidad total
- URL: https://ollama.ai/

**OpenAI (Limitado):**
- $5 de crédito inicial
- GPT-3.5-turbo: $0.50 / 1M tokens
- No recomendado para producción por costo
- URL: https://platform.openai.com/

---

### 📋 Plan de Implementación Sugerido (Orden de Prioridad)

**Fase 1 - Quick Wins (1-2 semanas):**
1. ✅ Análisis de sentimiento con Hugging Face API
2. ✅ Detección de spoilers con regex + palabras clave
3. ✅ Categorización con embeddings locales

**Fase 2 - Core Features (1 mes):**
4. ✅ Recomendaciones con TensorFlow.js (filtrado colaborativo)
5. ✅ Resúmenes automáticos con Hugging Face
6. ✅ Predicción de calificaciones con regresión simple

**Fase 3 - Advanced (Futuro):**
7. ⚠️ Chatbot con Dialogflow o Rasa
8. ⚠️ Fine-tuning de modelos personalizados en Colab

---

### 💡 Ejemplo de Implementación Rápida

**Análisis de Sentimiento (5 minutos de setup):**
```bash
npm install @huggingface/inference
```

```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference('tu_token_gratis');

async function analizarSentimiento(texto: string) {
  const resultado = await hf.textClassification({
    model: 'distilbert-base-uncased-finetuned-sst-2-english',
    inputs: texto
  });
  return resultado; // { label: 'POSITIVE', score: 0.9998 }
}
```

**Costo Total: $0** 🎉

---

## 📧 Comunicaciones

- [ ] Implementar sistema de emails transaccionales
- [ ] Agregar newsletter personalizada
- [ ] Implementar notificaciones push
- [ ] Agregar sistema de mensajería interna
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar digest semanal personalizado

---

## 🔧 Herramientas de Administración

- [ ] Mejorar panel de moderación
- [ ] Agregar herramientas de bulk actions
- [ ] Implementar dashboard de estadísticas
- [ ] Agregar sistema de reportes avanzado
- [ ] Implementar gestión de usuarios mejorada
- [ ] Agregar logs de auditoría
- [ ] Implementar sistema de roles granular

---

## 📱 Integr aciones

- [ ] Implementar integración con Goodreads
- [ ] Agregar integración con Amazon
- [ ] Implementar API pública
- [ ] Agregar webhooks
- [ ] Implementar integración con bibliotecas locales
- [ ] Agregar integración con servicios de préstamo digital

---

## 🎯 SEO y Marketing

- [ ] Mejorar meta tags dinámicos
- [ ] Implementar sitemap XML dinámico
- [ ] Agregar structured data (Schema.org)
- [ ] Implementar Open Graph tags
- [ ] Agregar Twitter Cards
- [ ] Mejorar URLs amigables
- [ ] Implementar canonical URLs
- [ ] Agregar programa de afiliados

---

## 🐛 Bugs Conocidos a Resolver

- [ ] Revisar comportamiento del botón "Volver" en todos los contextos
- [ ] Corregir problemas de caché en imágenes
- [ ] Revisar rate limiting de Google Books API
- [ ] Mejorar manejo de errores 404
- [ ] Corregir scroll infinito en algunas páginas
- [ ] Revisar duplicados en búsquedas
- [ ] Mejorar sincronización de estado entre tabs

---

## 📚 Documentación

- [ ] Crear guía de usuario completa
- [ ] Agregar video tutoriales
- [ ] Implementar FAQ interactivo
- [ ] Agregar documentación de API
- [ ] Crear guía de contribución
- [ ] Agregar changelog automático
- [ ] Implementar guía de estilo de código

---

## 🎭 Mejoras del Sistema de Autores

### ✅ COMPLETADO E IMPLEMENTADO
- [x] **Paginación en Base de Datos** - ✅ Implementado con `findAndCount()`
- [x] **Índices en BD** - ✅ idx_autor_nombre, idx_autor_nombre_apellido (Migration20251103000000)
- [x] **Corrección MySQL** - ✅ Reemplazado `$ilike` por `$like`
- [x] **Cache con Redis** - ✅ Implementado en autor.service.ts con TTL configurable
- [x] **Búsqueda Híbrida** - ✅ Google Books + OpenLibrary (GUIA_BUSQUEDA_HIBRIDA.md)
- [x] **Enriquecimiento Básico** - ✅ reconcileGoogleBooksAuthor + reconcileOpenLibraryAuthor
- [x] **IDs Externos** - ✅ googleBooksId y openLibraryKey (Migration20251103194440)

### � VIABLE - Alta Prioridad (2-4 horas c/u)
- [ ] **Full-Text Search** - Solo requiere índice FULLTEXT en MySQL
  ```sql
  ALTER TABLE autor ADD FULLTEXT INDEX idx_fulltext_autor (nombre, apellido);
  ```
  - Complejidad: ⭐ Baja
  - Impacto: 🚀🚀🚀 Alto (búsquedas 10x más rápidas)
  - Tiempo: 2-3 horas

- [ ] **Cache de APIs Externas** - Cachear resultados de Google Books/OpenLibrary por 24h
  - Complejidad: ⭐ Baja
  - Impacto: 🚀🚀 Medio-Alto (reduce llamadas API)
  - Tiempo: 2 horas

### 🟡 VIABLE - Media Prioridad (4-8 horas c/u)
- [ ] **Wikipedia API Integration** - Enriquecimiento de biografías
  ```typescript
  // API REST simple, sin auth requerida
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${authorName}`;
  ```
  - Complejidad: ⭐ Baja
  - Impacto: 🚀 Medio (mejor contenido)
  - Tiempo: 3-4 horas

- [ ] **Infinite Scroll Frontend** - Usar `react-infinite-scroll-component` (ya instalado)
  - Complejidad: ⭐⭐ Media
  - Impacto: 🚀🚀 Medio-Alto (mejor UX)
  - Tiempo: 6-8 horas
  - Paquete: Ya instalado en Frontend

- [ ] **Búsqueda Fonética (Soundex)** - Para tolerar errores de escritura
  - Complejidad: ⭐⭐ Media
  - Impacto: 📊 Medio (mejor búsqueda)
  - Tiempo: 4-6 horas
  - Paquete: `natural@8.1.0` ya instalado

### 🔴 NO VIABLE - Alta Complejidad (NO hacer ahora)
- [ ] ❌ **Job Queue con Bull** - Requiere Redis + Worker separado
  - Complejidad: ⭐⭐⭐⭐ Muy Alta
  - Beneficio vs Costo: Bajo para proyecto actual
  - Alternativa: Enriquecimiento síncrono con timeout
  - Tiempo: 20+ horas

- [ ] ❌ **Clean Architecture** - Refactorización masiva del código
  - Complejidad: ⭐⭐⭐⭐⭐ Muy Alta
  - Beneficio: Solo para proyectos muy grandes
  - Recomendación: Mantener estructura actual
  - Tiempo: 60-80 horas

- [ ] ❌ **Virtual Scrolling con TanStack** - Ya existe alternativa mejor
  - Usar `react-infinite-scroll-component` en su lugar
  - No requiere: `@tanstack/react-query` ni `@tanstack/react-virtual`

### 📊 Monitoring y Analytics (Evaluar necesidad)
- [ ] **Métricas de Búsqueda** - Solo si se necesitan métricas de negocio
  - Alternativa: Usar herramientas SaaS (Google Analytics, Mixpanel)
  - Complejidad: ⭐⭐⭐ Alta
  - Tiempo: 12-16 horas

- [ ] **Analytics de Popularidad** - Rastrear autores más vistos
  - Usar Redis ZINCRBY para contadores
  - Complejidad: ⭐⭐ Media
  - Tiempo: 4-6 horas

---

## 🔄 Prioridades

### 🔴 Alta Prioridad (Próximas 2 semanas)
1. Implementar Full-Text Search en MySQL
2. Mejorar rendimiento de carga de imágenes
3. Implementar lazy loading
4. Corregir bugs críticos de navegación
5. Mejorar responsividad móvil

### 🟡 Media Prioridad (Próximo mes)
1. Implementar sistema de notificaciones
2. Mejorar algoritmo de recomendaciones
3. Agregar más filtros de búsqueda
4. Implementar gamificación básica
5. Mejorar perfil de usuario

### 🟢 Baja Prioridad (Futuro)
1. Implementar funciones de IA avanzadas
2. Agregar integración con servicios externos
3. Implementar modo offline
4. Agregar características sociales avanzadas
5. Implementar analytics completo

---

## ✅ FUNCIONALIDADES YA IMPLEMENTADAS (NO DUPLICAR)

### Backend - Migraciones Aplicadas:
- [x] **Migration20251031140000** - Campo `foto` en entidad Autor
- [x] **Migration20251031150000** - Constraint único en autor (nombre + apellido)
- [x] **Migration20251101000000** - Constraint único en lista_tipo
- [x] **Migration20251103000000** - Índices en autor (nombre, apellido, nombre_apellido)
- [x] **Migration20251103194440** - IDs externos (googleBooksId, openLibraryKey)
- [x] **Migration20251030145005** - Campo `orden` en ContenidoLista (drag & drop)
- [x] **Migration20251030012556** - Campos de moderación en Resena
- [x] **Migration20251030022942** - Campos de auto-rechazo en Resena
- [x] **Migration20251031021933** - Campo `slug` en Libro (luego removido)

### Backend - Servicios Implementados:
- [x] **Redis Cache** - Sistema de caché configurado en `redis.ts` con modo mock
- [x] **Reconciliación de Autores** - `reconcileGoogleBooksAuthor()` y `reconcileOpenLibraryAuthor()`
- [x] **APIs Externas** - Integración con Google Books API y OpenLibrary API
- [x] **Búsqueda Híbrida** - Búsqueda local + APIs externas (documentado en GUIA_BUSQUEDA_HIBRIDA.md)

### Entidades con Funcionalidades Avanzadas:
- [x] **Resena Entity** - Sistema de moderación automática completo
  - `moderationScore`, `moderationReasons`, `autoModerated`
  - `autoRejected`, `rejectionReason`
  - Estados: PENDING, APPROVED, FLAGGED, REJECTED
- [x] **ContenidoLista Entity** - Campo `orden` para ordenamiento personalizado
- [x] **Autor Entity** - Foto, biografía, IDs externos, índices de búsqueda

### Frontend:
- [x] **Búsqueda Híbrida UI** - Toggle para activar búsqueda en APIs externas (AutoresPageMejorada.tsx)
- [x] **Logs de Debug** - Sistema de logging para debugging de búsquedas

---

**Última actualización:** 5 de noviembre de 2025
**Mantenedor:** Equipo BookCode
**Versión del documento:** 1.1
