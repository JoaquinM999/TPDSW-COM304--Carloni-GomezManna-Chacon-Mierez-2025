// src/__tests__/unit/resenaPopulateHelpers.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { EntityManager, FilterQuery } from '@mikro-orm/mysql';
import {
  getPopulateConfig,
  determinePopulateStrategy,
  findResenasWithStrategy,
  findResenaByIdWithStrategy,
  findResenasMinimal,
  findResenasWithReactions,
  findResenasWithReplies,
  findResenasComplete,
  findResenasForModeration,
  getStrategyStats,
  logPopulateStats,
  type PopulateStrategy,
} from '../../utils/resenaPopulateHelpers';
import type { Resena } from '../../entities/resena.entity';

describe('resenaPopulateHelpers - getPopulateConfig (función pura)', () => {
  it('debería retornar configuración minimal', () => {
    const result = getPopulateConfig('minimal');

    expect(result).toEqual(['usuario', 'libro', 'libro.autor']);
  });

  it('debería retornar configuración with-reactions', () => {
    const result = getPopulateConfig('with-reactions');

    expect(result).toEqual([
      'usuario',
      'libro',
      'libro.autor',
      'reacciones',
      'reacciones.usuario'
    ]);
  });

  it('debería retornar configuración with-replies', () => {
    const result = getPopulateConfig('with-replies');

    expect(result).toEqual([
      'usuario',
      'libro',
      'libro.autor',
      'respuestas',
      'respuestas.usuario',
      'respuestas.reacciones'
    ]);
  });

  it('debería retornar configuración complete', () => {
    const result = getPopulateConfig('complete');

    expect(result).toHaveLength(11);
    expect(result).toContain('usuario');
    expect(result).toContain('libro');
    expect(result).toContain('reacciones');
    expect(result).toContain('respuestas.usuario');
    expect(result).toContain('respuestas.respuestas.usuario');
  });

  it('debería retornar configuración moderation', () => {
    const result = getPopulateConfig('moderation');

    expect(result).toEqual([
      'usuario',
      'libro',
      'libro.autor',
      'reacciones'
    ]);
  });

  it('debería retornar minimal por defecto si estrategia inválida', () => {
    const result = getPopulateConfig('invalid' as PopulateStrategy);

    expect(result).toEqual(['usuario', 'libro', 'libro.autor']);
  });
});

describe('resenaPopulateHelpers - determinePopulateStrategy (función pura)', () => {
  it('debería retornar moderation si estado es PENDING', () => {
    const query = { estado: 'PENDING' };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('moderation');
  });

  it('debería retornar complete si includeReplies e includeReactions son true', () => {
    const query = {
      includeReplies: 'true',
      includeReactions: 'true'
    };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('complete');
  });

  it('debería retornar with-replies si solo includeReplies es true', () => {
    const query = { includeReplies: 'true' };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('with-replies');
  });

  it('debería retornar with-reactions si solo includeReactions es true', () => {
    const query = { includeReactions: 'true' };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('with-reactions');
  });

  it('debería retornar minimal por defecto', () => {
    const query = {};

    const result = determinePopulateStrategy(query);

    expect(result).toBe('minimal');
  });

  it('debería retornar minimal si flags son false', () => {
    const query = {
      includeReplies: 'false',
      includeReactions: 'false'
    };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('minimal');
  });

  it('debería priorizar estado PENDING sobre otros flags', () => {
    const query = {
      estado: 'PENDING',
      includeReplies: 'true',
      includeReactions: 'true'
    };

    const result = determinePopulateStrategy(query);

    expect(result).toBe('moderation');
  });
});

