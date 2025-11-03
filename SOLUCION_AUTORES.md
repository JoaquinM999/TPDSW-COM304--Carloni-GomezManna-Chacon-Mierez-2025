# Implementación de Solución Híbrida para Autores

## ✅ Cambios Implementados

### 1. **Actualización de la Entidad `Autor`**
Se agregaron los siguientes campos a la entidad `Autor`:
- `googleBooksId?: string` - ID único de Google Books (único, indexado)
- `openLibraryKey?: string` - Key única de OpenLibrary (único, indexado)
- `biografia?: string` - Biografía del autor (puede venir de APIs)
- Constraint único en `(nombre, apellido)` para evitar duplicados por nombre

**Archivo:** `Backend/src/entities/autor.entity.ts`

### 2. **Migración de Base de Datos**
Se ejecutó `schema:update` para aplicar los cambios:
```bash
npx mikro-orm schema:update --run
```

Los campos fueron agregados exitosamente a la tabla `autor`.

### 3. **Servicio de Reconciliación de Autores**
Se creó un nuevo servicio `Backend/src/services/autor.service.ts` con las siguientes funciones:

- **`reconcileGoogleBooksAuthor(em, autorNombre)`**: Busca o crea un autor de Google Books
  - Busca primero por `googleBooksId`
  - Si no existe, busca por nombre completo
  - Si existe por nombre, actualiza el `googleBooksId`
  - Si no existe, crea un nuevo autor
  
- **`reconcileOpenLibraryAuthor(em, openLibraryAuthor)`**: Busca o crea un autor de OpenLibrary
  - Busca primero por `openLibraryKey`
  - Si no existe, busca por nombre completo
  - Si existe por nombre, actualiza el `openLibraryKey`, biografía y foto
  - Si no existe, crea un nuevo autor
  
- **`searchGoogleBooksAuthors(em, query)`**: Busca autores en Google Books API y los reconcilia
  
- **`searchOpenLibraryAuthors(em, query)`**: Busca autores en OpenLibrary API y los reconcilia

### 4. **Actualización del Controlador `googleBooks.controller.ts`**
Se modificó la lógica de creación de autores en `addGoogleBook`:
- Ahora usa la función `reconcileGoogleBooksAuthor` (implementada inline)
- Evita duplicados buscando primero por `googleBooksId`
- Si el autor existe por nombre, actualiza su `googleBooksId`

**Archivo:** `Backend/src/controllers/googleBooks.controller.ts`

### 5. **Actualización del Controlador `autor.controller.ts`**
Se mejoró la función `searchAutores`:

**Lógica Implementada:**
```
1. Buscar PRIMERO en BDD (fuente única de verdad)
2. Si `includeExternal=true` y hay pocos resultados (<5):
   a. Buscar en Google Books API
   b. Buscar en OpenLibrary API
   c. Reconciliar autores con la BDD
   d. Combinar resultados eliminando duplicados por ID
3. Devolver resultados (siempre desde la BDD)
```

**Uso del endpoint:**
```
GET /api/autores/search?q=Rowling
GET /api/autores/search?q=Rowling&includeExternal=true
```

**Archivo:** `Backend/src/controllers/autor.controller.ts`

---

## 🎯 Beneficios de la Solución

### ✅ **Problema: Duplicados**
- **Solución:** Los autores se identifican por `googleBooksId` o `openLibraryKey`
- **Resultado:** No se crean duplicados del mismo autor

### ✅ **Problema: Buscador no funciona**
- **Solución:** El buscador busca primero en BDD, luego en APIs si se solicita
- **Resultado:** Siempre muestra autores de la BDD (fuente única de verdad)

### ✅ **Problema: Clics en autores se rompen**
- **Solución:** Los autores siempre se guardan en la BDD al añadir libros
- **Resultado:** Los clics en autores siempre llevan a `/autores/{id}` interno

---

## 🔧 Mejoras Pendientes para el Frontend

### 1. **Actualizar el Buscador de Autores**
El frontend debe usar el endpoint mejorado:

```typescript
// Frontend/src/services/autorService.ts (o similar)

export const buscarAutores = async (query: string, includeExternal: boolean = false) => {
  const response = await fetch(
    `${API_BASE_URL}/autores/search?q=${encodeURIComponent(query)}&includeExternal=${includeExternal}`
  );
  return response.json();
};
```

