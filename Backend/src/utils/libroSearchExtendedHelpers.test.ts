import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  searchLibrosByISBN,
  deduplicateLibros,
  searchLibrosWithStats,
  sanitizeLikePattern
} from '../../src/utils/libroSearchHelpers';
import type { EntityManager } from '@mikro-orm/mysql';
import { Libro } from '../../src/entities/libro.entity';

describe('libroSearchExtendedHelpers - searchLibrosByISBN', () => {
  it('debería retornar null con query inválido', async () => {
    const mockEM = {} as EntityManager;
    
    const result = await searchLibrosByISBN(mockEM, '');
    
    expect(result).toBeNull();
  });

  it('debería retornar null con query muy corto', async () => {
    const mockEM = {} as EntityManager;
    
    const result = await searchLibrosByISBN(mockEM, 'ab');
    
    expect(result).toBeNull();
  });

  it('debería retornar null porque el campo isbn no existe todavía', async () => {
    const mockEM = {} as EntityManager;
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = await searchLibrosByISBN(mockEM, '978-0-123456-78-9');
    
    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('isbn'));
    
    consoleWarnSpy.mockRestore();
  });

  it('debería validar el query antes de buscar', async () => {
    const mockEM = {} as EntityManager;
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = await searchLibrosByISBN(mockEM, 'ValidISBN123');
    
    // Debería validar y retornar null porque el campo no existe
    expect(result).toBeNull();
    
    consoleWarnSpy.mockRestore();
  });
});

describe('libroSearchExtendedHelpers - deduplicateLibros', () => {
  it('debería eliminar libros duplicados por ID', () => {
    const mockLibro1 = { id: 1, nombre: 'Libro A' } as Libro;
    const mockLibro2 = { id: 2, nombre: 'Libro B' } as Libro;
    const mockLibro1Duplicate = { id: 1, nombre: 'Libro A Duplicado' } as Libro;
    const mockLibro3 = { id: 3, nombre: 'Libro C' } as Libro;

    const libros = [mockLibro1, mockLibro2, mockLibro1Duplicate, mockLibro3];
    
    const result = deduplicateLibros(libros);

    expect(result).toHaveLength(3);
    expect(result.map(l => l.id)).toEqual([1, 2, 3]);
  });

  it('debería mantener el primer libro cuando hay duplicados', () => {
    const mockLibro1First = { id: 1, nombre: 'Primero' } as Libro;
    const mockLibro1Second = { id: 1, nombre: 'Segundo' } as Libro;
    const mockLibro1Third = { id: 1, nombre: 'Tercero' } as Libro;

    const libros = [mockLibro1First, mockLibro1Second, mockLibro1Third];
    
    const result = deduplicateLibros(libros);

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Primero');
  });

  it('debería retornar array vacío si recibe array vacío', () => {
    const result = deduplicateLibros([]);
    
    expect(result).toEqual([]);
  });

  it('debería retornar mismo array si no hay duplicados', () => {
    const mockLibro1 = { id: 1, nombre: 'Libro A' } as Libro;
    const mockLibro2 = { id: 2, nombre: 'Libro B' } as Libro;
    const mockLibro3 = { id: 3, nombre: 'Libro C' } as Libro;

    const libros = [mockLibro1, mockLibro2, mockLibro3];
    
    const result = deduplicateLibros(libros);

    expect(result).toHaveLength(3);
    expect(result).toEqual(libros);
  });

  it('debería manejar múltiples sets de duplicados', () => {
    const mockLibro1a = { id: 1, nombre: 'A1' } as Libro;
    const mockLibro1b = { id: 1, nombre: 'A2' } as Libro;
    const mockLibro2a = { id: 2, nombre: 'B1' } as Libro;
    const mockLibro2b = { id: 2, nombre: 'B2' } as Libro;
    const mockLibro3 = { id: 3, nombre: 'C' } as Libro;

    const libros = [mockLibro1a, mockLibro2a, mockLibro1b, mockLibro3, mockLibro2b];
    
    const result = deduplicateLibros(libros);

    expect(result).toHaveLength(3);
    expect(result.map(l => l.id)).toEqual([1, 2, 3]);
  });

  it('debería preservar el orden original (manteniendo primeras apariciones)', () => {
    const mockLibro3 = { id: 3, nombre: 'C' } as Libro;
    const mockLibro1 = { id: 1, nombre: 'A' } as Libro;
    const mockLibro2 = { id: 2, nombre: 'B' } as Libro;
    const mockLibro1Dup = { id: 1, nombre: 'A2' } as Libro;

    const libros = [mockLibro3, mockLibro1, mockLibro2, mockLibro1Dup];
    
    const result = deduplicateLibros(libros);

    expect(result).toHaveLength(3);
    expect(result.map(l => l.id)).toEqual([3, 1, 2]);
  });
});

