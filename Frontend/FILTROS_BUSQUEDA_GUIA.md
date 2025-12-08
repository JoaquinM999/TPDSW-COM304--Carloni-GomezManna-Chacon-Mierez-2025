# 🔍 Sistema de Filtros Avanzados - Guía de Implementación

## ✅ COMPLETADO

### 1. ⚡ Accesos Rápidos Personalizables
**Archivo:** `Frontend/src/componentes/QuickAccess.tsx`

**Características:**
- Dropdown con lista de accesos rápidos personalizables
- **Drag & Drop** con Framer Motion Reorder para reorganizar
- **LocalStorage** para persistencia entre sesiones
- Botón "Agregar página actual" con nombre personalizable
- Máximo 8 accesos rápidos
- Iconos emoji automáticos según la página
- Modo edición con botones de eliminar
- Botón "Restaurar por defecto"
- Badge contador de accesos

**Uso:**
```tsx
import { QuickAccess } from './componentes/QuickAccess';

// En Header.tsx ya está integrado entre Search y Notifications
<QuickAccess />
```

**Estructura de datos:**
```typescript
interface QuickAccessItem {
  id: string;
  label: string;     // "Mis Favoritos"
  href: string;      // "/favoritos"
  icon?: string;     // "⭐"
  color?: string;    // "yellow"
}
```

**LocalStorage key:** `bookcode_quick_access`

---

### 2. 🏷️ Componente FilterChips
**Archivo:** `Frontend/src/componentes/FilterChips.tsx`

**Características:**
- Chips removibles con animaciones
- 4 tipos de filtros: Categoría, Año, Rating, Idioma
- Color coding automático por tipo
- Modal selector de filtros con preview
- Botón "Limpiar todos"
- Botón "Agregar filtro" con modal
- Contador de resultados
- Prevención de duplicados
- Animaciones de entrada/salida con Framer Motion

**Tipos de filtros:**

| Tipo | Icono | Color | Ejemplo |
|------|-------|-------|---------|
| `category` | 📚 BookOpen | Azul | "Ficción", "Ciencia" |
| `year` | 📅 Calendar | Verde | "2024-2025", "2020-2023" |
| `rating` | ⭐ Star | Amarillo | "4+", "5 estrellas" |
| `language` | 🌐 Filter | Púrpura | "es", "en" |

**Uso básico:**
```tsx
import { FilterChips, FilterSelector, FilterValue } from './componentes/FilterChips';

function MySearchPage() {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [showFilterSelector, setShowFilterSelector] = useState(false);

  const handleRemoveFilter = (filter: FilterValue) => {
    setFilters(filters.filter(f => f !== filter));
  };

  const handleAddFilter = (newFilter: FilterValue) => {
    setFilters([...filters, newFilter]);
  };

  const handleClearAll = () => {
    setFilters([]);
  };

  return (
    <div>
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
        onAddFilter={() => setShowFilterSelector(true)}
        resultCount={150}
      />

      <FilterSelector
        isOpen={showFilterSelector}
        onClose={() => setShowFilterSelector(false)}
        onAddFilter={handleAddFilter}
        existingFilters={filters}
      />
    </div>
  );
}
```

---

## 📋 PENDIENTE - Integración con Backend

### Actualizar Endpoint de Búsqueda

**Archivo Backend:** `Backend/src/controllers/libro.controller.ts`

**Modificar función:** `searchLibros`

**Query params a soportar:**
```typescript
// Actual (solo texto)
GET /api/libro/search?q=harry+potter

// Nuevo (con filtros múltiples)
GET /api/libro/search?q=harry+potter&category=Ficción&year=2020-2023&rating=4+&language=es
```

**Ejemplo de implementación:**
```typescript
export const searchLibros = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    const { 
      q, 
      category, 
      year, 
      rating,
      language,
      limit = 20, 
      offset = 0 
    } = req.query;

    const filters: any = {};

    // Filtro de texto
    if (q) {
      filters.$or = [
        { nombre: { $like: `%${q}%` } },
        { sinopsis: { $like: `%${q}%` } },
      ];
    }

    // Filtro de categoría
    if (category) {
      filters.categoria = { nombre: category };
    }

    // Filtro de año
    if (year) {
      if (year === '<2000') {
        filters.fechaPublicacion = { $lt: new Date('2000-01-01') };
      } else if (year.includes('-')) {
        const [start, end] = year.split('-');
        filters.fechaPublicacion = {
          $gte: new Date(`${start}-01-01`),
          $lte: new Date(`${end}-12-31`)
        };
      }
    }

    // Filtro de rating (requiere subquery o aggregation)
    if (rating) {
      // Implementar con join a tabla resenas y calcular promedio
      // Ejemplo: rating=4+ significa averageRating >= 4
    }

    // Filtro de idioma
    if (language) {
      filters.idioma = language;
    }

    const libros = await em.find(
      Libro,
      filters,
      {
        populate: ['autor', 'categoria', 'resenas'],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        orderBy: { nombre: 'ASC' }
      }
    );

    const total = await em.count(Libro, filters);

    res.json({
      libros: libros.map(transformLibro),
      total,
      limit,
      offset,
      filters: { q, category, year, rating, language }
    });

  } catch (error) {
    console.error('Error en búsqueda con filtros:', error);
    res.status(500).json({ error: 'Error al buscar libros' });
  }
};
```