### 2. **Componente de Búsqueda con Toggle**
Agregar un checkbox para permitir búsqueda en APIs externas:

```tsx
const [includeExternal, setIncludeExternal] = useState(false);

<input
  type="checkbox"
  checked={includeExternal}
  onChange={(e) => setIncludeExternal(e.target.checked)}
/>
<label>Buscar también en Google Books y OpenLibrary</label>
```

### 3. **Enlace a Página de Autor Interno**
Asegurarse de que los clics en autores siempre usen el ID interno:

```tsx
// ❌ Antes (MALO)
<Link to={`/external-author/${author.googleBooksId}`}>

// ✅ Ahora (BUENO)
<Link to={`/autores/${author.id}`}>
```

### 4. **Mostrar Información Enriquecida**
Si el autor tiene biografía o foto de las APIs, mostrarlas:

```tsx
{author.biografia && <p className="bio">{author.biografia}</p>}
{author.foto && <img src={author.foto} alt={author.nombre} />}
```

---

## 📋 Verificación de Implementación

### Backend ✅
- [x] Entidad `Autor` actualizada con campos externos
- [x] Migración aplicada
- [x] Servicio de reconciliación creado
- [x] Controlador de Google Books actualizado
- [x] Controlador de búsqueda de autores actualizado

### Frontend ❌ (Pendiente)
- [ ] Actualizar servicio de autores para usar el nuevo endpoint
- [ ] Agregar toggle para búsqueda externa
- [ ] Verificar que los enlaces de autores usen IDs internos
- [ ] Mostrar biografía y foto de autores

---

## 🧪 Pruebas Recomendadas

### 1. **Prueba de Duplicados**
```bash
# Añadir un libro de Google Books con "J.K. Rowling"
POST /api/google-books/add
{ "googleBookId": "..." }

# Añadir otro libro de Google Books con "J.K. Rowling"
POST /api/google-books/add
{ "googleBookId": "..." }

# Verificar que solo existe UN autor "J.K. Rowling" en la BDD
GET /api/autores/search?q=Rowling
```

### 2. **Prueba de Búsqueda Híbrida**
```bash
# Buscar solo en BDD
GET /api/autores/search?q=Rowling

# Buscar también en APIs externas
GET /api/autores/search?q=Rowling&includeExternal=true
```

### 3. **Prueba de Reconciliación**
```bash
# Buscar un autor que no existe en BDD
GET /api/autores/search?q=NuevoAutor&includeExternal=true

# Verificar que el autor se guardó en BDD
GET /api/autores?search=NuevoAutor
```

---

## 📖 Documentación de la API

### `GET /api/autores/search`

**Parámetros:**
- `q` (string, requerido): Consulta de búsqueda (mínimo 2 caracteres)
- `includeExternal` (boolean, opcional): Si es `true`, busca también en APIs externas

**Respuesta:**
```json
[
  {
    "id": 123,
    "nombre": "J.K.",
    "apellido": "Rowling",
    "googleBooksId": "google_j.k._rowling",
    "openLibraryKey": "/authors/OL23919A",
    "biografia": "...",
    "foto": "https://...",
    "createdAt": "2025-11-03T..."
  }
]
```

**Comportamiento:**
1. Busca primero en la BDD por nombre o apellido
2. Si `includeExternal=true` y hay menos de 5 resultados:
   - Busca en Google Books API
   - Busca en OpenLibrary API
   - Reconcilia autores con la BDD
   - Devuelve autores combinados (sin duplicados)
3. Siempre devuelve autores de la BDD (nunca datos directos de APIs)

---

## 🚀 Próximos Pasos

1. **Actualizar el Frontend** para usar el nuevo endpoint de búsqueda
2. **Agregar pruebas unitarias** para las funciones de reconciliación
3. **Implementar un job de sincronización** para actualizar datos de autores periódicamente
4. **Agregar logging** para monitorear las reconciliaciones
5. **Crear un endpoint de administración** para fusionar autores duplicados manualmente

---

## 📝 Notas Adicionales

- La reconciliación es **idempotente**: llamar varias veces con el mismo autor no crea duplicados
- Los IDs externos (`googleBooksId`, `openLibraryKey`) son **únicos** en la base de datos
- La BDD es siempre la **fuente única de verdad** (Single Source of Truth)
- Las APIs externas solo se usan para **descubrir** nuevos autores
- Los datos de autores se **enriquecen** con información de las APIs (biografía, foto)
