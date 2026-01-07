import { describe, it, expect } from 'vitest';
import {
  validateSearchQuery,
  buildSearchFilter,
  deduplicateLibros,
  sanitizeLikePattern,
} from '../../utils/libroSearchHelpers';
import { Libro } from '../../entities/libro.entity';

describe('libroSearchHelpers - validateSearchQuery', () => {
  it('debería validar query correcto', () => {
    const result = validateSearchQuery('Harry Potter');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('Harry Potter');
    expect(result.error).toBeUndefined();
  });

  it('debería rechazar query vacío', () => {
    const result = validateSearchQuery('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Query de búsqueda es requerido');
  });

  it('debería rechazar query con solo espacios', () => {
    const result = validateSearchQuery('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda debe tener al menos 2 caracteres');
  });

  it('debería rechazar query de 1 carácter', () => {
    const result = validateSearchQuery('a');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda debe tener al menos 2 caracteres');
  });

  it('debería aceptar query de exactamente 2 caracteres', () => {
    const result = validateSearchQuery('ab');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('ab');
  });

  it('debería rechazar query muy largo (más de 100 caracteres)', () => {
    const longQuery = 'a'.repeat(101);
    const result = validateSearchQuery(longQuery);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda no puede exceder 100 caracteres');
  });

  it('debería aceptar query de exactamente 100 caracteres', () => {
    const maxQuery = 'a'.repeat(100);
    const result = validateSearchQuery(maxQuery);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe(maxQuery);
  });

  it('debería sanitizar query con espacios al inicio y final', () => {
    const result = validateSearchQuery('  Lord of the Rings  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('Lord of the Rings');
  });

  it('debería preservar espacios internos', () => {
    const result = validateSearchQuery('The   Great   Gatsby');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('The   Great   Gatsby');
  });

  it('debería aceptar query con caracteres especiales', () => {
    const result = validateSearchQuery('C++ Programming');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedQuery).toBe('C++ Programming');
  });
});

describe('libroSearchHelpers - buildSearchFilter', () => {
  it('debería construir filtro por defecto (titulo y autor)', () => {
    const filter = buildSearchFilter('Potter');
    
    expect(filter).toHaveProperty('$or');
    expect(Array.isArray(filter.$or)).toBe(true);
    expect(filter.$or).toHaveLength(2);
    
    // Verificar búsqueda en título
    expect(filter.$or[0]).toEqual({ nombre: { $like: '%Potter%' } });
    
    // Verificar búsqueda en autor (nombre o apellido)
    expect(filter.$or[1]).toHaveProperty('autor');
    expect(filter.$or[1].autor).toHaveProperty('$or');
  });

  it('debería construir filtro solo para título', () => {
    const filter = buildSearchFilter('Potter', ['titulo']);
    
    expect(filter.$or).toHaveLength(1);
    expect(filter.$or[0]).toEqual({ nombre: { $like: '%Potter%' } });
  });

  it('debería construir filtro solo para autor', () => {
    const filter = buildSearchFilter('Rowling', ['autor']);
    
    expect(filter.$or).toHaveLength(1);
    expect(filter.$or[0]).toHaveProperty('autor');
    expect(filter.$or[0].autor.$or).toHaveLength(2);
    expect(filter.$or[0].autor.$or[0]).toEqual({ nombre: { $like: '%Rowling%' } });
    expect(filter.$or[0].autor.$or[1]).toEqual({ apellido: { $like: '%Rowling%' } });
  });

  it('debería construir filtro para categoría', () => {
    const filter = buildSearchFilter('Fantasía', ['categoria']);
    
    expect(filter.$or).toHaveLength(1);
    expect(filter.$or[0]).toEqual({ 
      categoria: { nombre: { $like: '%Fantasía%' } }
    });
  });

  it('debería construir filtro para editorial', () => {
    const filter = buildSearchFilter('Salamandra', ['editorial']);
    
    expect(filter.$or).toHaveLength(1);
    expect(filter.$or[0]).toEqual({ 
      editorial: { nombre: { $like: '%Salamandra%' } }
    });
  });

  it('debería construir filtro para múltiples campos', () => {
    const filter = buildSearchFilter('Potter', ['titulo', 'autor', 'categoria']);
    
    expect(filter.$or).toHaveLength(3);
    expect(filter.$or[0]).toHaveProperty('nombre'); // título
    expect(filter.$or[1]).toHaveProperty('autor'); // autor
    expect(filter.$or[2]).toHaveProperty('categoria'); // categoría
  });

  it('debería incluir patrón con % al inicio y final', () => {
    const filter = buildSearchFilter('test');
    
    expect(filter.$or[0].nombre.$like).toBe('%test%');
  });

  it('debería preservar mayúsculas/minúsculas en el patrón', () => {
    const filter = buildSearchFilter('HaRrY');
    
    expect(filter.$or[0].nombre.$like).toBe('%HaRrY%');
  });

  it('debería manejar query con espacios', () => {
    const filter = buildSearchFilter('  Harry Potter  ');
    
    // El trim se hace internamente
    expect(filter.$or[0].nombre.$like).toBe('%Harry Potter%');
  });
});

