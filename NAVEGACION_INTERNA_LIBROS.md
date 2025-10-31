# Plan de Implementación: Navegación Interna de Libros en DetalleAutor

## 📋 Análisis Inicial

### Situación Actual
En `DetalleAutor.tsx`, existen **dos tipos de libros**:

1. **Libros de la BD local** (líneas ~470-530)
   - Tienen `id` numérico y potencialmente `slug`
   - Ya usan `<Link to={`/libros/${libro.id}`}>` ✅ 
   - **Funcionan correctamente** para navegación interna

2. **Libros de Google Books** (líneas ~550-630)
   - Son de tipo `GoogleBook` (del servicio `googleBooksAutorService`)
   - Actualmente usan `<a href={...} target="_blank">` ❌
   - **Abren en ventana externa** (comportamiento a cambiar)

### Problema Identificado
```tsx
// Línea 577-580 - Libros de Google Books
<a
  href={libro.infoLink || libro.previewLink || '#'}
  target="_blank"
  rel="noopener noreferrer"
  className="block bg-white rounded-xl shadow-lg..."
>
```

Este código abre los libros de Google Books en una ventana externa, cuando deberíamos navegar internamente a `DetalleLibro.tsx`.

---

## 🎯 Objetivo

Cambiar el comportamiento de los **libros de Google Books** para que:
1. Naveguen internamente usando React Router
2. Se abran en `DetalleLibro.tsx` (que ya soporta múltiples fuentes)
3. Mantengan la misma experiencia de usuario que los libros locales

---

## 📊 Flujo de Datos Actual

### DetalleLibro.tsx - Manejo de Fuentes
```tsx
// DetalleLibro.tsx línea 297-370
useEffect(() => {
  const fetchLibro = async () => {
    // 1. PRIORIDAD: Intentar BD local por slug
    response = await fetch(`http://localhost:3000/api/libros/slug/${slug}`);
    
    if (response.ok) {
      // ✅ Libro encontrado en BD
      data = await response.json();
    } else {
      // 2. FALLBACK: Intentar Hardcover API
      response = await fetch(`http://localhost:3000/api/hardcover/libro/${slug}`);
      
      if (response.ok) {
        // ✅ Libro de Hardcover
      } else {
        // 3. FALLBACK FINAL: Google Books
        response = await fetch(`http://localhost:3000/api/google-books/${slug}`);
      }
    }
  }
}, [slug]);
```

**Clave:** `DetalleLibro` ya soporta libros de Google Books mediante el endpoint `/api/google-books/${slug}` ✅

---

## 🔧 Plan de Implementación

### **PASO 1: Crear utilidad para generar slug desde GoogleBook**

**Archivo:** `Frontend/src/utils/slugUtils.ts` (crear nuevo)

**Contenido:**
```typescript
/**
 * Genera un slug URL-friendly desde un título de libro
 * Ejemplo: "Cien Años de Soledad" → "cien-anos-de-soledad"
 */
export const createSlug = (titulo: string): string => {
  return titulo
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Espacios → guiones
    .replace(/-+/g, '-'); // Múltiples guiones → uno solo
};

/**
 * Genera un slug único para libros de Google Books
 * Formato: titulo-googleBookId
 * Ejemplo: "cien-anos-soledad-abc123xyz"
 */
export const createGoogleBookSlug = (libro: {
  titulo: string;
  id: string;
}): string => {
  const tituloSlug = createSlug(libro.titulo);
  // Añadir parte del ID de Google Books para garantizar unicidad
  const googleId = libro.id.slice(0, 8); // Primeros 8 caracteres del ID
  return `${tituloSlug}-${googleId}`;
};
```

**Justificación:**
- Google Books no tiene `slug` nativo
- Necesitamos generar uno consistente para la URL
- El ID de Google Books garantiza unicidad
- El título hace la URL legible y SEO-friendly

---

### **PASO 2: Modificar DetalleAutor.tsx - Sección Google Books**

**Ubicación:** Líneas ~567-625

**Cambio 1: Importar dependencias**
```tsx
// Al inicio del archivo, añadir:
import { useNavigate, Link } from 'react-router-dom'; // Link ya existe
import { createGoogleBookSlug } from '../utils/slugUtils';
```

**Cambio 2: Reemplazar `<a>` por `<Link>`**

**Antes (líneas 577-625):**
```tsx
<a
  href={libro.infoLink || libro.previewLink || '#'}
  target="_blank"
  rel="noopener noreferrer"
  className="block bg-white rounded-xl shadow-lg..."
