import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateAuthorSearchQuery,
  combineAuthorResults,
  generateCacheKey,
} from '../../utils/autorSearchHelpers';
import { Autor } from '../../entities/autor.entity';

describe('autorSearchHelpers - validateAuthorSearchQuery', () => {
  it('debería validar query correcto', () => {
    const result = validateAuthorSearchQuery('Tolkien');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('Tolkien');
    expect(result.error).toBeUndefined();
  });

  it('debería rechazar query null', () => {
    const result = validateAuthorSearchQuery(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería rechazar query undefined', () => {
    const result = validateAuthorSearchQuery(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería rechazar query vacío', () => {
    const result = validateAuthorSearchQuery('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería rechazar query con solo espacios', () => {
    const result = validateAuthorSearchQuery('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda debe tener al menos 2 caracteres');
  });

  it('debería rechazar query de 1 carácter', () => {
    const result = validateAuthorSearchQuery('a');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda debe tener al menos 2 caracteres');
  });

  it('debería aceptar query de exactamente 2 caracteres', () => {
    const result = validateAuthorSearchQuery('ab');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('ab');
  });

  it('debería rechazar query muy largo (más de 100 caracteres)', () => {
    const longQuery = 'a'.repeat(101);
    const result = validateAuthorSearchQuery(longQuery);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('La consulta de búsqueda no puede exceder 100 caracteres');
  });

  it('debería aceptar query de exactamente 100 caracteres', () => {
    const maxQuery = 'a'.repeat(100);
    const result = validateAuthorSearchQuery(maxQuery);
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe(maxQuery);
  });

  it('debería sanitizar query con espacios al inicio y final', () => {
    const result = validateAuthorSearchQuery('  J.R.R. Tolkien  ');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('J.R.R. Tolkien');
  });

  it('debería preservar espacios internos', () => {
    const result = validateAuthorSearchQuery('Gabriel   García   Márquez');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('Gabriel   García   Márquez');
  });

  it('debería rechazar query que no es string (número)', () => {
    const result = validateAuthorSearchQuery(123);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería rechazar query que no es string (objeto)', () => {
    const result = validateAuthorSearchQuery({ name: 'Tolkien' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería rechazar query que no es string (array)', () => {
    const result = validateAuthorSearchQuery(['Tolkien']);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El parámetro "q" es requerido y debe ser un string');
  });

  it('debería aceptar query con caracteres especiales', () => {
    const result = validateAuthorSearchQuery('José María Pérez');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('José María Pérez');
  });

  it('debería aceptar query con números', () => {
    const result = validateAuthorSearchQuery('Author 123');
    expect(result.valid).toBe(true);
    expect(result.trimmedQuery).toBe('Author 123');
  });
});

describe('autorSearchHelpers - combineAuthorResults', () => {
  it('debería combinar resultados locales y externos', () => {
    const autoresLocales = [
      { id: 1, nombre: 'Gabriel', apellido: 'García Márquez' } as Autor,
      { id: 2, nombre: 'Jorge Luis', apellido: 'Borges' } as Autor,
    ];
    
    const autoresExternos = [
      { nombre: 'Julio Cortázar', source: 'google' },
      { nombre: 'Mario Vargas Llosa', source: 'openlibrary' },
    ];

    const result = combineAuthorResults(autoresLocales, autoresExternos);

    expect(result).toHaveLength(4);
    expect(result[0]).toBe(autoresLocales[0]);
    expect(result[1]).toBe(autoresLocales[1]);
    expect(result[2]).toBe(autoresExternos[0]);
    expect(result[3]).toBe(autoresExternos[1]);
  });

  it('debería manejar solo resultados locales', () => {
    const autoresLocales = [
      { id: 1, nombre: 'Gabriel', apellido: 'García Márquez' } as Autor,
    ];
    
    const result = combineAuthorResults(autoresLocales, []);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(autoresLocales[0]);
  });

  it('debería manejar solo resultados externos', () => {
    const autoresExternos = [
      { nombre: 'Julio Cortázar', source: 'google' },
    ];

    const result = combineAuthorResults([], autoresExternos);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(autoresExternos[0]);
  });

  it('debería manejar ambos arrays vacíos', () => {
    const result = combineAuthorResults([], []);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('debería preservar el orden (locales primero, externos después)', () => {
    const autoresLocales = [
      { id: 1, nombre: 'Local', apellido: 'Uno' } as Autor,
      { id: 2, nombre: 'Local', apellido: 'Dos' } as Autor,
    ];
    
    const autoresExternos = [
      { nombre: 'Externo Uno', source: 'google' },
      { nombre: 'Externo Dos', source: 'openlibrary' },
    ];

    const result = combineAuthorResults(autoresLocales, autoresExternos);

    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty('apellido', 'Uno');
    expect(result[1]).toHaveProperty('apellido', 'Dos');
    expect(result[2]).toHaveProperty('nombre', 'Externo Uno');
    expect(result[3]).toHaveProperty('nombre', 'Externo Dos');
  });

  it('debería crear un nuevo array (no mutar originales)', () => {
    const autoresLocales = [
      { id: 1, nombre: 'Local', apellido: 'Autor' } as Autor,
    ];
    
    const autoresExternos = [
      { nombre: 'Externo Autor', source: 'google' },
    ];

    const result = combineAuthorResults(autoresLocales, autoresExternos);

    expect(result).not.toBe(autoresLocales);
    expect(result).not.toBe(autoresExternos);
    expect(result).toHaveLength(2);
  });

  it('debería manejar muchos resultados locales', () => {
    const autoresLocales = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      nombre: `Autor ${i + 1}`,
      apellido: `Apellido ${i + 1}`
    })) as Autor[];

    const result = combineAuthorResults(autoresLocales, []);

    expect(result).toHaveLength(50);
    expect(result[0].id).toBe(1);
    expect(result[49].id).toBe(50);
  });

  it('debería manejar muchos resultados externos', () => {
    const autoresExternos = Array.from({ length: 30 }, (_, i) => ({
      nombre: `Externo ${i + 1}`,
      source: i % 2 === 0 ? 'google' : 'openlibrary'
    }));

    const result = combineAuthorResults([], autoresExternos);

    expect(result).toHaveLength(30);
    expect(result[0].nombre).toBe('Externo 1');
    expect(result[29].nombre).toBe('Externo 30');
  });
});

describe('autorSearchHelpers - generateCacheKey', () => {
  it('debería generar clave con búsqueda local (external=false)', () => {
    const key = generateCacheKey('Tolkien', false);
    expect(key).toBe('autores:search:Tolkien:external:false');
  });

  it('debería generar clave con búsqueda externa (external=true)', () => {
    const key = generateCacheKey('Tolkien', true);
    expect(key).toBe('autores:search:Tolkien:external:true');
  });

  it('debería generar claves diferentes para misma query con diferente external', () => {
    const keyLocal = generateCacheKey('García', false);
    const keyExternal = generateCacheKey('García', true);
    
    expect(keyLocal).not.toBe(keyExternal);
    expect(keyLocal).toBe('autores:search:García:external:false');
    expect(keyExternal).toBe('autores:search:García:external:true');
  });

  it('debería generar claves diferentes para queries diferentes', () => {
    const key1 = generateCacheKey('Tolkien', false);
    const key2 = generateCacheKey('Rowling', false);
    
    expect(key1).not.toBe(key2);
    expect(key1).toBe('autores:search:Tolkien:external:false');
    expect(key2).toBe('autores:search:Rowling:external:false');
  });

  it('debería manejar query con espacios', () => {
    const key = generateCacheKey('J.R.R. Tolkien', true);
    expect(key).toBe('autores:search:J.R.R. Tolkien:external:true');
  });

  it('debería manejar query con caracteres especiales', () => {
    const key = generateCacheKey('García Márquez', false);
    expect(key).toBe('autores:search:García Márquez:external:false');
  });

  it('debería seguir formato consistente', () => {
    const key = generateCacheKey('test', true);
    expect(key).toMatch(/^autores:search:.+:external:(true|false)$/);
  });

  it('debería incluir el prefijo "autores:search"', () => {
    const key = generateCacheKey('cualquier query', false);
    expect(key.startsWith('autores:search:')).toBe(true);
  });

  it('debería generar clave única para query vacía', () => {
    const key = generateCacheKey('', false);
    expect(key).toBe('autores:search::external:false');
  });

  it('debería preservar mayúsculas/minúsculas en query', () => {
    const keyLower = generateCacheKey('tolkien', false);
    const keyUpper = generateCacheKey('TOLKIEN', false);
    const keyMixed = generateCacheKey('Tolkien', false);
    
    expect(keyLower).toBe('autores:search:tolkien:external:false');
    expect(keyUpper).toBe('autores:search:TOLKIEN:external:false');
    expect(keyMixed).toBe('autores:search:Tolkien:external:false');
    expect(keyLower).not.toBe(keyUpper);
    expect(keyLower).not.toBe(keyMixed);
  });
});

// ============================================
// TESTS CON MOCKS DE ENTITYMANAGER Y REDIS
// ============================================

import type { EntityManager } from '@mikro-orm/mysql';
import {
  searchAutoresLocal,
  searchAutoresExternal,
  getFromCache,
  saveToCache,
} from '../../utils/autorSearchHelpers';
import * as autorService from '../../services/autor.service';
import redis from '../../redis';

// Mock redis
vi.mock('../../redis', () => ({
  default: {
    get: vi.fn(),
    setex: vi.fn(),
  }
}));

// Mock autor.service
vi.mock('../../services/autor.service', () => ({
  searchGoogleBooksAuthorsReadOnly: vi.fn(),
  searchOpenLibraryAuthorsReadOnly: vi.fn()
}));

describe('autorSearchHelpers - searchAutoresLocal (con mock)', () => {
  it('debería buscar autores por nombre', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([
        { id: 1, nombre: 'Gabriel', apellido: 'García Márquez' },
        { id: 2, nombre: 'Gabriel', apellido: 'García Lorca' },
      ])
    } as unknown as EntityManager;

    const result = await searchAutoresLocal(mockEM, 'Gabriel');

    expect(result).toHaveLength(2);
    expect(result[0].nombre).toBe('Gabriel');
    expect(mockEM.find).toHaveBeenCalledTimes(1);
  });

  it('debería construir query con $or para nombre y apellido', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchAutoresLocal(mockEM, 'García');

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $or: expect.arrayContaining([
          { nombre: { $like: '%García%' } },
          { apellido: { $like: '%García%' } }
        ])
      })
    );
  });

  it('debería retornar array vacío si no encuentra resultados', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const result = await searchAutoresLocal(mockEM, 'AutorInexistente');

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('debería usar patrón LIKE con % al inicio y final', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    await searchAutoresLocal(mockEM, 'Tolkien');

    const callArgs = mockEM.find.mock.calls[0];
    const whereClause = callArgs[1];
    
    expect(whereClause.$or[0].nombre.$like).toBe('%Tolkien%');
    expect(whereClause.$or[1].apellido.$like).toBe('%Tolkien%');
  });
});

