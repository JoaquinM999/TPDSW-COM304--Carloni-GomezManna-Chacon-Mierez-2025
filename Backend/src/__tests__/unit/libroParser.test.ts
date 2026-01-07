/**
 * Tests Unitarios para libroParser.ts - Fase 5.3.2
 * Coverage target: 85%+
 * Tests: 6 funciones de parsing para libros
 */

import { describe, it, expect } from 'vitest';
import {
  parseLibroInput,
  parseLibroFilters,
  parseLibroUpdateInput,
  buildLibroQuery,
  validateLibroId,
  parseLibroSearchParams
} from '../../utils/libroParser';

describe('unit - libroParser.ts', () => {

  // ========== parseLibroInput ==========
  describe('parseLibroInput()', () => {
    it('debe parsear input mínimo válido (solo nombre)', () => {
      const input = {
        nombre: 'El Señor de los Anillos'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('El Señor de los Anillos');
      expect(result.errors).toBeUndefined();
    });

    it('debe parsear input completo con todos los campos', () => {
      const input = {
        nombre: 'Harry Potter y la Piedra Filosofal',
        isbn: '978-84-7888-636-1',
        anio_publicacion: 1997,
        descripcion: 'Primera entrega de la saga de Harry Potter',
        imagen: 'https://example.com/hp1.jpg',
        paginas: 256,
        editorial: 1,
        autor: 2,
        categoria: 3,
        saga: 4,
        external_id: 'hp-1'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Harry Potter y la Piedra Filosofal');
      expect(result.data?.isbn).toBe('9788478886361'); // Sin guiones
      expect(result.data?.anio_publicacion).toBe(1997);
      expect(result.data?.paginas).toBe(256);
      expect(result.data?.editorial).toBe(1);
    });

    it('debe rechazar nombre vacío', () => {
      const input = {
        nombre: ''
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del libro es requerido');
    });

    it('debe rechazar nombre muy largo (>500 chars)', () => {
      const input = {
        nombre: 'a'.repeat(501)
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar ISBN inválido', () => {
      const input = {
        nombre: 'Libro de prueba',
        isbn: '123-invalid'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El ISBN proporcionado no es válido');
    });

    it('debe rechazar año de publicación inválido', () => {
      const input = {
        nombre: 'Libro de prueba',
        anio_publicacion: 3000
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El año de publicación no es válido');
    });

    it('debe rechazar descripción muy larga (>5000 chars)', () => {
      const input = {
        nombre: 'Libro de prueba',
        descripcion: 'a'.repeat(5001)
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar URL de imagen inválida', () => {
      const input = {
        nombre: 'Libro de prueba',
        imagen: 'not-a-url'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La URL de la imagen no es válida');
    });

    it('debe rechazar número de páginas fuera de rango', () => {
      const input1 = {
        nombre: 'Libro de prueba',
        paginas: 0
      };

      const input2 = {
        nombre: 'Libro de prueba',
        paginas: 10001
      };

      expect(parseLibroInput(input1).valid).toBe(false);
      expect(parseLibroInput(input2).valid).toBe(false);
      expect(parseLibroInput(input1).errors).toContain('El número de páginas debe estar entre 1 y 10000');
    });

    it('debe sanitizar HTML en nombre y descripción', () => {
      const input = {
        nombre: '<script>alert("xss")</script>El Hobbit',
        descripcion: '<b>Descripción</b> con HTML'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).not.toContain('<script>');
      expect(result.data?.descripcion).not.toContain('<b>');
    });

    it('debe acumular múltiples errores', () => {
      const input = {
        nombre: '',
        isbn: 'invalid',
        anio_publicacion: 5000
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });

    it('debe normalizar ISBN (eliminar guiones y espacios)', () => {
      const input = {
        nombre: 'Libro de prueba',
        isbn: '978-0-596-52068-7'
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.isbn).toBe('9780596520687');
    });
  });

  // ========== parseLibroFilters ==========
  describe('parseLibroFilters()', () => {
    it('debe parsear filtros completos', () => {
      const query = {
        search: 'Harry Potter',
        autor: '123',
        categoria: '456',
        saga: '789',
        minRating: '4',
        page: '2',
        limit: '20'
      };

      const result = parseLibroFilters(query);
      expect(result.search).toBe('Harry Potter');
      expect(result.autorId).toBe(123);
      expect(result.categoriaId).toBe(456);
      expect(result.sagaId).toBe(789);
      expect(result.minRating).toBe(4);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('debe usar defaults de paginación', () => {
      const query = {};

      const result = parseLibroFilters(query);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('debe ignorar IDs inválidos', () => {
      const query = {
        autor: 'invalid',
        categoria: 'abc',
        saga: 'xyz'
      };

      const result = parseLibroFilters(query);
      expect(result.autorId).toBeUndefined();
      expect(result.categoriaId).toBeUndefined();
      expect(result.sagaId).toBeUndefined();
    });

    it('debe aceptar autorId como alternativa a autor', () => {
      const query1 = { autor: '123' };
      const query2 = { autorId: '456' };

      expect(parseLibroFilters(query1).autorId).toBe(123);
      expect(parseLibroFilters(query2).autorId).toBe(456);
    });

    it('debe ignorar minRating fuera de rango', () => {
      const query1 = { minRating: '0' };
      const query2 = { minRating: '6' };

      expect(parseLibroFilters(query1).minRating).toBeUndefined();
      expect(parseLibroFilters(query2).minRating).toBeUndefined();
    });

    it('debe sanitizar término de búsqueda', () => {
      const query = {
        search: '<script>xss</script>Harry Potter'
      };

      const result = parseLibroFilters(query);
      expect(result.search).not.toContain('<script>');
    });

    it('debe parsear solo filtro de búsqueda', () => {
      const query = {
        search: '1984'
      };

      const result = parseLibroFilters(query);
      expect(result.search).toBe('1984');
      expect(result.autorId).toBeUndefined();
      expect(result.categoriaId).toBeUndefined();
    });
  });

  // ========== parseLibroUpdateInput ==========
  describe('parseLibroUpdateInput()', () => {
    it('debe parsear actualización válida de nombre', () => {
      const input = {
        nombre: 'Nuevo título del libro'
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Nuevo título del libro');
    });

    it('debe parsear actualización completa', () => {
      const input = {
        nombre: 'Título actualizado',
        isbn: '978-84-7888-636-1',
        anio_publicacion: 2020,
        descripcion: 'Nueva descripción',
        imagen: 'https://example.com/new.jpg',
        paginas: 350
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).toBe('Título actualizado');
      expect(result.data?.isbn).toBe('9788478886361');
      expect(result.data?.paginas).toBe(350);
    });

    it('debe rechazar actualización sin campos', () => {
      const input = {};

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No se proporcionaron datos para actualizar');
    });

    it('debe rechazar nombre vacío', () => {
      const input = {
        nombre: ''
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del libro no puede estar vacío');
    });

    it('debe rechazar ISBN inválido en update', () => {
      const input = {
        isbn: '123-invalid'
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El ISBN proporcionado no es válido');
    });

    it('debe rechazar año inválido en update', () => {
      const input = {
        anio_publicacion: 3000
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El año de publicación no es válido');
    });

    it('debe permitir establecer campos a null', () => {
      const input = {
        descripcion: null,
        imagen: null,
        paginas: null
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.descripcion).toBe(null);
      expect(result.data?.imagen).toBe(null);
      expect(result.data?.paginas).toBe(null);
    });

    it('debe sanitizar HTML en updates', () => {
      const input = {
        nombre: '<b>Título</b> con HTML',
        descripcion: '<script>xss</script>Descripción'
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.nombre).not.toContain('<b>');
      expect(result.data?.descripcion).not.toContain('<script>');
    });

    it('debe actualizar relaciones', () => {
      const input = {
        editorial: 5,
        autor: 10,
        categoria: 15,
        saga: 20
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.editorial).toBe(5);
      expect(result.data?.autor).toBe(10);
    });

    it('debe normalizar ISBN en updates', () => {
      const input = {
        isbn: '978 0 596 52068 7'
      };

      const result = parseLibroUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.isbn).toBe('9780596520687');
    });
  });

  // ========== buildLibroQuery ==========
  describe('buildLibroQuery()', () => {
    it('debe construir query vacío por defecto', () => {
      const filters = {
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query).toEqual({});
    });

    it('debe construir query con búsqueda por texto', () => {
      const filters = {
        search: 'Harry Potter',
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query.nombre).toEqual({ $like: '%Harry Potter%' });
    });

    it('debe construir query con filtro de autor', () => {
      const filters = {
        autorId: 123,
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query.autor).toBe(123);
    });

    it('debe construir query con filtro de categoría', () => {
      const filters = {
        categoriaId: 456,
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query.categoria).toBe(456);
    });

    it('debe construir query con filtro de saga', () => {
      const filters = {
        sagaId: 789,
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query.saga).toBe(789);
    });

    it('debe combinar múltiples filtros', () => {
      const filters = {
        search: '1984',
        autorId: 123,
        categoriaId: 456,
        sagaId: 789,
        page: 1,
        limit: 12
      };

      const query = buildLibroQuery(filters);
      expect(query.nombre).toEqual({ $like: '%1984%' });
      expect(query.autor).toBe(123);
      expect(query.categoria).toBe(456);
      expect(query.saga).toBe(789);
    });
  });

  // ========== validateLibroId ==========
  describe('validateLibroId()', () => {
    it('debe validar ID numérico válido', () => {
      const result = validateLibroId(123);
      expect(result.valid).toBe(true);
      expect(result.id).toBe(123);
      expect(result.error).toBeUndefined();
    });

    it('debe validar ID como string numérico', () => {
      const result = validateLibroId('456');
      expect(result.valid).toBe(true);
      expect(result.id).toBe(456);
    });

    it('debe rechazar ID cero', () => {
      const result = validateLibroId(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de libro inválido');
    });

    it('debe rechazar ID negativo', () => {
      const result = validateLibroId(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de libro inválido');
    });

    it('debe rechazar ID no numérico', () => {
      const result = validateLibroId('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de libro inválido');
    });

    it('debe rechazar null/undefined', () => {
      expect(validateLibroId(null).valid).toBe(false);
      expect(validateLibroId(undefined).valid).toBe(false);
    });
  });

  // ========== parseLibroSearchParams ==========
  describe('parseLibroSearchParams()', () => {
    it('debe parsear parámetros básicos', () => {
      const query = {
        page: '1',
        limit: '12'
      };

      const result = parseLibroSearchParams(query);
      expect(result.filters.page).toBe(1);
      expect(result.filters.limit).toBe(12);
      expect(result.searchBy).toBeUndefined();
      expect(result.searchTerm).toBeUndefined();
    });

    it('debe parsear tipo de búsqueda válido', () => {
      const query = {
        searchBy: 'titulo',
        searchTerm: 'Harry Potter'
      };

      const result = parseLibroSearchParams(query);
      expect(result.searchBy).toBe('titulo');
      expect(result.searchTerm).toBe('Harry Potter');
    });

    it('debe ignorar tipo de búsqueda inválido', () => {
      const query = {
        searchBy: 'invalid',
        searchTerm: 'Test'
      };

      const result = parseLibroSearchParams(query);
      expect(result.searchBy).toBeUndefined();
    });

    it('debe parsear todos los tipos de búsqueda válidos', () => {
      const types = ['titulo', 'autor', 'isbn', 'categoria'];

      types.forEach(type => {
        const query = { searchBy: type, searchTerm: 'Test' };
        const result = parseLibroSearchParams(query);
        expect(result.searchBy).toBe(type);
      });
    });

    it('debe sanitizar término de búsqueda', () => {
      const query = {
        searchBy: 'titulo',
        searchTerm: '<script>xss</script>Test'
      };

      const result = parseLibroSearchParams(query);
      expect(result.searchTerm).not.toContain('<script>');
    });

    it('debe combinar búsqueda avanzada con filtros', () => {
      const query = {
        searchBy: 'autor',
        searchTerm: 'Tolkien',
        categoria: '5',
        saga: '10',
        page: '2',
        limit: '20'
      };

      const result = parseLibroSearchParams(query);
      expect(result.searchBy).toBe('autor');
      expect(result.searchTerm).toBe('Tolkien');
      expect(result.filters.categoriaId).toBe(5);
      expect(result.filters.sagaId).toBe(10);
      expect(result.filters.page).toBe(2);
      expect(result.filters.limit).toBe(20);
    });
  });

});