>
  {/* ... contenido ... */}
</a>
```

**Después:**
```tsx
<Link
  to={`/libro/${createGoogleBookSlug({
    titulo: libro.titulo,
    id: libro.id
  })}`}
  className="block bg-white rounded-xl shadow-lg..."
>
  {/* ... contenido ... */}
</Link>
```

**Cambio 3: Eliminar el ícono ExternalLink del overlay hover**

**Antes (líneas 590-594):**
```tsx
<div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
  <ExternalLink className="w-4 h-4 text-purple-600" />
</div>
```

**Después:**
```tsx
{/* Remover este div - ya no es externo */}
```

**Cambio 4: Actualizar el título de la sección**

**Antes (línea 558):**
```tsx
<ExternalLink className="w-8 h-8 text-purple-600" />
Más Libros en Google Books
```

**Después:**
```tsx
<BookOpen className="w-8 h-8 text-purple-600" />
Más Libros de este Autor
```

---

### **PASO 3: Actualizar Backend - Endpoint Google Books**

**Ubicación:** `Backend/src/controllers/googleBooks.controller.ts`

**Verificar que el endpoint `/api/google-books/:slug` existe y funciona correctamente**

Si no existe, crear:

```typescript
// Endpoint para obtener libro de Google Books por slug
export const getLibroBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // El slug viene en formato: "titulo-slug-googleId"
    // Extraer el googleId (últimos 8 caracteres después del último guión)
    const parts = slug.split('-');
    const googleId = parts[parts.length - 1];
    
    // Si no parece un ID válido, intentar búsqueda por título
    const searchQuery = slug.replace(/-/g, ' ');
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=1`
    );
    
    if (!response.ok) {
      return res.status(404).json({ 
        error: 'Libro no encontrado en Google Books' 
      });
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ 
        error: 'Libro no encontrado' 
      });
    }
    
    const libro = data.items[0];
    const volumeInfo = libro.volumeInfo;
    
    res.json({
      id: libro.id,
      titulo: volumeInfo.title,
      title: volumeInfo.title,
      autores: volumeInfo.authors || ['Autor desconocido'],
      descripcion: volumeInfo.description || 'No hay descripción disponible.',
      imagen: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      coverUrl: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.thumbnail,
      enlace: volumeInfo.infoLink,
      slug: slug,
      source: 'google',
      fechaPublicacion: volumeInfo.publishedDate,
      editorial: volumeInfo.publisher,
      paginas: volumeInfo.pageCount,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
      idioma: volumeInfo.language,
      categorias: volumeInfo.categories
    });
  } catch (error) {
    console.error('Error fetching Google Books:', error);
    res.status(500).json({ error: 'Error al obtener libro de Google Books' });
  }
};
```

---

### **PASO 4: Verificar Ruta en App.tsx**

**Ubicación:** `Frontend/src/App.tsx` línea ~157

**Verificar que existe:**
```tsx
<Route path="/libro/:slug" element={<DetalleLibro />} />
```

✅ Esta ruta ya existe según el grep search

---

### **PASO 5: Testing Manual**

**Pruebas a realizar:**

1. **Navegación desde libros de BD local** ✅
   - Ir a `/autores/:id`
   - Click en libro de "Todos los Libros"
   - Verificar que abre en `/libros/:id` o `/libro/:slug`
   - **Ya funciona** según análisis

2. **Navegación desde libros de Google Books** 🔄
   - Ir a `/autores/:id` de autor popular (ej: García Márquez)
   - Scroll hasta "Más Libros de este Autor"
   - Click en libro de Google Books
   - **Verificar:** Navega a `/libro/cien-anos-soledad-abc12345`
   - **Verificar:** Se carga `DetalleLibro.tsx`
   - **Verificar:** Se muestra información del libro de Google Books

3. **Botón "Volver"** 🔄
   - En `DetalleLibro.tsx`, verificar botón "Volver"
   - Debe regresar a `/autores/:id` (no a `/libros`)
   - **Nota:** Ya hay lógica para detectar `from` en DetalleLibro (línea 189-203)

---

## 🚀 Orden de Implementación

