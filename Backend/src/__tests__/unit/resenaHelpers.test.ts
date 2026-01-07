// src/__tests__/unit/resenaHelpers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EntityManager } from '@mikro-orm/mysql';
import {
  buildResenaWhereClause,
  isUserAdmin,
  agregarContadoresReacciones,
  procesarResenasConContadores,
  serializarResenaModeracion,
  serializarResenaCompleta,
  ordenarRespuestasPorFecha,
  filtrarYOrdenarResenasTopLevel,
  paginarResenas,
} from '../../utils/resenaHelpers';
import { EstadoResena } from '../../entities/resena.entity';
import { RolUsuario } from '../../entities/usuario.entity';
import type { Resena } from '../../entities/resena.entity';
import type { Usuario } from '../../entities/usuario.entity';

describe('resenaHelpers - buildResenaWhereClause (función pura)', () => {
  it('debería construir where clause básico sin filtros', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ em: mockEM });

    expect(result).toEqual({
      deletedAt: null,
      estado: EstadoResena.APPROVED,
    });
  });

  it('debería filtrar por libroId numérico', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      libroId: '123', 
      em: mockEM 
    });

    expect(result.libro).toEqual({
      $or: [{ id: 123 }, { externalId: '123' }]
    });
    expect(result.deletedAt).toBeNull();
  });

  it('debería filtrar por libroId string (externalId)', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      libroId: 'abc123xyz', 
      em: mockEM 
    });

    expect(result.libro).toEqual({ externalId: 'abc123xyz' });
  });

  it('debería filtrar por usuarioId', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      usuarioId: '456', 
      em: mockEM 
    });

    expect(result.usuario).toBe(456);
  });

  it('debería filtrar por estado pendiente (incluye PENDING y FLAGGED)', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'pendiente', 
      em: mockEM 
    });

    expect(result.estado).toEqual({
      $in: [EstadoResena.PENDING, EstadoResena.FLAGGED]
    });
  });

  it('debería filtrar por estado pending (inglés)', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'pending', 
      em: mockEM 
    });

    expect(result.estado).toEqual({
      $in: [EstadoResena.PENDING, EstadoResena.FLAGGED]
    });
  });

  it('debería filtrar por estado aprobada', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'aprobada', 
      em: mockEM 
    });

    expect(result.estado).toBe(EstadoResena.APPROVED);
  });

  it('debería filtrar por estado approved (inglés)', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'approved', 
      em: mockEM 
    });

    expect(result.estado).toBe(EstadoResena.APPROVED);
  });

  it('debería filtrar por estado rechazada', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'rechazada', 
      em: mockEM 
    });

    expect(result.estado).toBe(EstadoResena.REJECTED);
  });

  it('debería filtrar por estado rejected (inglés)', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'rejected', 
      em: mockEM 
    });

    expect(result.estado).toBe(EstadoResena.REJECTED);
  });

  it('debería filtrar por estado flagged', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      estado: 'flagged', 
      em: mockEM 
    });

    expect(result.estado).toBe(EstadoResena.FLAGGED);
  });

  it('debería excluir FLAGGED cuando hay libroId sin estado', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      libroId: '123', 
      em: mockEM 
    });

    expect(result.estado).toEqual({
      $nin: [EstadoResena.FLAGGED]
    });
  });

  it('debería mostrar solo aprobadas para usuario no autenticado', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ em: mockEM });

    expect(result.estado).toBe(EstadoResena.APPROVED);
  });

  it('debería combinar filtros: libroId + usuarioId', () => {
    const mockEM = {} as EntityManager;
    const result = buildResenaWhereClause({ 
      libroId: '100', 
      usuarioId: '50',
      em: mockEM 
    });

    expect(result.libro).toBeDefined();
    expect(result.usuario).toBe(50);
  });
});

describe('resenaHelpers - isUserAdmin (con mock)', () => {
  it('debería retornar true si usuario es admin', async () => {
    const mockUsuario = {
      id: 1,
      rol: RolUsuario.ADMIN,
    } as Usuario;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockUsuario),
    } as unknown as EntityManager;

    const result = await isUserAdmin(1, mockEM);

    expect(result).toBe(true);
    expect(mockEM.findOne).toHaveBeenCalledWith(expect.anything(), { id: 1 });
  });

  it('debería retornar false si usuario no es admin', async () => {
    const mockUsuario = {
      id: 2,
      rol: RolUsuario.USUARIO,
    } as Usuario;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockUsuario),
    } as unknown as EntityManager;

    const result = await isUserAdmin(2, mockEM);

    expect(result).toBe(false);
  });

  it('debería retornar false si usuario no existe', async () => {
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
    } as unknown as EntityManager;

    const result = await isUserAdmin(999, mockEM);

    expect(result).toBe(false);
  });
});

