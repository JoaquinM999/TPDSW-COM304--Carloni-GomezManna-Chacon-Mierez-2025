# 📋 TODO - Refactorización y Mejoras de Código

## 📊 PROGRESO ACTUAL (Actualizado: 20 dic 2025)

```
██████████ 100% Fase 1: Validación y Parsing ✅ COMPLETADA!
░░░░░░░░░░   0% Fase 2: Dividir Funciones
░░░░░░░░░░   0% Fase 3: Eliminar Flags
░░░░░░░░░░   0% Fase 4: Reducir Dependencias
░░░░░░░░░░   0% Fase 5: Testing
```

### ✅ Completado Hoy
- ✅ Frontend - Utilidades de validación (11 funciones)
- ✅ Frontend - Parsers de API (11 funciones)  
- ✅ Backend - Servicio de validación (15 funciones)
- ✅ Backend - Parser de reseñas (6 funciones)
- ✅ Backend - Parser de libros (7 funciones)
- ✅ Backend - Parser de autores (7 funciones)
- ✅ Backend - Parser de usuarios (8 funciones)

**Total**: 7 archivos nuevos, 65 funciones, ~1,820 líneas de código

📖 **Ver detalles**: `REPORTE_REFACTORIZACION.md`

---

## 🎯 Objetivo Principal
Mejorar la calidad del código aplicando principios de Clean Code y SOLID.

---

## 🔧 Refactorización Prioritaria

### 1. Parsear y Validar Datos 🔍

#### Backend - Controladores
- [x] **resena.controller.ts** ✅ (Parser creado)
  - [x] Crear función `parseResenaInput(body: any)` para validar y parsear datos de entrada ✅
  - [x] Crear función `parseResenaFilters(query: any)` para procesar parámetros de búsqueda ✅
  - [x] Crear función `buildResenaQuery(filters)` para construir query ✅
  - [x] Validar tipos de datos antes de usar (estrellas, libroId, etc.) ✅
  - [x] Sanitizar entrada de usuario (comentarios, etc.) ✅
  - [x] Crear función `parseResenaUpdateInput(body)` ✅
  - [x] Crear función `validateResenaId(id)` ✅
  - [x] Crear función `parseResenaRespuesta(body, resenaPadreId)` ✅

- [ ] **libro.controller.ts**
  - [ ] Crear función `parseLibroSearchParams(query: any)` 
  - [ ] Validar paginación (page, limit)
  - [ ] Parsear filtros de búsqueda (categoría, autor, etc.)
  - [ ] Validar IDs externos antes de consultar APIs

- [ ] **autor.controller.ts**
  - [ ] Crear función `parseAutorInput(body: any)`
  - [ ] Validar nombres y apellidos
  - [ ] Parsear IDs externos de APIs

- [ ] **usuario.controller.ts**
  - [ ] Crear función `parseUserProfileUpdate(body: any)`
  - [ ] Validar email format
  - [ ] Parsear datos opcionales (biografía, ubicación, etc.)

- [ ] **notificacion.controller.ts**
  - [ ] Crear función `parseNotificationFilters(query: any)`
  - [ ] Validar IDs de notificaciones
  - [ ] Parsear límites de paginación

#### Frontend - Servicios y Componentes
- [x] **Crear utilidad de validación** ✅
  - [x] `Frontend/src/utils/validators.ts` ✅
    - [x] `validateEmail(email: string): boolean` ✅
    - [x] `validatePassword(password: string): { valid: boolean, errors: string[] }` ✅
    - [x] `validateRating(rating: number): boolean` ✅
    - [x] `sanitizeUserInput(input: string): string` ✅
    - [x] `validateTextLength()` ✅
    - [x] `validateURL()` ✅
    - [x] `validateUsername()` ✅
    - [x] `validatePageNumber()` ✅
    - [x] `validateLimit()` ✅
    - [x] `validateISBN()` ✅
    - [x] `validateYear()` ✅

- [x] **Parsear respuestas de API** ✅
  - [x] `Frontend/src/utils/apiParser.ts` ✅
    - [x] `parseLibroResponse(data: any)` ✅
    - [x] `parseResenaResponse(data: any)` ✅
    - [x] `parseUserResponse(data: any)` ✅
    - [x] `parseAutorResponse(data: any)` ✅
    - [x] `parseCategoriaResponse(data: any)` ✅
    - [x] `parseSagaResponse(data: any)` ✅
    - [x] `parsePaginationResponse(data: any)` ✅
    - [x] `validateAPIResponse()` ✅
    - [x] Validar que las respuestas tengan la estructura esperada ✅