---

### Actualizar Frontend - Servicio de Búsqueda

**Archivo:** `Frontend/src/services/libroService.ts`

**Agregar función:**
```typescript
export interface SearchFilters {
  q?: string;
  category?: string;
  year?: string;
  rating?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export const searchLibrosWithFilters = async (filters: SearchFilters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/libro/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Error al buscar libros');
  }
  
  return await response.json();
};
```

---

### Ejemplo Completo de Integración

**Crear:** `Frontend/src/paginas/BusquedaAvanzada.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { SearchBar } from '../componentes/SearchBar';
import { FilterChips, FilterSelector, FilterValue } from '../componentes/FilterChips';
import { searchLibrosWithFilters } from '../services/libroService';
import { LibroCard } from '../componentes/LibroCard';

export const BusquedaAvanzada = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilterSelector, setShowFilterSelector] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query && filters.length === 0) return;

      setLoading(true);
      try {
        // Convertir filters array a objeto
        const filterParams: any = { q: query };
        
        filters.forEach(filter => {
          filterParams[filter.type] = filter.value;
        });

        const data = await searchLibrosWithFilters(filterParams);
        setResults(data.libros || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeout);
  }, [query, filters]);

  const handleRemoveFilter = (filter: FilterValue) => {
    setFilters(filters.filter(f => f !== filter));
  };

  const handleAddFilter = (newFilter: FilterValue) => {
    setFilters([...filters, newFilter]);
  };

  const handleClearAll = () => {
    setFilters([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Búsqueda Avanzada</h1>

      {/* SearchBar */}
      <SearchBar
        placeholder="Buscar libros, autores, sagas..."
        onSearch={setQuery}
      />

      {/* FilterChips */}
      <FilterChips
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
        onAddFilter={() => setShowFilterSelector(true)}
        resultCount={total}
      />

      {/* FilterSelector Modal */}
      <FilterSelector
        isOpen={showFilterSelector}
        onClose={() => setShowFilterSelector(false)}
        onAddFilter={handleAddFilter}
        existingFilters={filters}
      />

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Buscando...</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((libro: any) => (
            <LibroCard key={libro.id} libro={libro} />
          ))}
        </div>
      )}

      {results.length === 0 && !loading && (query || filters.length > 0) && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No se encontraron resultados</p>
          <p className="text-gray-500 mt-2">Intenta con otros términos o filtros</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 Checklist de Implementación

### Frontend ✅
- [x] Componente QuickAccess creado
- [x] Componente FilterChips creado
- [x] Componente FilterSelector (modal) creado
- [x] QuickAccess integrado en Header
- [ ] FilterChips integrado en SearchBar o página de búsqueda
- [ ] Crear página BusquedaAvanzada.tsx
- [ ] Actualizar libroService con searchLibrosWithFilters
- [ ] Agregar ruta `/busqueda-avanzada` en App.tsx

### Backend ⏳
- [ ] Actualizar endpoint `/api/libro/search` para aceptar filtros múltiples
- [ ] Implementar filtro por categoría
- [ ] Implementar filtro por año (rangos)
- [ ] Implementar filtro por rating (requiere aggregation)
- [ ] Implementar filtro por idioma
- [ ] Agregar campo `idioma` a entidad Libro si no existe
- [ ] Crear índices en BD para optimizar búsquedas filtradas
- [ ] Testing de queries con filtros combinados

---

## 🚀 Mejoras Futuras

1. **Filtros Guardados**
   - Guardar combinaciones de filtros favoritas
   - Botón "Guardar búsqueda" con nombre personalizado
   - Lista de búsquedas guardadas en localStorage

2. **Filtros Dinámicos**
   - Cargar categorías desde backend
   - Mostrar solo años disponibles en la BD
   - Sugerencias de filtros basadas en resultados actuales

3. **URL State**
   - Sincronizar filtros con query params de la URL
   - Permitir compartir búsquedas filtradas por URL
   - Ejemplo: `/busqueda?q=harry&category=Ficción&year=2020-2023`

4. **Analytics**
   - Trackear filtros más usados
   - Sugerencias de filtros populares
   - A/B testing de diferentes UIs de filtros

---

## 📊 Métricas

### Tiempo Invertido
- QuickAccess: ~3 horas
- FilterChips + FilterSelector: ~4 horas
- **Total Frontend:** 7 horas
- **Backend pendiente:** ~4-6 horas
- **Testing e integración:** ~2-3 horas

### Impacto UX
- 🚀🚀🚀 **Muy Alto** - Mejora significativa en experiencia de búsqueda
- Reducción de clics para acceder a páginas favoritas
- Búsquedas más precisas con filtros combinados

---

**Última actualización:** 6 de diciembre de 2025  
**Estado:** 50% completado (Frontend listo, Backend pendiente)