describe('autorSearchHelpers - searchAutoresExternal (con mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería buscar en Google Books y OpenLibrary', async () => {
    vi.mocked(autorService.searchGoogleBooksAuthorsReadOnly).mockResolvedValue([
      { nombre: 'J.K.', apellido: 'Rowling', source: 'google' }
    ]);
    vi.mocked(autorService.searchOpenLibraryAuthorsReadOnly).mockResolvedValue([
      { nombre: 'J.R.R.', apellido: 'Tolkien', source: 'openlibrary' }
    ]);

    const result = await searchAutoresExternal('fantasy');

    expect(result).toHaveLength(2);
    expect(result[0].source).toBe('google');
    expect(result[1].source).toBe('openlibrary');
    expect(autorService.searchGoogleBooksAuthorsReadOnly).toHaveBeenCalledWith('fantasy');
    expect(autorService.searchOpenLibraryAuthorsReadOnly).toHaveBeenCalledWith('fantasy');
  });

  it('debería manejar errores de Google Books sin interrumpir', async () => {
    vi.mocked(autorService.searchGoogleBooksAuthorsReadOnly).mockRejectedValue(
      new Error('API Error')
    );
    vi.mocked(autorService.searchOpenLibraryAuthorsReadOnly).mockResolvedValue([
      { nombre: 'Test', apellido: 'Author' }
    ]);

    const result = await searchAutoresExternal('query');

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Test');
  });

  it('debería manejar errores de OpenLibrary sin interrumpir', async () => {
    vi.mocked(autorService.searchGoogleBooksAuthorsReadOnly).mockResolvedValue([
      { nombre: 'Test', apellido: 'Author' }
    ]);
    vi.mocked(autorService.searchOpenLibraryAuthorsReadOnly).mockRejectedValue(
      new Error('API Error')
    );

    const result = await searchAutoresExternal('query');

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Test');
  });

  it('debería retornar array vacío si ambas APIs fallan', async () => {
    vi.mocked(autorService.searchGoogleBooksAuthorsReadOnly).mockRejectedValue(
      new Error('API Error')
    );
    vi.mocked(autorService.searchOpenLibraryAuthorsReadOnly).mockRejectedValue(
      new Error('API Error')
    );

    const result = await searchAutoresExternal('query');

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('debería combinar resultados de ambas APIs', async () => {
    vi.mocked(autorService.searchGoogleBooksAuthorsReadOnly).mockResolvedValue([
      { nombre: 'Author1', apellido: 'Google' },
      { nombre: 'Author2', apellido: 'Google' }
    ]);
    vi.mocked(autorService.searchOpenLibraryAuthorsReadOnly).mockResolvedValue([
      { nombre: 'Author3', apellido: 'OpenLib' }
    ]);

    const result = await searchAutoresExternal('query');

    expect(result).toHaveLength(3);
    expect(result[0].apellido).toBe('Google');
    expect(result[2].apellido).toBe('OpenLib');
  });
});