describe('libroSearchExtendedHelpers - searchLibrosWithStats', () => {
  it('debería retornar libros y estadísticas', async () => {
    const mockLibros = [
      { id: 1, nombre: 'Libro 1' } as Libro,
      { id: 2, nombre: 'Libro 2' } as Libro
    ];

    const mockFind = vi.fn().mockResolvedValue(mockLibros);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const options = {
      query: 'test',
      searchIn: ['titulo' as const, 'autor' as const],
      limit: 10,
      offset: 0
    };

    const result = await searchLibrosWithStats(mockEM, options);

    expect(result.libros).toEqual(mockLibros);
    expect(result.stats).toMatchObject({
      query: 'test',
      fieldsSearched: ['titulo', 'autor'],
      resultsCount: 2
    });
    expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);
  });

  it('debería medir el tiempo de ejecución', async () => {
    const mockLibros = [{ id: 1, nombre: 'Libro' } as Libro];
    const mockFind = vi.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(mockLibros), 10));
    });
    
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const options = {
      query: 'test',
      limit: 10,
      offset: 0
    };

    const result = await searchLibrosWithStats(mockEM, options);

    expect(result.stats.executionTime).toBeGreaterThan(0);
  });

  it('debería usar campos por defecto si no se especifican', async () => {
    const mockLibros = [] as Libro[];
    const mockFind = vi.fn().mockResolvedValue(mockLibros);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const options = {
      query: 'test',
      limit: 10,
      offset: 0
    };

    const result = await searchLibrosWithStats(mockEM, options);

    expect(result.stats.fieldsSearched).toEqual(['titulo', 'autor']);
  });

  it('debería retornar stats con 0 resultados si no encuentra nada', async () => {
    const mockFind = vi.fn().mockResolvedValue([]);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const options = {
      query: 'noexiste',
      limit: 10,
      offset: 0
    };

    const result = await searchLibrosWithStats(mockEM, options);

    expect(result.libros).toEqual([]);
    expect(result.stats.resultsCount).toBe(0);
  });

  it('debería incluir todos los campos de búsqueda en stats', async () => {
    const mockLibros = [] as Libro[];
    const mockFind = vi.fn().mockResolvedValue(mockLibros);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const options = {
      query: 'test',
      searchIn: ['titulo' as const, 'autor' as const, 'isbn' as const, 'categoria' as const],
      limit: 10,
      offset: 0
    };

    const result = await searchLibrosWithStats(mockEM, options);

    expect(result.stats.fieldsSearched).toEqual(['titulo', 'autor', 'isbn', 'categoria']);
  });
});

describe('libroSearchExtendedHelpers - sanitizeLikePattern', () => {
  it('debería escapar el carácter %', () => {
    const result = sanitizeLikePattern('50%');
    
    expect(result).toBe('50\\%');
  });

  it('debería escapar el carácter _', () => {
    const result = sanitizeLikePattern('test_query');
    
    expect(result).toBe('test\\_query');
  });

  it('debería escapar corchetes []', () => {
    const result = sanitizeLikePattern('test[abc]');
    
    expect(result).toBe('test\\[abc\\]');
  });

  it('debería escapar múltiples caracteres especiales', () => {
    const result = sanitizeLikePattern('50%_off[now]');
    
    expect(result).toBe('50\\%\\_off\\[now\\]');
  });

  it('debería eliminar espacios al inicio y final', () => {
    const result = sanitizeLikePattern('  test query  ');
    
    expect(result).toBe('test query');
  });

  it('NO debería modificar texto normal', () => {
    const result = sanitizeLikePattern('simple query');
    
    expect(result).toBe('simple query');
  });

  it('debería manejar string vacío', () => {
    const result = sanitizeLikePattern('');
    
    expect(result).toBe('');
  });

  it('debería manejar string solo con espacios', () => {
    const result = sanitizeLikePattern('   ');
    
    expect(result).toBe('');
  });

  it('debería escapar % consecutivos', () => {
    const result = sanitizeLikePattern('100%%');
    
    expect(result).toBe('100\\%\\%');
  });

  it('debería escapar _ consecutivos', () => {
    const result = sanitizeLikePattern('test__query');
    
    expect(result).toBe('test\\_\\_query');
  });

  it('debería combinar escape y trim correctamente', () => {
    const result = sanitizeLikePattern('  50%_off  ');
    
    expect(result).toBe('50\\%\\_off');
  });

  it('debería manejar solo caracteres especiales', () => {
    const result = sanitizeLikePattern('%_[]');
    
    expect(result).toBe('\\%\\_\\[\\]');
  });
});