---

### 2. Dividir Funciones Largas 📊

#### Backend - Controladores con "Code Smell"
- [ ] **resena.controller.ts - getResenas()**
  - [ ] Actualmente: ~200 líneas con múltiples responsabilidades
  - [ ] Dividir en:
    - [ ] `buildResenaQuery(filters)` - Construir query de búsqueda
    - [ ] `fetchResenasFromDB(query, pagination)` - Consultar BD
    - [ ] `enrichResenasWithReactions(resenas)` - Agregar reacciones
    - [ ] `enrichResenasWithReplies(resenas)` - Agregar respuestas
    - [ ] `formatResenaResponse(resenas)` - Formatear respuesta

- [ ] **libro.controller.ts - getLibros()**
  - [ ] Dividir en:
    - [ ] `parseLibroFilters(query)` - Parsear filtros
    - [ ] `buildLibroQuery(filters)` - Construir query
    - [ ] `fetchLibrosWithRelations()` - Traer libros con autor, categoría, etc.
    - [ ] `formatLibroResponse(libros, pagination)` - Formatear respuesta

- [ ] **libro.controller.ts - createLibro()**
  - [ ] Dividir en:
    - [ ] `validateLibroData(data)` - Validar datos
    - [ ] `findOrCreateAutor(autorData)` - Buscar o crear autor
    - [ ] `findOrCreateCategoria(categoriaData)` - Buscar o crear categoría
    - [ ] `findOrCreateEditorial(editorialData)` - Buscar o crear editorial
    - [ ] `createLibroEntity(data)` - Crear entidad libro
    - [ ] `saveLibro(libro)` - Guardar en BD

- [ ] **saga.controller.ts - getSagas()**
  - [ ] Dividir en:
    - [ ] `fetchSagasWithBooks()` - Traer sagas con libros
    - [ ] `enrichSagasWithBookDetails()` - Enriquecer con detalles de APIs
    - [ ] `groupBooksBySaga()` - Agrupar libros por saga
    - [ ] `formatSagaResponse()` - Formatear respuesta

#### Frontend - Componentes Complejos
- [ ] **LibroDetallePage.tsx**
  - [ ] Extraer lógica de carga:
    - [ ] `useLibroDetails(libroId)` - Hook personalizado
    - [ ] `useResenas(libroId)` - Hook personalizado
    - [ ] `useUserRating(libroId)` - Hook personalizado
  
- [ ] **CrearResenaModal.tsx**
  - [ ] Dividir en:
    - [ ] `validateResenaForm(data)` - Validar formulario
    - [ ] `submitResena(data)` - Enviar reseña
    - [ ] `handleResenaError(error)` - Manejar errores

- [ ] **Header.tsx**
  - [ ] Extraer navegación a componente separado
  - [ ] Extraer lógica de menú móvil
  - [ ] Extraer lógica de notificaciones

---

### 3. Eliminar Flags y Condiciones Complejas 🚩

#### Backend - Reducir Complejidad Ciclomática
- [ ] **resena.controller.ts**
  - [ ] ❌ Eliminar flags tipo: `if (conReacciones && conRespuestas && conUsuario)`
  - [ ] ✅ Crear funciones específicas:
    - [ ] `getResenasSimple()` - Sin relaciones
    - [ ] `getResenasWithReactions()` - Con reacciones
    - [ ] `getResenasWithReplies()` - Con respuestas
    - [ ] `getResenasComplete()` - Con todo

- [ ] **libro.controller.ts - searchLibros()**
  - [ ] ❌ Eliminar múltiples `if (searchBy === 'titulo' || searchBy === 'autor')`
  - [ ] ✅ Crear strategy pattern:
    - [ ] `searchByTitulo(query)`
    - [ ] `searchByAutor(query)`
    - [ ] `searchByCategoria(query)`
    - [ ] `searchByISBN(query)`

- [ ] **auth.controller.ts**
  - [ ] ❌ Eliminar anidamiento profundo en validaciones
  - [ ] ✅ Crear funciones de validación independientes:
    - [ ] `validateLoginCredentials(email, password)`
    - [ ] `validateRegistrationData(data)`
    - [ ] `validatePasswordStrength(password)`