describe('autorSearchHelpers - getFromCache (con mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar datos del cache si existen', async () => {
    const cachedData = [
      { nombre: 'Cached', apellido: 'Author' }
    ];
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedData));

    const result = await getFromCache('test:key');

    expect(result).toEqual(cachedData);
    expect(redis.get).toHaveBeenCalledWith('test:key');
  });

  it('debería retornar null si no hay datos en cache', async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    const result = await getFromCache('test:key');

    expect(result).toBeNull();
  });

  it('debería retornar null si redis no está disponible', async () => {
    // Simulate redis being null
    const originalRedis = redis;
    (redis as any) = null;

    const result = await getFromCache('test:key');

    expect(result).toBeNull();
    
    // Restore redis
    (redis as any) = originalRedis;
  });

  it('debería manejar errores de cache y retornar null', async () => {
    vi.mocked(redis.get).mockRejectedValue(new Error('Cache error'));

    const result = await getFromCache('test:key');

    expect(result).toBeNull();
  });

  it('debería parsear correctamente JSON del cache', async () => {
    const complexData = [
      { id: 1, nombre: 'Test', data: { nested: true } }
    ];
    vi.mocked(redis.get).mockResolvedValue(JSON.stringify(complexData));

    const result = await getFromCache('test:key');

    expect(result).toEqual(complexData);
    expect(result![0].data.nested).toBe(true);
  });
});