describe('libroSearchHelpers - deduplicateLibros', () => {
  it('debería eliminar libros duplicados por ID', () => {
    const libro1 = { id: 1, nombre: 'Libro 1' } as Libro;
    const libro2 = { id: 2, nombre: 'Libro 2' } as Libro;
    const libro1Duplicate = { id: 1, nombre: 'Libro 1 (copia)' } as Libro;
    
    const libros = [libro1, libro2, libro1Duplicate];
    const result = deduplicateLibros(libros);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('debería retornar array vacío si recibe array vacío', () => {
    const result = deduplicateLibros([]);
    expect(result).toEqual([]);
  });

  it('debería preservar el primer libro en caso de duplicados', () => {
    const libro1 = { id: 1, nombre: 'Primera versión' } as Libro;
    const libro1Duplicate = { id: 1, nombre: 'Segunda versión' } as Libro;
    
    const result = deduplicateLibros([libro1, libro1Duplicate]);
    
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Primera versión');
  });

  it('debería mantener el orden original de libros únicos', () => {
    const libro1 = { id: 1, nombre: 'A' } as Libro;
    const libro2 = { id: 2, nombre: 'B' } as Libro;
    const libro3 = { id: 3, nombre: 'C' } as Libro;
    
    const result = deduplicateLibros([libro1, libro2, libro3]);
    
    expect(result).toHaveLength(3);
    expect(result[0].nombre).toBe('A');
    expect(result[1].nombre).toBe('B');
    expect(result[2].nombre).toBe('C');
  });

  it('debería manejar array con un solo libro', () => {
    const libro = { id: 1, nombre: 'Solo libro' } as Libro;
    const result = deduplicateLibros([libro]);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(libro);
  });

  it('debería eliminar múltiples duplicados del mismo libro', () => {
    const libro1 = { id: 1, nombre: 'Libro' } as Libro;
    const libro1Dup1 = { id: 1, nombre: 'Copia 1' } as Libro;
    const libro1Dup2 = { id: 1, nombre: 'Copia 2' } as Libro;
    const libro1Dup3 = { id: 1, nombre: 'Copia 3' } as Libro;
    
    const result = deduplicateLibros([libro1, libro1Dup1, libro1Dup2, libro1Dup3]);
    
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Libro');
  });

  it('debería manejar mezcla de libros únicos y duplicados', () => {
    const libro1 = { id: 1, nombre: 'A' } as Libro;
    const libro2 = { id: 2, nombre: 'B' } as Libro;
    const libro1Dup = { id: 1, nombre: 'A copia' } as Libro;
    const libro3 = { id: 3, nombre: 'C' } as Libro;
    const libro2Dup = { id: 2, nombre: 'B copia' } as Libro;
    
    const result = deduplicateLibros([libro1, libro2, libro1Dup, libro3, libro2Dup]);
    
    expect(result).toHaveLength(3);
    expect(result.map(l => l.id)).toEqual([1, 2, 3]);
  });
});

describe('libroSearchHelpers - sanitizeLikePattern', () => {
  it('debería escapar el carácter %', () => {
    const result = sanitizeLikePattern('100% sure');
    expect(result).toBe('100\\% sure');
  });

  it('debería escapar el carácter _', () => {
    const result = sanitizeLikePattern('test_query');
    expect(result).toBe('test\\_query');
  });

  it('debería escapar el carácter [', () => {
    const result = sanitizeLikePattern('test[brackets]');
    expect(result).toBe('test\\[brackets\\]');
  });

  it('debería escapar el carácter ]', () => {
    const result = sanitizeLikePattern('test]end');
    expect(result).toBe('test\\]end');
  });

  it('debería escapar múltiples caracteres especiales', () => {
    const result = sanitizeLikePattern('100%_test[a]');
    expect(result).toBe('100\\%\\_test\\[a\\]');
  });

  it('debería hacer trim de espacios', () => {
    const result = sanitizeLikePattern('  query  ');
    expect(result).toBe('query');
  });

  it('debería manejar query sin caracteres especiales', () => {
    const result = sanitizeLikePattern('normal query');
    expect(result).toBe('normal query');
  });

  it('debería manejar query vacío', () => {
    const result = sanitizeLikePattern('');
    expect(result).toBe('');
  });

  it('debería manejar query con solo espacios', () => {
    const result = sanitizeLikePattern('   ');
    expect(result).toBe('');
  });

  it('debería preservar otros caracteres especiales', () => {
    const result = sanitizeLikePattern('C++ & Java!');
    expect(result).toBe('C++ & Java!');
  });

  it('debería escapar % al inicio y final', () => {
    const result = sanitizeLikePattern('%query%');
    expect(result).toBe('\\%query\\%');
  });

  it('debería manejar múltiples % consecutivos', () => {
    const result = sanitizeLikePattern('test%%%end');
    expect(result).toBe('test\\%\\%\\%end');
  });
});

// ============================================
// TESTS CON MOCKS DE ENTITYMANAGER
// ============================================

import { vi } from 'vitest';
import type { EntityManager } from '@mikro-orm/mysql';
import {
  searchLibrosOptimized,
  searchLibrosByTitulo,
  searchLibrosByAutor,
  getSearchSuggestions,
} from '../../utils/libroSearchHelpers';

describe('libroSearchHelpers - searchLibrosOptimized (con mock)', () => {
  it('debería buscar libros con query válido', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { id: 1, nombre: 'Harry Potter', autor: { nombre: 'J.K.', apellido: 'Rowling' } },
        { id: 2, nombre: 'Harry Potter 2', autor: { nombre: 'J.K.', apellido: 'Rowling' } },
      ])
    } as unknown as EntityManager;

    const result = await searchLibrosOptimized(mockEM, {
      query: 'Harry Potter',
      searchIn: ['titulo'],
      limit: 10,
      offset: 0
    });

    expect(result).toHaveLength(2);
    expect(result[0].nombre).toBe('Harry Potter');
    expect(mockEM.find).toHaveBeenCalledTimes(1);
  });

  it('debería usar límite por defecto de 50', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosOptimized(mockEM, {
      query: 'test',
      searchIn: ['titulo']
    });

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 50, offset: 0 })
    );
  });

  it('debería usar offset personalizado', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosOptimized(mockEM, {
      query: 'test',
      searchIn: ['titulo'],
      limit: 20,
      offset: 40
    });

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 20, offset: 40 })
    );
  });

  it('debería lanzar error si query es inválido', async () => {
    const mockEM = {} as EntityManager;

    await expect(searchLibrosOptimized(mockEM, {
      query: 'a', // muy corto
      searchIn: ['titulo']
    })).rejects.toThrow('La consulta de búsqueda debe tener al menos 2 caracteres');
  });

  it('debería lanzar error si query está vacío', async () => {
    const mockEM = {} as EntityManager;

    await expect(searchLibrosOptimized(mockEM, {
      query: '',
      searchIn: ['titulo']
    })).rejects.toThrow('Query de búsqueda es requerido');
  });

  it('debería populate relaciones (autor, categoria, editorial)', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosOptimized(mockEM, {
      query: 'test',
      searchIn: ['titulo']
    });

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        populate: ['autor', 'categoria', 'editorial']
      })
    );
  });

  it('debería ordenar por nombre ASC', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosOptimized(mockEM, {
      query: 'test',
      searchIn: ['titulo']
    });

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        orderBy: { nombre: 'ASC' }
      })
    );
  });

  it('debería construir filtro con múltiples campos', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosOptimized(mockEM, {
      query: 'Tolkien',
      searchIn: ['titulo', 'autor', 'categoria']
    });

    const callArgs = mockEM.find.mock.calls[0];
    const whereClause = callArgs[1];
    
    expect(whereClause).toHaveProperty('$or');
    expect(Array.isArray(whereClause.$or)).toBe(true);
    expect(whereClause.$or.length).toBeGreaterThan(0);
  });
});