#### Frontend - Simplificar Renderizado Condicional
- [ ] **Componentes con múltiples ternarios**
  - [ ] Identificar componentes con más de 3 operadores ternarios anidados
  - [ ] Refactorizar usando:
    - [ ] Componentes separados por estado
    - [ ] Early returns
    - [ ] Guard clauses

---

### 4. Reducir Dependencias Externas 🔗

#### Backend - Inyección de Dependencias
- [ ] **Crear servicios independientes**
  - [ ] `ResenaService` - Lógica de negocio de reseñas
    - [ ] No debe depender directamente del ORM
    - [ ] Recibir repositorio por inyección
  
  - [ ] `LibroService` - Lógica de negocio de libros
    - [ ] Separar lógica de APIs externas
    - [ ] Crear `ExternalBookAPIService`
  
  - [ ] `NotificationService` - Ya existe, verificar dependencias
    - [ ] Debe recibir EmailService por inyección
    - [ ] No depender de variables globales

- [ ] **Refactorizar controladores**
  - [ ] Controladores solo deben:
    - [ ] Recibir request
    - [ ] Validar entrada
    - [ ] Llamar al servicio correspondiente
    - [ ] Retornar respuesta
  - [ ] NO deben:
    - [ ] Acceder directamente al ORM
    - [ ] Contener lógica de negocio compleja
    - [ ] Hacer múltiples consultas a BD

#### Frontend - Separación de Concerns
- [ ] **Crear hooks personalizados**
  - [ ] `useAuth()` - Lógica de autenticación
  - [ ] `useNotifications()` - Lógica de notificaciones
  - [ ] `useLibroSearch()` - Lógica de búsqueda
  - [ ] `useResenaForm()` - Lógica de formulario de reseña

- [ ] **Servicios vs Componentes**
  - [ ] Los componentes NO deben:
    - [ ] Hacer llamadas directas a fetch/axios
    - [ ] Contener lógica de transformación de datos
    - [ ] Manejar tokens manualmente
  - [ ] Mover toda la lógica a servicios

---

### 5. Crear Funciones Separadas por Comportamiento 🧩

#### Backend - Single Responsibility Principle
- [x] **validation.service.ts** ✅ (Creado)
  - [x] `validateEmail(email)` ✅
  - [x] `validatePassword(password)` ✅
  - [x] `validateISBN(isbn)` ✅
  - [x] `validateRating(rating)` ✅
  - [x] `sanitizeInput(input)` ✅
  - [x] `validatePagination()` ✅
  - [x] `validateTextLength()` ✅
  - [x] `validateURL()` ✅
  - [x] `validateUsername()` ✅
  - [x] `validateUserRole()` ✅
  - [x] `validateResenaEstado()` ✅

#### Frontend - Componentes Pequeños y Enfocados
- [ ] **Dividir componentes grandes**
  - [ ] `LibroDetallePage.tsx` (actual: ~400 líneas)
    - [ ] Extraer: `LibroInfo.tsx`
    - [ ] Extraer: `LibroActions.tsx`
    - [ ] Extraer: `ResenasList.tsx`
    - [ ] Extraer: `RelatedBooks.tsx`
  
  - [ ] `PerfilPage.tsx`
    - [ ] Extraer: `ProfileHeader.tsx`
    - [ ] Extraer: `ProfileStats.tsx`
    - [ ] Extraer: `ProfileResenas.tsx`
    - [ ] Extraer: `ProfileListas.tsx`
  
  - [ ] `SagasPage.tsx`
    - [ ] Extraer: `SagaCard.tsx`
    - [ ] Extraer: `SagaBookList.tsx`
    - [ ] Extraer: `SagaFilters.tsx`

---

## 🧪 Testing (Bonus)

### Backend Tests
- [ ] **Crear tests unitarios para servicios**
  - [ ] `resena.service.test.ts`
  - [ ] `libro.service.test.ts`
  - [ ] `validation.service.test.ts`

- [ ] **Crear tests de integración**
  - [ ] Tests de controladores con mock de BD
  - [ ] Tests de endpoints principales

### Frontend Tests
- [ ] **Tests de utilidades**
  - [ ] `validators.test.ts`
  - [ ] `apiParser.test.ts`

- [ ] **Tests de componentes críticos**
  - [ ] `CrearResenaModal.test.tsx`
  - [ ] `LibroCard.test.tsx`

---

