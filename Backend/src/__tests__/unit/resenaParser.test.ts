/**
 * Tests Unitarios para resenaParser.ts - Fase 5.3
 * Coverage target: 85%+
 * Tests: 6 funciones de parsing para reseñas
 */

import { describe, it, expect } from 'vitest';
import {
  parseResenaInput,
  parseResenaFilters,
  parseResenaUpdateInput,
  buildResenaQuery,
  validateResenaId,
  parseResenaRespuesta
} from '../../utils/resenaParser';

describe('unit - resenaParser.ts', () => {
  
  // ========== parseResenaInput ==========
  describe('parseResenaInput()', () => {
    it('debe parsear input válido correctamente', () => {
      const input = {
        comentario: 'Excelente libro con gran desarrollo de personajes',
        estrellas: 5,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.estrellas).toBe(5);
      expect(result.data?.libroId).toBe(123);
      expect(result.errors).toBeUndefined();
    });

    it('debe rechazar comentario vacío', () => {
      const input = {
        comentario: '',
        estrellas: 4,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContain('El comentario es requerido');
    });

    it('debe rechazar comentario muy corto (<10 chars)', () => {
      const input = {
        comentario: 'Corto',
        estrellas: 3,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('al menos');
    });

    it('debe rechazar comentario muy largo (>5000 chars)', () => {
      const input = {
        comentario: 'a'.repeat(5001),
        estrellas: 3,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar estrellas inválidas', () => {
      const input = {
        comentario: 'Comentario válido con más de 10 caracteres',
        estrellas: 6,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La calificación debe ser un número entre 1 y 5');
    });

    it('debe rechazar libroId faltante', () => {
      const input = {
        comentario: 'Comentario válido con más de 10 caracteres',
        estrellas: 4
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El ID del libro es requerido');
    });

    it('debe sanitizar HTML del comentario', () => {
      const input = {
        comentario: '<script>alert("xss")</script>Comentario válido con más de 10 caracteres',
        estrellas: 4,
        libroId: 123
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).not.toContain('<script>');
    });

    it('debe acumular múltiples errores', () => {
      const input = {
        comentario: 'Corto',
        estrellas: 10
      };
      
      const result = parseResenaInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });
  });

  // ========== parseResenaFilters ==========
  describe('parseResenaFilters()', () => {
    it('debe parsear filtros completos', () => {
      const query = {
        libroId: '123',
        usuarioId: '456',
        estado: 'aprobada',
        page: '2',
        limit: '20'
      };
      
      const result = parseResenaFilters(query);
      expect(result.libroId).toBe('123');
      expect(result.usuarioId).toBe(456);
      expect(result.estado).toBe('aprobada');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('debe usar defaults para paginación', () => {
      const query = {};
      
      const result = parseResenaFilters(query);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('debe ignorar usuarioId inválido', () => {
      const query = {
        usuarioId: 'invalid'
      };
      
      const result = parseResenaFilters(query);
      expect(result.usuarioId).toBeUndefined();
    });

    it('debe parsear solo libroId', () => {
      const query = {
        libroId: 'abc-123'
      };
      
      const result = parseResenaFilters(query);
      expect(result.libroId).toBe('abc-123');
      expect(result.usuarioId).toBeUndefined();
      expect(result.estado).toBeUndefined();
    });

    it('debe corregir límites fuera de rango', () => {
      const query = {
        limit: '200'
      };
      
      const result = parseResenaFilters(query);
      expect(result.limit).toBe(12); // Default porque 200 > 100
    });
  });

  // ========== parseResenaUpdateInput ==========
  describe('parseResenaUpdateInput()', () => {
    it('debe parsear actualización válida de comentario', () => {
      const input = {
        comentario: 'Comentario actualizado con más de 10 caracteres'
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).toBeDefined();
      expect(result.data?.estrellas).toBeUndefined();
    });

    it('debe parsear actualización válida de estrellas', () => {
      const input = {
        estrellas: 4
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.estrellas).toBe(4);
      expect(result.data?.comentario).toBeUndefined();
    });

    it('debe parsear actualización de ambos campos', () => {
      const input = {
        comentario: 'Nuevo comentario con más de 10 caracteres',
        estrellas: 3
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).toBeDefined();
      expect(result.data?.estrellas).toBe(3);
    });

    it('debe rechazar actualización sin campos', () => {
      const input = {};
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debe proporcionar al menos un campo para actualizar');
    });

    it('debe rechazar comentario muy corto en update', () => {
      const input = {
        comentario: 'Corto'
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('al menos');
    });

    it('debe rechazar estrellas inválidas en update', () => {
      const input = {
        estrellas: 0
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La calificación debe ser un número entre 1 y 5');
    });

    it('debe sanitizar HTML en actualización', () => {
      const input = {
        comentario: '<b>Bold</b> comentario válido con más de 10 caracteres'
      };
      
      const result = parseResenaUpdateInput(input);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).not.toContain('<b>');
    });
  });

  // ========== buildResenaQuery ==========
  describe('buildResenaQuery()', () => {
    it('debe construir query básico con deletedAt null', () => {
      const filters = {};
      
      const query = buildResenaQuery(filters);
      expect(query.deletedAt).toBe(null);
      expect(query.estado).toEqual({ $nin: ['flagged'] });
    });

    it('debe construir query con libroId numérico', () => {
      const filters = { libroId: '123' };
      
      const query = buildResenaQuery(filters);
      expect(query.libro).toBeDefined();
      expect(query.libro.$or).toBeDefined();
      expect(query.libro.$or[0].id).toBe(123);
      expect(query.libro.$or[1].externalId).toBe('123');
    });

    it('debe construir query con externalId alfanumérico', () => {
      const filters = { libroId: 'abc-def-123' };
      
      const query = buildResenaQuery(filters);
      expect(query.libro).toEqual({ externalId: 'abc-def-123' });
    });

    it('debe construir query con usuarioId', () => {
      const filters = { usuarioId: 456 };
      
      const query = buildResenaQuery(filters);
      expect(query.usuario).toEqual({ id: 456 });
    });

    it('debe construir query con estado específico', () => {
      const filters = { estado: 'pendiente' };
      
      const query = buildResenaQuery(filters);
      expect(query.estado).toBe('pendiente');
    });

    it('debe combinar múltiples filtros', () => {
      const filters = {
        libroId: '789',
        usuarioId: 101,
        estado: 'aprobada'
      };
      
      const query = buildResenaQuery(filters);
      expect(query.libro).toBeDefined();
      expect(query.usuario).toEqual({ id: 101 });
      expect(query.estado).toBe('aprobada');
      expect(query.deletedAt).toBe(null);
    });
  });

  // ========== validateResenaId ==========
  describe('validateResenaId()', () => {
    it('debe validar ID numérico válido', () => {
      const result = validateResenaId(123);
      expect(result.valid).toBe(true);
      expect(result.id).toBe(123);
      expect(result.error).toBeUndefined();
    });

    it('debe validar ID como string numérico', () => {
      const result = validateResenaId('456');
      expect(result.valid).toBe(true);
      expect(result.id).toBe(456);
    });

    it('debe rechazar ID cero', () => {
      const result = validateResenaId(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de reseña inválido');
    });

    it('debe rechazar ID negativo', () => {
      const result = validateResenaId(-5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de reseña inválido');
    });

    it('debe rechazar ID no numérico', () => {
      const result = validateResenaId('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ID de reseña inválido');
    });

    it('debe rechazar null/undefined', () => {
      expect(validateResenaId(null).valid).toBe(false);
      expect(validateResenaId(undefined).valid).toBe(false);
    });
  });

  // ========== parseResenaRespuesta ==========
  describe('parseResenaRespuesta()', () => {
    it('debe parsear respuesta válida', () => {
      const body = {
        comentario: 'Respuesta válida con más de 10 caracteres',
        libroId: 123
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).toBeDefined();
      expect(result.data?.libroId).toBe(123);
      expect(result.data?.resenaPadreId).toBe(456);
    });

    it('debe rechazar comentario vacío', () => {
      const body = {
        comentario: '',
        libroId: 123
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El comentario es requerido');
    });

    it('debe rechazar comentario muy corto (<10 chars)', () => {
      const body = {
        comentario: 'Corto',
        libroId: 123
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('al menos');
    });

    it('debe rechazar comentario muy largo (>2000 chars)', () => {
      const body = {
        comentario: 'a'.repeat(2001),
        libroId: 123
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('exceder');
    });

    it('debe rechazar libroId faltante', () => {
      const body = {
        comentario: 'Respuesta válida con más de 10 caracteres'
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El ID del libro es requerido');
    });

    it('debe sanitizar HTML', () => {
      const body = {
        comentario: '<div>Respuesta con HTML y más de 10 caracteres</div>',
        libroId: 123
      };
      
      const result = parseResenaRespuesta(body, 456);
      expect(result.valid).toBe(true);
      expect(result.data?.comentario).not.toContain('<div>');
    });

    it('debe incluir resenaPadreId en data', () => {
      const body = {
        comentario: 'Respuesta válida con más de 10 caracteres',
        libroId: 789
      };
      
      const result = parseResenaRespuesta(body, 999);
      expect(result.valid).toBe(true);
      expect(result.data?.resenaPadreId).toBe(999);
    });
  });

});