describe('resenaPopulateHelpers - findResenasWithStrategy (con mock)', () => {
  it('debería buscar reseñas con estrategia minimal', async () => {
    const mockResenas = [
      { id: 1, comentario: 'Reseña 1' },
      { id: 2, comentario: 'Reseña 2' }
    ] as Resena[];

    const mockEM = {
      find: vi.fn().mockResolvedValue(mockResenas)
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;

    const result = await findResenasWithStrategy(mockEM, where, 'minimal');

    expect(result).toEqual(mockResenas);
    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        populate: ['usuario', 'libro', 'libro.autor'],
        orderBy: { createdAt: 'DESC' }
      })
    );
  });

  it('debería aplicar limit y offset cuando se proporcionan', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    const options = { limit: 10, offset: 20 };

    await findResenasWithStrategy(mockEM, where, 'minimal', options);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        limit: 10,
        offset: 20
      })
    );
  });

  it('debería aplicar orderBy personalizado', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    const options = { orderBy: { estrellas: 'DESC' as const } };

    await findResenasWithStrategy(mockEM, where, 'with-reactions', options);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        orderBy: { estrellas: 'DESC' }
      })
    );
  });

  it('debería usar estrategia complete con todas las relaciones', async () => {
    const mockFind = vi.fn().mockResolvedValue([]);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;

    await findResenasWithStrategy(mockEM, where, 'complete');

    const callArgs = mockFind.mock.calls[0];
    const findOptions = callArgs[2];
    
    expect(findOptions.populate).toHaveLength(11);
  });

  it('debería manejar options vacío', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;

    await findResenasWithStrategy(mockEM, where, 'minimal', {});

    expect(mockEM.find).toHaveBeenCalled();
  });
});

describe('resenaPopulateHelpers - findResenaByIdWithStrategy (con mock)', () => {
  it('debería buscar reseña por ID con estrategia minimal', async () => {
    const mockResena = { id: 1, comentario: 'Test' } as Resena;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockResena)
    } as unknown as EntityManager;

    const result = await findResenaByIdWithStrategy(mockEM, 1, 'minimal');

    expect(result).toEqual(mockResena);
    expect(mockEM.findOne).toHaveBeenCalledWith(
      expect.anything(),
      { id: 1 },
      expect.objectContaining({
        populate: ['usuario', 'libro', 'libro.autor']
      })
    );
  });

  it('debería retornar null si no encuentra reseña', async () => {
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null)
    } as unknown as EntityManager;

    const result = await findResenaByIdWithStrategy(mockEM, 999, 'complete');

    expect(result).toBeNull();
  });

  it('debería usar estrategia complete para detalle', async () => {
    const mockFindOne = vi.fn().mockResolvedValue({} as Resena);
    const mockEM = {
      findOne: mockFindOne
    } as unknown as EntityManager;

    await findResenaByIdWithStrategy(mockEM, 1, 'complete');

    const callArgs = mockFindOne.mock.calls[0];
    const findOptions = callArgs[2];
    
    expect(findOptions.populate).toHaveLength(11);
  });

  it('debería usar estrategia moderation', async () => {
    const mockFindOne = vi.fn().mockResolvedValue({} as Resena);
    const mockEM = {
      findOne: mockFindOne
    } as unknown as EntityManager;

    await findResenaByIdWithStrategy(mockEM, 1, 'moderation');

    const callArgs = mockFindOne.mock.calls[0];
    const findOptions = callArgs[2];
    
    expect(findOptions.populate).toHaveLength(4);
  });
});

describe('resenaPopulateHelpers - findResenasMinimal (con mock)', () => {
  it('debería llamar a findResenasWithStrategy con estrategia minimal', async () => {
    const mockResenas = [{ id: 1 }] as Resena[];
    const mockEM = {
      find: vi.fn().mockResolvedValue(mockResenas)
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    const result = await findResenasMinimal(mockEM, where);

    expect(result).toEqual(mockResenas);
    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        populate: ['usuario', 'libro', 'libro.autor']
      })
    );
  });

  it('debería pasar opciones de limit y offset', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    await findResenasMinimal(mockEM, where, { limit: 5, offset: 10 });

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        limit: 5,
        offset: 10
      })
    );
  });
});

