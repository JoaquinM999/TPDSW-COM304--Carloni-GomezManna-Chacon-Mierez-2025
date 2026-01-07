/**
 * Tests Unitarios para autorParser.ts - Fase 5.3.3
 * Coverage target: 85%+
 * Tests: 6 funciones de parsing para autores
 */

import { describe, it, expect } from 'vitest';
import {
  parseAutorInput,
  parseAutorFilters,
  parseAutorUpdateInput,
  buildAutorQuery,
  validateAutorId,
  parseExternalAutorData
} from '../../utils/autorParser';

describe('unit - autorParser.ts', () => {

  // ========== parseAutorInput ==========
  describe('parseAutorInput()', () => {
    it('debe parsear input mínimo válido (nombre y apellido)', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García Márquez'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Gabriel');
      expect(result.data?.apellido).toBe('García Márquez');
      expect(result.errors).toBeUndefined();
    });

    it('debe parsear input completo con todos los campos', () => {
      const input = {
        nombre: 'J.R.R.',
        apellido: 'Tolkien',
        biografia: 'Profesor, escritor y filólogo británico',
        foto: 'https://example.com/tolkien.jpg',
        googleBooksId: 'tolkien-123',
        openLibraryKey: 'OL1234A'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('J.R.R.');
      expect(result.data?.apellido).toBe('Tolkien');
      expect(result.data?.biografia).toBeDefined();
      expect(result.data?.foto).toBe('https://example.com/tolkien.jpg');
      expect(result.data?.googleBooksId).toBe('tolkien-123');
      expect(result.data?.openLibraryKey).toBe('OL1234A');
    });

    it('debe rechazar nombre vacío', () => {
      const input = {
        nombre: '',
        apellido: 'García'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del autor es requerido');
    });

    it('debe rechazar apellido vacío', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: ''
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El apellido del autor es requerido');
    });

    it('debe rechazar nombre muy largo (>200 chars)', () => {
      const input = {
        nombre: 'a'.repeat(201),
        apellido: 'García'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar apellido muy largo (>200 chars)', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'a'.repeat(201)
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar biografía muy larga (>10000 chars)', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García',
        biografia: 'a'.repeat(10001)
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar URL de foto inválida', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García',
        foto: 'not-a-url'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La URL de la foto no es válida');
    });

    it('debe rechazar googleBooksId inválido', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García',
        googleBooksId: 'a'.repeat(101) // >100 chars
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El Google Books ID no es válido');
    });

    it('debe rechazar openLibraryKey inválido', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García',
        openLibraryKey: '<script>xss</script>'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El Open Library Key no es válido');
    });

    it('debe sanitizar HTML en nombre, apellido y biografía', () => {
      const input = {
        nombre: '<b>Gabriel</b>',
        apellido: '<script>alert("xss")</script>García',
        biografia: '<div>Biografía con HTML</div>'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).not.toContain('<b>');
      expect(result.data?.apellido).not.toContain('<script>');
      expect(result.data?.biografia).not.toContain('<div>');
    });

    it('debe acumular múltiples errores', () => {
      const input = {
        nombre: '',
        apellido: '',
        foto: 'invalid-url'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });
  });

  // ========== parseAutorFilters ==========
  describe('parseAutorFilters()', () => {
    it('debe parsear filtros completos', () => {
      const query = {
        search: 'Tolkien',
        sortBy: 'apellido',
        page: '2',
        limit: '50'
      };

      const result = parseAutorFilters(query);
      expect(result.search).toBe('Tolkien');
      expect(result.sortBy).toBe('apellido');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('debe usar defaults correctos', () => {
      const query = {};

      const result = parseAutorFilters(query);
      expect(result.sortBy).toBe('nombre');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('debe ignorar búsqueda muy corta (<2 chars)', () => {
      const query = {
        search: 'a'
      };

      const result = parseAutorFilters(query);
      expect(result.search).toBeUndefined();
    });

    it('debe validar sortBy con valores permitidos', () => {
      const validSorts = ['nombre', 'apellido', 'createdAt'];

      validSorts.forEach(sortBy => {
        const query = { sortBy };
        const result = parseAutorFilters(query);
        expect(result.sortBy).toBe(sortBy);
      });
    });

    it('debe ignorar sortBy inválido y usar default', () => {
      const query = {
        sortBy: 'invalid'
      };

      const result = parseAutorFilters(query);
      expect(result.sortBy).toBe('nombre');
    });

    it('debe limitar máximo de resultados a 100', () => {
      const query = {
        limit: '150'
      };

      const result = parseAutorFilters(query);
      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('debe sanitizar término de búsqueda', () => {
      const query = {
        search: '<script>xss</script>Tolkien'
      };

      const result = parseAutorFilters(query);
      expect(result.search).not.toContain('<script>');
    });
  });

  // ========== parseAutorUpdateInput ==========
  describe('parseAutorUpdateInput()', () => {
    it('debe parsear actualización válida de nombre', () => {
      const input = {
        nombre: 'John Ronald Reuel'
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('John Ronald Reuel');
    });

    it('debe parsear actualización completa', () => {
      const input = {
        nombre: 'J.R.R.',
        apellido: 'Tolkien',
        biografia: 'Nueva biografía',
        foto: 'https://example.com/new.jpg',
        googleBooksId: 'new-id',
        openLibraryKey: 'OL9999A'
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('J.R.R.');
      expect(result.data?.apellido).toBe('Tolkien');
      expect(result.data?.googleBooksId).toBe('new-id');
    });

    it('debe rechazar actualización sin campos', () => {
      const input = {};

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No se proporcionaron datos para actualizar');
    });

    it('debe rechazar nombre vacío', () => {
      const input = {
        nombre: ''
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del autor no puede estar vacío');
    });

    it('debe rechazar apellido vacío', () => {
      const input = {
        apellido: ''
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El apellido del autor no puede estar vacío');
    });

    it('debe rechazar biografía muy larga en update', () => {
      const input = {
        biografia: 'a'.repeat(10001)
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar foto inválida en update', () => {
      const input = {
        foto: 'not-a-url'
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La URL de la foto no es válida');
    });

    it('debe permitir establecer campos a null', () => {
      const input = {
        biografia: null,
        foto: null,
        googleBooksId: null,
        openLibraryKey: null
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.biografia).toBe(null);
      expect(result.data?.foto).toBe(null);
      expect(result.data?.googleBooksId).toBe(null);
      expect(result.data?.openLibraryKey).toBe(null);
    });

    it('debe sanitizar HTML en updates', () => {
      const input = {
        nombre: '<b>Nombre</b> con HTML',
        apellido: '<i>Apellido</i> con HTML',
        biografia: '<script>xss</script>Biografía'
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).not.toContain('<b>');
      expect(result.data?.apellido).not.toContain('<i>');
      expect(result.data?.biografia).not.toContain('<script>');
    });

    it('debe rechazar external IDs inválidos en update', () => {
      const input = {
        googleBooksId: 'a'.repeat(101)
      };

      const result = parseAutorUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El Google Books ID no es válido');
    });
  });

  // ========== buildAutorQuery ==========
  describe('buildAutorQuery()', () => {
    it('debe construir query vacío por defecto', () => {
      const filters = {
        sortBy: 'nombre' as const,
        page: 1,
        limit: 12
      };

      const query = buildAutorQuery(filters);
      expect(query).toEqual({});
    });

    it('debe construir query con búsqueda por texto', () => {
      const filters = {
        search: 'Tolkien',
        sortBy: 'nombre' as const,
        page: 1,
        limit: 12
      };

      const query = buildAutorQuery(filters);
      expect(query.$or).toBeDefined();
      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].nombre).toEqual({ $like: '%Tolkien%' });
      expect(query.$or[1].apellido).toEqual({ $like: '%Tolkien%' });
    });

    it('debe buscar en nombre y apellido con $or', () => {
      const filters = {
        search: 'García',
        sortBy: 'apellido' as const,
        page: 1,
        limit: 12
      };

      const query = buildAutorQuery(filters);
      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].nombre.$like).toBe('%García%');
      expect(query.$or[1].apellido.$like).toBe('%García%');
    });
  });

  // ========== validateAutorId ==========
  describe('validateAutorId()', () => {
    it('debe validar ID numérico válido', () => {
      const result = validateAutorId(123);
      expect(result.valid).toBe(true);
      expect(result.id).toBe(123);
      expect(result.error).toBeUndefined();
    });

    it('debe validar ID como string numérico', () => {
      const result = validateAutorId('456');
      expect(result.valid).toBe(true);
      expect(result.id).toBe(456);
    });

    it('debe rechazar ID cero', () => {
      const result = validateAutorId(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de autor inválido');
    });

    it('debe rechazar ID negativo', () => {
      const result = validateAutorId(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de autor inválido');
    });

    it('debe rechazar ID no numérico', () => {
      const result = validateAutorId('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de autor inválido');
    });

    it('debe rechazar null/undefined', () => {
      expect(validateAutorId(null).valid).toBe(false);
      expect(validateAutorId(undefined).valid).toBe(false);
    });
  });

  // ========== parseExternalAutorData ==========
  describe('parseExternalAutorData()', () => {
    it('debe parsear autor con nombre completo en campo "name"', () => {
      const data = {
        name: 'J.R.R. Tolkien'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('J.R.R.');
      expect(result.data?.apellido).toBe('Tolkien');
    });

    it('debe parsear autor con un solo nombre', () => {
      const data = {
        name: 'Platón'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Platón');
      expect(result.data?.apellido).toBe('Platón');
    });

    it('debe parsear autor con campos nombre y apellido separados', () => {
      const data = {
        nombre: 'Gabriel',
        apellido: 'García Márquez'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Gabriel');
      expect(result.data?.apellido).toBe('García Márquez');
    });

    it('debe parsear campos opcionales con nombres alternativos', () => {
      const data = {
        name: 'Stephen King',
        bio: 'Escritor estadounidense de terror',
        photo: 'https://example.com/king.jpg',
        googleBooksId: 'king-123',
        openLibraryKey: 'OL5678A'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.biografia).toBeDefined();
      expect(result.data?.foto).toBe('https://example.com/king.jpg');
      expect(result.data?.googleBooksId).toBe('king-123');
      expect(result.data?.openLibraryKey).toBe('OL5678A');
    });

    it('debe usar campo "description" como biografía alternativa', () => {
      const data = {
        name: 'Isaac Asimov',
        description: 'Autor de ciencia ficción'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.biografia).toBe('Autor de ciencia ficción');
    });

    it('debe usar campo "image" como foto alternativa', () => {
      const data = {
        name: 'Arthur C. Clarke',
        image: 'https://example.com/clarke.jpg'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.foto).toBe('https://example.com/clarke.jpg');
    });

    it('debe rechazar datos sin nombre válido', () => {
      const data = {
        biografia: 'Biografía sin nombre'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No se pudo extraer nombre y apellido del autor externo');
    });

    it('debe truncar biografía muy larga a 10000 chars', () => {
      const data = {
        name: 'Test Author',
        bio: 'a'.repeat(15000)
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.biografia?.length).toBe(10000);
    });

    it('debe ignorar URL de foto inválida', () => {
      const data = {
        name: 'Test Author',
        photo: 'not-a-url'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.foto).toBeUndefined();
    });

    it('debe sanitizar HTML en campos externos', () => {
      const data = {
        name: '<b>Test</b> <script>xss</script>Author',
        bio: '<div>Biografía con HTML</div>'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).not.toContain('<b>');
      expect(result.data?.apellido).not.toContain('<script>');
      expect(result.data?.biografia).not.toContain('<div>');
    });

    it('debe parsear nombre con múltiples partes (3+ palabras)', () => {
      const data = {
        name: 'Jorge Luis Borges Acevedo'
      };

      const result = parseExternalAutorData(data);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Jorge');
      expect(result.data?.apellido).toBe('Luis Borges Acevedo');
    });
  });

});