describe('libroSearchHelpers - searchLibrosByTitulo (con mock)', () => {
  it('debería buscar libros solo por título', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { id: 1, nombre: 'Lord of the Rings' }
      ])
    } as unknown as EntityManager;

    const result = await searchLibrosByTitulo(mockEM, 'Lord', 20);

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Lord of the Rings');
    expect(mockEM.find).toHaveBeenCalledTimes(1);
  });

  it('debería usar límite personalizado', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosByTitulo(mockEM, 'test', 100);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 100 })
    );
  });

  it('debería usar límite por defecto de 50', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosByTitulo(mockEM, 'test');

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 50 })
    );
  });
});

describe('libroSearchHelpers - searchLibrosByAutor (con mock)', () => {
  it('debería buscar libros solo por autor', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { id: 1, nombre: 'El Hobbit', autor: { nombre: 'J.R.R.', apellido: 'Tolkien' } }
      ])
    } as unknown as EntityManager;

    const result = await searchLibrosByAutor(mockEM, 'Tolkien', 30);

    expect(result).toHaveLength(1);
    expect(result[0].autor.apellido).toBe('Tolkien');
    expect(mockEM.find).toHaveBeenCalledTimes(1);
  });

  it('debería usar límite personalizado', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchLibrosByAutor(mockEM, 'test', 75);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 75 })
    );
  });
});