describe('resenaHelpers - agregarContadoresReacciones (función pura)', () => {
  it('debería agregar contadores de reacciones correctamente', () => {
    const mockResena = {
      id: 1,
      reacciones: {
        getItems: () => [
          { tipo: 'like' },
          { tipo: 'like' },
          { tipo: 'dislike' },
          { tipo: 'corazon' },
          { tipo: 'like' },
        ]
      }
    } as any;

    agregarContadoresReacciones(mockResena);

    expect(mockResena.reaccionesCount).toEqual({
      likes: 3,
      dislikes: 1,
      corazones: 1,
      total: 5
    });
  });

  it('debería manejar reseña sin reacciones', () => {
    const mockResena = {
      id: 2,
      reacciones: {
        getItems: () => []
      }
    } as any;

    agregarContadoresReacciones(mockResena);

    expect(mockResena.reaccionesCount).toEqual({
      likes: 0,
      dislikes: 0,
      corazones: 0,
      total: 0
    });
  });

  it('debería contar solo corazones', () => {
    const mockResena = {
      id: 3,
      reacciones: {
        getItems: () => [
          { tipo: 'corazon' },
          { tipo: 'corazon' },
        ]
      }
    } as any;

    agregarContadoresReacciones(mockResena);

    expect(mockResena.reaccionesCount).toEqual({
      likes: 0,
      dislikes: 0,
      corazones: 2,
      total: 2
    });
  });
});

describe('resenaHelpers - procesarResenasConContadores (función pura)', () => {
  it('debería procesar múltiples reseñas con contadores', () => {
    const mockResenas = [
      {
        id: 1,
        reacciones: { getItems: () => [{ tipo: 'like' }] },
        respuestas: { getItems: () => [] }
      },
      {
        id: 2,
        reacciones: { getItems: () => [{ tipo: 'dislike' }, { tipo: 'like' }] },
        respuestas: { getItems: () => [] }
      }
    ] as any[];

    procesarResenasConContadores(mockResenas);

    expect(mockResenas[0].reaccionesCount.total).toBe(1);
    expect(mockResenas[1].reaccionesCount.total).toBe(2);
  });

  it('debería procesar reseñas con respuestas', () => {
    const mockRespuesta: any = {
      id: 10,
      reacciones: { getItems: () => [{ tipo: 'corazon' }] }
    };

    const mockResenas = [
      {
        id: 1,
        reacciones: { getItems: () => [{ tipo: 'like' }] },
        respuestas: { getItems: () => [mockRespuesta] }
      }
    ] as any[];

    procesarResenasConContadores(mockResenas);

    expect(mockResenas[0].reaccionesCount.likes).toBe(1);
    expect((mockRespuesta as any).reaccionesCount.corazones).toBe(1);
  });

  it('debería manejar array vacío', () => {
    const mockResenas: any[] = [];
    
    expect(() => procesarResenasConContadores(mockResenas)).not.toThrow();
  });
});

describe('resenaHelpers - serializarResenaModeracion (función pura)', () => {
  it('debería serializar reseña para moderación completa', () => {
    const mockResena = {
      id: 1,
      comentario: 'Excelente libro',
      estrellas: 5,
      estado: EstadoResena.PENDING,
      fechaResena: new Date('2025-01-01'),
      moderationScore: 0.85,
      moderationReasons: ['positive_sentiment'],
      autoModerated: true,
      usuario: {
        id: 10,
        nombre: 'Juan Pérez',
        username: 'juanp',
        email: 'juan@email.com'
      },
      libro: {
        id: 100,
        nombre: '1984',
        externalId: 'abc123',
      }
    } as any;

    const result = serializarResenaModeracion(mockResena);

    expect(result).toEqual({
      id: 1,
      comentario: 'Excelente libro',
      estrellas: 5,
      estado: EstadoResena.PENDING,
      fechaResena: new Date('2025-01-01'),
      moderationScore: 0.85,
      moderationReasons: ['positive_sentiment'],
      autoModerated: true,
      usuario: {
        id: 10,
        nombre: 'Juan Pérez',
        username: 'juanp',
        email: 'juan@email.com'
      },
      libro: {
        id: 100,
        nombre: '1984',
        externalId: 'abc123',
        slug: 'abc123'
      }
    });
  });

  it('debería manejar reseña sin libro', () => {
    const mockResena = {
      id: 2,
      comentario: 'Sin libro',
      estrellas: 3,
      estado: EstadoResena.FLAGGED,
      fechaResena: new Date('2025-01-02'),
      usuario: {
        id: 20,
        nombre: 'María',
        username: 'mariag',
        email: 'maria@email.com'
      },
      libro: null
    } as any;

    const result = serializarResenaModeracion(mockResena);

    expect(result.libro).toBeNull();
  });
});

