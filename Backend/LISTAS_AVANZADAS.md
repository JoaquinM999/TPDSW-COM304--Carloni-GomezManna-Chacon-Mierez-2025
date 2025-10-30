# Sistema de Listas Mejorado - BookCode 🎯

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Backend - API Reference](#backend---api-reference)
4. [Frontend - Componentes](#frontend---componentes)
5. [Filtros y Ordenamiento](#filtros-y-ordenamiento)
6. [Drag & Drop (Próximamente)](#drag--drop-próximamente)
7. [Modos de Visualización (Próximamente)](#modos-de-visualización-próximamente)
8. [Guía de Uso](#guía-de-uso)

---

## Visión General

El sistema de listas mejorado permite a los usuarios organizar sus libros de forma flexible y personalizada con múltiples opciones de visualización, filtrado y ordenamiento.

### Características Implementadas ✅

- **CRUD Completo de Listas**: Crear, leer, actualizar y eliminar listas
- **Listas Predeterminadas**: "Ver más tarde", "Pendiente", "Leídos"
- **Listas Personalizadas**: Los usuarios pueden crear listas con nombres personalizados
- **Protección contra Duplicados**: Sistema de triple verificación (frontend + backend)
- **Filtros Avanzados**: Por autor, categoría, rating, título
- **Múltiples Ordenamientos**: Alfabético, fecha, rating, personalizado
- **Vista Grid/Lista**: Toggle entre dos modos de visualización
- **Sistema de Iconos**: Cada tipo de lista tiene su propio ícono y color
- **Búsqueda en Lista**: Filtro de texto en tiempo real
- **Campo `orden`**: Soporte para drag & drop (próximamente)

### Características Propuestas 🚀

- **Drag & Drop Reordering**: Reordenar libros arrastrándolos
- **Modo Presentación**: Vista fullscreen tipo carousel
- **Modo Estantería**: Diseño 3D simulando estante físico
- **Animaciones**: Confetti al agregar, swipe-to-remove, transiciones suaves
- **Color Picker**: Colores personalizables para listas custom

---

## Arquitectura del Sistema

### Base de Datos

```sql
-- Entidad Lista
CREATE TABLE lista (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  tipo ENUM('read', 'to_read', 'pending', 'custom') NOT NULL,
  usuario_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Entidad ContenidoLista
CREATE TABLE contenido_lista (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lista_id INT NOT NULL,
  libro_id INT NOT NULL,
  orden INT NULL, -- ✅ Agregado para drag & drop
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lista_id) REFERENCES lista(id) ON DELETE CASCADE,
  FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE,
  UNIQUE KEY unique_lista_libro (lista_id, libro_id) -- Previene duplicados
);
```

### Flujo de Datos

```
Usuario → Frontend (DetalleLista.tsx)
         ↓
    listaService.ts (Servicios API)
         ↓
    Backend (lista.controller.ts)
         ↓
    MikroORM (ContenidoLista entity)
         ↓
    MySQL (Queries optimizados)
```

---

## Backend - API Reference

### Obtener Lista con Filtros

```typescript
GET /api/lista/:id?orderBy=alfabetico&filterAutor=Tolkien&filterCategoria=Fantasía&filterRating=4&search=anillo

Query Parameters:
- orderBy: 'alfabetico' | 'fecha' | 'rating' | 'personalizado'
- filterAutor: string (búsqueda parcial case-insensitive)
- filterCategoria: string (búsqueda parcial case-insensitive)
- filterRating: number (rating mínimo 1-5)
- search: string (búsqueda en título del libro)

Response 200 OK:
{
  "id": 1,
  "nombre": "Mis Favoritos",
  "tipo": "custom",
  "createdAt": "2025-10-30T10:00:00Z",
  "ultimaModificacion": "2025-10-30T15:30:00Z",
  "usuario": { "id": 1, "username": "joaquina" },
  "contenidos": [
    {
      "id": 10,
      "orden": 0,
      "createdAt": "2025-10-29T12:00:00Z",
      "libro": {
        "id": 5,
        "nombre": "El Señor de los Anillos",
        "autores": ["J.R.R. Tolkien"],
        "imagen": "https://...",
        "categoria": { "nombre": "Fantasía" },
        "ratingLibro": { "avgRating": 4.8 }
      }
    }
  ]
}
```

### Reordenar Lista (Drag & Drop)

```typescript
PUT /api/lista/:id/reordenar

Request Body:
{
  "ordenamiento": [
    { "libroId": 5, "orden": 0 },
    { "libroId": 12, "orden": 1 },
    { "libroId": 8, "orden": 2 }
  ]
}

Response 200 OK:
{
  "mensaje": "Orden actualizado correctamente"
}
```

### Crear Lista

```typescript
POST /api/lista

Request Body:
{
  "nombre": "Para Leer en Verano",
  "tipo": "custom"
}

Response 201 Created / 200 OK (si ya existe):
{
  "id": 5,
  "nombre": "Para Leer en Verano",
  "tipo": "custom",
  "usuario": { "id": 1 }
}
```

### Agregar Libro a Lista

```typescript
POST /api/contenido-lista

Request Body:
{
  "listaId": 5,
  "libro": {
    "id": "google-abc123",
    "titulo": "Cien Años de Soledad",
    "autores": ["Gabriel García Márquez"],
    "descripcion": "...",
    "imagen": "https://...",
    "enlace": "https://...",
    "source": "google"
  }
}

Response 200 OK:
{
  "mensaje": "Libro agregado a la lista"
}
```

---

## Frontend - Componentes

### DetalleLista.tsx

Componente principal que renderiza la vista detallada de una lista con todos los controles.

**Props:** Ninguno (usa `useParams` para obtener el ID de lista de la URL)

**Estado:**
```typescript
- lista: Lista | null
- contenidos: ContenidoLista[]
- viewMode: 'grid' | 'list'
- orderBy: 'alfabetico' | 'fecha' | 'rating' | 'personalizado'
- search: string
- filterAutor: string
- filterCategoria: string
- filterRating: number | undefined
- showFilters: boolean
```

**Funciones Clave:**
```typescript
cargarLista(): void
  // Obtiene lista con filtros aplicados

handleRemoveLibro(libroId: number): void
  // Elimina libro de la lista con confirmación

limpiarFiltros(): void
  // Resetea todos los filtros a valores por defecto

getListaIcon(tipo: string): JSX.Element
  // Retorna ícono según tipo de lista

getListaColor(tipo: string): string
  // Retorna clase CSS de color según tipo
```

### Integración con listaService

```typescript
// En DetalleLista.tsx
import { listaService, Lista, ContenidoLista } from '../services/listaService';

// Cargar lista con filtros
const data = await listaService.getListaDetallada(listaId, {
  orderBy: 'alfabetico',
  filterAutor: 'Tolkien',
  filterCategoria: 'Fantasía',
  filterRating: 4,
  search: 'anillo'
});

// Eliminar libro
await listaService.removeLibroDeLista(listaId, libroId.toString());
```

---

## Filtros y Ordenamiento

### Ordenamiento

| Opción | Descripción | Lógica Backend |
|--------|-------------|----------------|
| **Más recientes** | Por fecha de agregado (DESC) | `ORDER BY createdAt DESC` |
| **Alfabético** | Por título A-Z | `localeCompare(nombre)` |
| **Mejor valorados** | Por rating promedio (DESC) | Query a `RatingLibro` + ordenamiento |
| **Orden personalizado** | Drag & drop manual | `ORDER BY orden ASC` |

### Filtros

**Por Autor:**
```typescript
contenidos.filter(c => 
  c.libro.autor && 
  `${c.libro.autor.nombre} ${c.libro.autor.apellido}`
    .toLowerCase()
    .includes(filterAutor.toLowerCase())
)
```

**Por Categoría:**
```typescript
contenidos.filter(c => 
  c.libro.categoria && 
  c.libro.categoria.nombre
    .toLowerCase()
    .includes(filterCategoria.toLowerCase())
)
```

**Por Rating:**
```typescript
// Backend: Query a RatingLibro
const rating = await orm.em.findOne(RatingLibro, { libro: { id: libroId } });
if (rating && rating.avgRating >= minRating) {
  // Incluir en resultados
}
```

**Búsqueda por Título:**
```typescript
contenidos.filter(c => 
  c.libro.nombre && 
  c.libro.nombre.toLowerCase().includes(search.toLowerCase())
)
```

---

## Drag & Drop (Próximamente)

### Instalación

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Implementación Propuesta

```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function DetalleLista() {
  const [contenidos, setContenidos] = useState<ContenidoLista[]>([]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contenidos.findIndex(c => c.id === active.id);
    const newIndex = contenidos.findIndex(c => c.id === over.id);

    // Reordenar localmente
    const newOrder = arrayMove(contenidos, oldIndex, newIndex);
    setContenidos(newOrder);

    // Sincronizar con backend
    const ordenamiento = newOrder.map((c, index) => ({
      libroId: c.libro.id,
      orden: index
    }));

    try {
      await listaService.reordenarLista(listaId, ordenamiento);
    } catch (err) {
      // Revertir en caso de error
      setContenidos(contenidos);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={contenidos.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {contenidos.map(contenido => (
          <SortableLibroCard key={contenido.id} contenido={contenido} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableLibroCard({ contenido }: { contenido: ContenidoLista }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: contenido.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LibroCard libro={contenido.libro} />
    </div>
  );
}
```

---

## Modos de Visualización (Próximamente)

### 1. Modo Presentación (Fullscreen Carousel)

- Vista fullscreen a pantalla completa
- Navegación con flechas ← → o swipe
- Portada grande con información superpuesta
- Fondo blur de la portada
- Botones de acción: Eliminar, Ver detalles

### 2. Modo Estantería (3D Bookshelf)

- Diseño CSS 3D simulando estante físico
- Libros en perspectiva
- Hover effect: libro se inclina hacia adelante
- Iluminación y sombras realistas
- Scroll horizontal para ver más libros

### 3. Vista Compacta vs Portadas Grandes

**Compacta:**
- Lista vertical con imagen pequeña (64x96px)
- Título + autor + categoría en línea
- Más libros visibles sin scroll

**Portadas Grandes:**
- Grid de 2-5 columnas (responsive)
- Imágenes 200x300px
- Hover effects y transiciones suaves

---

## Guía de Uso

### Para Usuarios

**Crear una Lista:**
1. Ir a "Mis Listas" en el menú
2. Click en "Nueva Lista"
3. Elegir nombre y tipo
4. Confirmar

**Agregar Libro a Lista:**
1. Abrir detalle de un libro
2. Click en "Agregar a lista"
3. Seleccionar lista existente o crear nueva
4. Confirmación visual

**Filtrar Libros en Lista:**
1. Abrir detalle de lista
2. Click en botón "Filtros"
3. Ingresar criterios (autor, categoría, rating)
4. Ver resultados filtrados en tiempo real
5. "Limpiar filtros" para resetear

**Ordenar Libros:**
1. Usar dropdown "Ordenar por"
2. Elegir: Más recientes, Alfabético, Mejor valorados, Orden personalizado
3. Vista se actualiza automáticamente

**Cambiar Vista:**
1. Toggle Grid/Lista en toolbar
2. Grid: Tarjetas grandes con imágenes
3. Lista: Filas compactas con más información

### Para Desarrolladores

**Agregar Nuevo Filtro:**

1. Backend (`lista.controller.ts`):
```typescript
const { filterEditorial } = req.query;

if (filterEditorial) {
  contenidos = contenidos.filter(c => 
    c.libro.editorial && 
    c.libro.editorial.nombre.toLowerCase().includes(String(filterEditorial).toLowerCase())
  );
}
```

2. Frontend (`DetalleLista.tsx`):
```typescript
const [filterEditorial, setFilterEditorial] = useState('');

// En useEffect dependencies
useEffect(() => {
  cargarLista();
}, [filterEditorial]);

// En panel de filtros
<input
  placeholder="Filtrar por editorial..."
  value={filterEditorial}
  onChange={(e) => setFilterEditorial(e.target.value)}
/>
```

**Agregar Nuevo Tipo de Ordenamiento:**

1. Backend: Agregar case en switch:
```typescript
case 'fecha_publicacion':
  contenidos.sort((a, b) => 
    new Date(b.libro.fechaPublicacion).getTime() - 
    new Date(a.libro.fechaPublicacion).getTime()
  );
  break;
```

2. Frontend: Agregar opción en select:
```typescript
<option value="fecha_publicacion">Fecha de publicación</option>
```

---

## Beneficios del Sistema

✅ **Flexibilidad**: Múltiples formas de organizar y visualizar  
✅ **Performance**: Filtros y ordenamiento en backend  
✅ **UX Superior**: Feedback visual, transiciones, estados de carga  
✅ **Escalabilidad**: Arquitectura preparada para nuevas features  
✅ **Mantenibilidad**: Código modular y bien documentado  

---

## Próximos Pasos

1. ✅ Implementar drag & drop con @dnd-kit
2. ✅ Agregar modo presentación fullscreen
3. ✅ Crear modo estantería 3D
4. ✅ Animaciones con framer-motion
5. ✅ Color picker para listas custom
6. ✅ Exportar lista a PDF/CSV
7. ✅ Compartir listas públicas con URL

---

**Documentación creada:** 30/10/2025  
**Última actualización:** 30/10/2025  
**Versión:** 1.0.0