describe('resenaPopulateHelpers - findResenasWithReactions (con mock)', () => {
  it('debería llamar a findResenasWithStrategy con estrategia with-reactions', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    await findResenasWithReactions(mockEM, where);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        populate: expect.arrayContaining(['reacciones', 'reacciones.usuario'])
      })
    );
  });
});

describe('resenaPopulateHelpers - findResenasWithReplies (con mock)', () => {
  it('debería llamar a findResenasWithStrategy con estrategia with-replies', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    await findResenasWithReplies(mockEM, where);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        populate: expect.arrayContaining(['respuestas', 'respuestas.usuario'])
      })
    );
  });
});

describe('resenaPopulateHelpers - findResenasComplete (con mock)', () => {
  it('debería llamar a findResenasWithStrategy con estrategia complete', async () => {
    const mockFind = vi.fn().mockResolvedValue([]);
    const mockEM = {
      find: mockFind
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    await findResenasComplete(mockEM, where);

    const callArgs = mockFind.mock.calls[0];
    const findOptions = callArgs[2];
    
    expect(findOptions.populate).toHaveLength(11);
  });
});

describe('resenaPopulateHelpers - findResenasForModeration (con mock)', () => {
  it('debería llamar a findResenasWithStrategy con estrategia moderation', async () => {
    const mockEM = {
      find: vi.fn().mockResolvedValue([])
    } as unknown as EntityManager;

    const where = {} as FilterQuery<Resena>;
    await findResenasForModeration(mockEM, where);

    expect(mockEM.find).toHaveBeenCalledWith(
      expect.anything(),
      where,
      expect.objectContaining({
        populate: ['usuario', 'libro', 'libro.autor', 'reacciones']
      })
    );
  });
});

describe('resenaPopulateHelpers - getStrategyStats (función pura)', () => {
  it('debería retornar stats para estrategia minimal', () => {
    const result = getStrategyStats('minimal');

    expect(result).toEqual({
      strategy: 'minimal',
      populateCount: 3,
      estimatedQueries: 4,
      useCases: ['Listados simples', 'Feeds', 'Previews', 'Cards']
    });
  });

  it('debería retornar stats para estrategia with-reactions', () => {
    const result = getStrategyStats('with-reactions');

    expect(result).toEqual({
      strategy: 'with-reactions',
      populateCount: 5,
      estimatedQueries: 6,
      useCases: ['Listados con likes', 'Feeds con engagement', 'Trending reviews']
    });
  });

  it('debería retornar stats para estrategia with-replies', () => {
    const result = getStrategyStats('with-replies');

    expect(result.strategy).toBe('with-replies');
    expect(result.populateCount).toBe(6);
    expect(result.estimatedQueries).toBe(7);
    expect(result.useCases).toContain('Threads');
  });

  it('debería retornar stats para estrategia complete', () => {
    const result = getStrategyStats('complete');

    expect(result.strategy).toBe('complete');
    expect(result.populateCount).toBe(11);
    expect(result.estimatedQueries).toBe(15);
    expect(result.useCases).toContain('Detalle completo');
  });

  it('debería retornar stats para estrategia moderation', () => {
    const result = getStrategyStats('moderation');

    expect(result.strategy).toBe('moderation');
    expect(result.populateCount).toBe(4);
    expect(result.estimatedQueries).toBe(5);
    expect(result.useCases).toContain('Panel de moderación');
  });
});

describe('resenaPopulateHelpers - logPopulateStats (función con side effect)', () => {
  it('debería loggear stats sin errores', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logPopulateStats('minimal');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Populate Strategy'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Relations loaded: 3'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Estimated queries: 4'));
    
    consoleSpy.mockRestore();
  });

  it('debería loggear todas las estrategias sin errores', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const strategies: PopulateStrategy[] = ['minimal', 'with-reactions', 'with-replies', 'complete', 'moderation'];
    
    strategies.forEach(strategy => {
      logPopulateStats(strategy);
    });

    expect(consoleSpy).toHaveBeenCalledTimes(strategies.length * 4); // 4 logs por estrategia
    
    consoleSpy.mockRestore();
  });
});