describe('libroSearchHelpers - getSearchSuggestions (con mock)', () => {
  it('debería retornar sugerencias de libros', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { nombre: 'Harry Potter y la Piedra Filosofal' },
        { nombre: 'Harry Potter y la Cámara Secreta' },
        { nombre: 'Harry Potter y el Prisionero' },
      ])
    } as unknown as EntityManager;

    const result = await getSearchSuggestions(mockEM, 'Harry');

    expect(result).toHaveLength(3);
    expect(result[0]).toBe('Harry Potter y la Piedra Filosofal');
    expect(result).toEqual([
      'Harry Potter y la Piedra Filosofal',
      'Harry Potter y la Cámara Secreta',
      'Harry Potter y el Prisionero'
    ]);
  });

  it('debería usar límite por defecto de 5', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await getSearchSuggestions(mockEM, 'test');

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ nombre: { $like: 'test%' } }),
      expect.objectContaining({ limit: 5 })
    );
  });

  it('debería usar límite personalizado', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await getSearchSuggestions(mockEM, 'test', 10);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ limit: 10 })
    );
  });

  it('debería retornar array vacío si query es inválido', async () => {
    const mockEM = {} as EntityManager;

    const result = await getSearchSuggestions(mockEM, 'a'); // muy corto
    expect(result).toEqual([]);
  });

  it('debería filtrar libros sin nombre (undefined)', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { nombre: 'Libro 1' },
        { nombre: undefined },
        { nombre: 'Libro 2' },
      ])
    } as unknown as EntityManager;

    const result = await getSearchSuggestions(mockEM, 'test');

    expect(result).toHaveLength(2);
    expect(result).toEqual(['Libro 1', 'Libro 2']);
  });

  it('debería ordenar resultados por nombre ASC', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await getSearchSuggestions(mockEM, 'test');

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        orderBy: { nombre: 'ASC' }
      })
    );
  });

  it('debería usar patrón de autocompletado (prefix%)', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await getSearchSuggestions(mockEM, 'Harry');

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        nombre: { $like: 'Harry%' }
      }),
      expect.anything()
    );
  });
});