```
1. ✅ Crear Frontend/src/utils/slugUtils.ts
2. ✅ Modificar Frontend/src/paginas/DetalleAutor.tsx
   - Importar createGoogleBookSlug
   - Reemplazar <a> por <Link>
   - Eliminar ExternalLink del overlay
   - Actualizar título de sección
3. ⚠️  Verificar Backend/src/controllers/googleBooks.controller.ts
   - Endpoint GET /api/google-books/:slug
4. ✅ Testing manual
5. 📝 Actualizar documentación
```

---

## 📝 Checklist de Cambios

### Frontend
- [ ] Crear `Frontend/src/utils/slugUtils.ts`
- [ ] Importar `createGoogleBookSlug` en `DetalleAutor.tsx`
- [ ] Reemplazar `<a href target="_blank">` por `<Link to>`
- [ ] Eliminar ícono `ExternalLink` del overlay hover
- [ ] Cambiar título de sección de "Más Libros en Google Books" a "Más Libros de este Autor"
- [ ] Eliminar import innecesario de `ExternalLink` (si ya no se usa en otro lugar)

### Backend
- [ ] Verificar endpoint `/api/google-books/:slug` existe
- [ ] Agregar lógica para parsear slug y extraer googleId
- [ ] Implementar búsqueda por título como fallback
- [ ] Retornar formato compatible con `DetalleLibro.tsx`

### Testing
- [ ] Probar navegación desde libros BD local
- [ ] Probar navegación desde libros Google Books
- [ ] Verificar botón "Volver" funciona correctamente
- [ ] Probar con diferentes autores (con/sin libros en Google)
- [ ] Verificar que no hay errores en consola

---

## ⚠️ Consideraciones Especiales

### 1. **Slugs Duplicados**
**Problema:** Dos libros con mismo título de autores diferentes
**Solución:** Incluir parte del ID de Google Books en el slug
```
cien-anos-soledad-abc12345
cien-anos-soledad-xyz67890  ← Diferente ID
```

### 2. **Libros sin información en Google Books**
**Problema:** Algunos libros pueden no tener descripción/imagen
**Solución:** `DetalleLibro.tsx` ya maneja esto con placeholders

### 3. **Performance**
**Problema:** Cada click hace un fetch a Google Books API
**Solución:** 
- Backend puede cachear respuestas en Redis (7 días)
- `googleBooksAutorService.ts` ya tiene cache de 7 días

### 4. **SEO**
**Ventaja:** Los slugs son legibles y SEO-friendly
```
/libro/cien-anos-soledad-abc12345  ← Mejor que ← /libro/abc12345def67890ghijk
```

---

## 🎨 Mejoras Visuales Opcionales

### Indicador de Fuente del Libro
Agregar badge para distinguir visualmente la fuente:

```tsx
{/* En DetalleLibro.tsx */}
{libro.source === 'google' && (
  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
    <BookOpen className="w-4 h-4" />
    Google Books
  </div>
)}
```

### Transición de Navegación
Ya existe animación con `framer-motion` en ambos componentes ✅

---

## 📚 Referencias

- **Router Docs:** React Router v6 - `<Link>` component
- **DetalleLibro flow:** Líneas 297-425 (manejo multi-fuente)
- **GoogleBook interface:** `googleBooksAutorService.ts` línea 13-30
- **Slug pattern:** Otros libros usan `libro.slug` directamente

---

## 🔄 Próximos Pasos (Post-Implementación)

1. **Añadir preload de datos:** Al hacer hover sobre un libro de Google Books, precargar datos
2. **Cache optimista:** Guardar libros visitados en localStorage
3. **Breadcrumbs:** Mostrar ruta Autores > Autor X > Libro Y
4. **Compartir:** Botón para copiar URL del libro
5. **Analytics:** Trackear qué libros de Google Books son más visitados

---

## ✅ Criterios de Éxito

1. ✅ Click en libro de Google Books navega internamente
2. ✅ URL es legible: `/libro/titulo-slug-id`
3. ✅ `DetalleLibro.tsx` carga correctamente
4. ✅ Información del libro se muestra completa
5. ✅ Botón "Volver" regresa a autor correcto
6. ✅ No hay errores en consola
7. ✅ Performance aceptable (< 2s carga)
8. ✅ Experiencia consistente con libros locales

---

**Estado:** 📝 Documento de Planificación Completo
**Próximo paso:** Implementar PASO 1 - Crear `slugUtils.ts`