describe('resenaHelpers - paginarResenas (función pura)', () => {
  it('debería paginar correctamente primera página', () => {
    const mockResenas = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })) as Resena[];

    const result = paginarResenas(mockResenas, 1, 10);

    expect(result).toHaveLength(10);
    expect(result[0].id).toBe(1);
    expect(result[9].id).toBe(10);
  });

  it('debería paginar correctamente segunda página', () => {
    const mockResenas = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })) as Resena[];

    const result = paginarResenas(mockResenas, 2, 10);

    expect(result).toHaveLength(10);
    expect(result[0].id).toBe(11);
    expect(result[9].id).toBe(20);
  });

  it('debería retornar array vacío si página excede total', () => {
    const mockResenas = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })) as Resena[];

    const result = paginarResenas(mockResenas, 3, 10);

    expect(result).toHaveLength(0);
  });

  it('debería manejar última página incompleta', () => {
    const mockResenas = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })) as Resena[];

    const result = paginarResenas(mockResenas, 3, 10);

    expect(result).toHaveLength(5);
    expect(result[0].id).toBe(21);
  });

  it('debería manejar límite de 1 elemento', () => {
    const mockResenas = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })) as Resena[];

    const result = paginarResenas(mockResenas, 5, 1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });
});

describe('resenaHelpers - filtrarYOrdenarResenasTopLevel (función pura)', () => {
  it('debería filtrar solo reseñas sin padre', () => {
    const mockResenas = [
      { id: 1, resenaPadre: null, createdAt: new Date('2025-01-01'), respuestas: { isInitialized: () => false } },
      { id: 2, resenaPadre: { id: 1 }, createdAt: new Date('2025-01-02'), respuestas: { isInitialized: () => false } },
      { id: 3, resenaPadre: null, createdAt: new Date('2025-01-03'), respuestas: { isInitialized: () => false } },
    ] as any[];

    const result = filtrarYOrdenarResenasTopLevel(mockResenas);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(3); // Más reciente primero
    expect(result[1].id).toBe(1);
  });

  it('debería ordenar por fecha descendente', () => {
    const mockResenas = [
      { id: 1, resenaPadre: null, createdAt: new Date('2025-01-10'), respuestas: { isInitialized: () => false } },
      { id: 2, resenaPadre: null, createdAt: new Date('2025-01-15'), respuestas: { isInitialized: () => false } },
      { id: 3, resenaPadre: null, createdAt: new Date('2025-01-05'), respuestas: { isInitialized: () => false } },
    ] as any[];

    const result = filtrarYOrdenarResenasTopLevel(mockResenas);

    expect(result[0].id).toBe(2); // 15 de enero (más reciente)
    expect(result[1].id).toBe(1); // 10 de enero
    expect(result[2].id).toBe(3); // 5 de enero
  });

  it('debería manejar array vacío', () => {
    const result = filtrarYOrdenarResenasTopLevel([]);

    expect(result).toEqual([]);
  });

  it('debería retornar vacío si todas son respuestas', () => {
    const mockResenas = [
      { id: 1, resenaPadre: { id: 10 }, createdAt: new Date('2025-01-01'), respuestas: { isInitialized: () => false } },
      { id: 2, resenaPadre: { id: 10 }, createdAt: new Date('2025-01-02'), respuestas: { isInitialized: () => false } },
    ] as any[];

    const result = filtrarYOrdenarResenasTopLevel(mockResenas);

    expect(result).toHaveLength(0);
  });
});