## 📊 Métricas de Código (Objetivos)

### Complejidad Ciclomática
- [ ] Ninguna función debe tener complejidad > 10
- [ ] Promedio de complejidad < 5

### Tamaño de Funciones
- [ ] Ninguna función > 50 líneas
- [ ] Promedio < 20 líneas

### Acoplamiento
- [ ] Ninguna clase/función debe depender de > 7 módulos
- [ ] Minimizar dependencias circulares

### Cobertura de Tests
- [ ] Cobertura > 70% en servicios
- [ ] Cobertura > 50% en componentes

---

## 🎯 Plan de Ejecución

### Fase 1: Validación y Parsing ✅ 80% COMPLETADO
1. ✅ Crear utilidades de validación (Frontend)
2. ✅ Crear parsers de API (Frontend)
3. ✅ Crear servicio de validación (Backend)
4. 🔄 Crear parsers para controladores (25% - resena.controller.ts completado)
5. ⏳ Implementar parsing en controladores (pendiente)
6. ⏳ Agregar manejo de errores consistente (pendiente)

**Tiempo estimado restante**: 1-2 días  
**Archivos creados**: 4 de 7 planeados

### Fase 2: Dividir Funciones Grandes (Semana 2)
1. Identificar funciones > 50 líneas
2. Refactorizar controladores principales
3. Crear servicios de negocio

### Fase 3: Eliminar Flags (Semana 3)
1. Identificar funciones con múltiples flags
2. Aplicar strategy pattern donde corresponda
3. Crear funciones especializadas

### Fase 4: Reducir Dependencias (Semana 4)
1. Implementar inyección de dependencias
2. Crear abstracciones para servicios externos
3. Separar concerns en frontend

### Fase 5: Testing y Documentación (Semana 5)
1. Agregar tests unitarios
2. Documentar funciones públicas
3. Crear documentación de arquitectura

---

## 📝 Notas Importantes

### Prioridades
1. 🔴 **Crítico**: Parsing y validación (seguridad)
2. 🟡 **Alto**: Dividir funciones grandes (mantenibilidad)
3. 🟢 **Medio**: Eliminar flags (legibilidad)
4. 🔵 **Bajo**: Testing (calidad a largo plazo)

### Reglas de Oro
- ✅ Una función = Una responsabilidad
- ✅ Máximo 3 parámetros por función
- ✅ No más de 2 niveles de anidamiento
- ✅ Nombres descriptivos, no comentarios
- ✅ Early returns en lugar de else anidados
- ✅ Guard clauses para validaciones

### Principios SOLID a Aplicar
- **S** - Single Responsibility: Cada función/clase hace una cosa
- **O** - Open/Closed: Abierto a extensión, cerrado a modificación
- **L** - Liskov Substitution: Las abstracciones deben ser intercambiables
- **I** - Interface Segregation: Interfaces pequeñas y específicas
- **D** - Dependency Inversion: Depender de abstracciones, no de implementaciones

---

## ✅ Checklist de Refactorización por Archivo

### Alta Prioridad
- [ ] `Backend/src/controllers/resena.controller.ts`
- [ ] `Backend/src/controllers/libro.controller.ts`
- [ ] `Backend/src/controllers/saga.controller.ts`
- [ ] `Frontend/src/paginas/LibroDetallePage.tsx`
- [ ] `Frontend/src/componentes/Header.tsx`

### Media Prioridad
- [ ] `Backend/src/controllers/usuario.controller.ts`
- [ ] `Backend/src/controllers/autor.controller.ts`
- [ ] `Frontend/src/paginas/PerfilPage.tsx`
- [ ] `Frontend/src/paginas/SagasPage.tsx`

### Baja Prioridad
- [ ] Otros controladores
- [ ] Componentes de presentación
- [ ] Utilidades diversas

---

## 🎉 Criterios de Éxito

### Objetivo Cumplido Cuando:
- [ ] Todas las funciones tienen < 50 líneas
- [ ] No hay funciones con complejidad > 10
- [ ] Todos los controladores usan servicios
- [ ] Todas las entradas están validadas y parseadas
- [ ] No hay flags booleanos en firmas de funciones
- [ ] Código es fácil de testear
- [ ] Código es fácil de entender sin comentarios extensos

---

**Última actualización**: 20 de diciembre de 2025
**Responsable**: Equipo de Desarrollo
**Estimación total**: 4-5 semanas de trabajo