describe('autorSearchHelpers - saveToCache (con mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería guardar datos en cache con TTL', async () => {
    const dataToCache = [
      { nombre: 'Test', apellido: 'Author' }
    ];
    vi.mocked(redis.setex).mockResolvedValue('OK');

    await saveToCache('test:key', dataToCache);

    expect(redis.setex).toHaveBeenCalledWith(
      'test:key',
      300, // CACHE_TTL
      JSON.stringify(dataToCache)
    );
  });

  it('debería serializar datos complejos correctamente', async () => {
    const complexData = [
      { id: 1, data: { nested: { deep: true } } }
    ];
    vi.mocked(redis.setex).mockResolvedValue('OK');

    await saveToCache('test:key', complexData);

    const serializedData = JSON.stringify(complexData);
    expect(redis.setex).toHaveBeenCalledWith(
      'test:key',
      300,
      serializedData
    );
  });

  it('debería no hacer nada si redis no está disponible', async () => {
    const originalRedis = redis;
    (redis as any) = null;

    await saveToCache('test:key', [{ test: 'data' }]);

    // No debe lanzar error
    expect(true).toBe(true);
    
    (redis as any) = originalRedis;
  });

  it('debería manejar errores al guardar en cache', async () => {
    vi.mocked(redis.setex).mockRejectedValue(new Error('Cache error'));

    // No debe lanzar error
    await saveToCache('test:key', [{ test: 'data' }]);

    expect(true).toBe(true);
  });
});
