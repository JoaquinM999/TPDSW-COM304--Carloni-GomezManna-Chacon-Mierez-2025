import { EntityManager, FilterQuery, FindOptions } from '@mikro-orm/core';
import type { IResenaRepository } from '../../interfaces/IResenaRepository';
import { Resena } from '../../entities/resena.entity';

/**
 * Implementación de IResenaRepository usando MikroORM
 * Responsabilidad: Acceso a datos de reseñas
 */
export class MikroORMResenaRepository implements IResenaRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: number, options?: FindOptions<Resena>): Promise<Resena | null> {
    return this.em.findOne(Resena, { id }, options);
  }

  async find(
    filter: FilterQuery<Resena>,
    options?: FindOptions<Resena>
  ): Promise<Resena[]> {
    return this.em.find(Resena, filter, options);
  }

  async findOne(
    filter: FilterQuery<Resena>,
    options?: FindOptions<Resena>
  ): Promise<Resena | null> {
    return this.em.findOne(Resena, filter, options);
  }

  async count(filter?: FilterQuery<Resena>): Promise<number> {
    return this.em.count(Resena, filter);
  }

  async create(resena: Partial<Resena>): Promise<Resena> {
    const newResena = this.em.create(Resena, resena);
    await this.em.persistAndFlush(newResena);
    return newResena;
  }

  async update(id: number, data: Partial<Resena>): Promise<Resena> {
    const resena = await this.findById(id);
    if (!resena) {
      throw new Error(`Reseña con id ${id} no encontrada`);
    }

    this.em.assign(resena, data);
    await this.em.flush();
    return resena;
  }

  async delete(id: number): Promise<void> {
    const resena = await this.findById(id);
    if (!resena) {
      throw new Error(`Reseña con id ${id} no encontrada`);
    }

    await this.em.removeAndFlush(resena);
  }

  async findByLibro(libroId: number, options?: FindOptions<Resena>): Promise<Resena[]> {
    return this.em.find(Resena, { libro: libroId }, options);
  }

  async findByUsuario(usuarioId: number, options?: FindOptions<Resena>): Promise<Resena[]> {
    return this.em.find(Resena, { usuario: usuarioId }, options);
  }

  async findRespuestas(resenaId: number, options?: FindOptions<Resena>): Promise<Resena[]> {
    return this.em.find(Resena, { resenaOriginal: resenaId }, options);
  }

  async existsByUsuarioAndLibro(usuarioId: number, libroId: number): Promise<boolean> {
    const count = await this.em.count(Resena, {
      usuario: usuarioId,
      libro: libroId,
      resenaOriginal: null, // Solo reseñas principales, no respuestas
    });
    return count > 0;
  }

  async findPendingModeration(options?: FindOptions<Resena>): Promise<Resena[]> {
    return this.em.find(
      Resena,
      {
        aprobada: false,
        rechazada: false,
      },
      options
    );
  }

  async findMostHelpful(libroId: number, limit: number): Promise<Resena[]> {
    // Reseñas con más reacciones positivas
    const qb = this.em.createQueryBuilder(Resena, 'r');
    qb.leftJoin('r.reacciones', 'rc')
      .where({ 'r.libro': libroId })
      .groupBy('r.id')
      .addSelect('COUNT(CASE WHEN rc.tipo = :tipo THEN 1 END)', 'positive_count')
      .setParameter('tipo', 'util')
      .orderBy({ positive_count: 'DESC' })
      .limit(limit);

    return qb.getResultList();
  }

  async findRecent(limit: number, options?: FindOptions<Resena>): Promise<Resena[]> {
    return this.em.find(
      Resena,
      {},
      {
        ...options,
        orderBy: { fechaCreacion: 'DESC' },
        limit,
      }
    );
  }

  async getAverageRating(libroId: number): Promise<number> {
    const result = await this.em
      .createQueryBuilder(Resena, 'r')
      .where({ libro: libroId, resenaOriginal: null })
      .select('AVG(r.calificacion)', 'avg')
      .execute('get');

    return result?.avg ? parseFloat(result.avg) : 0;
  }

  async getRatingDistribution(libroId: number): Promise<Record<number, number>> {
    const results = await this.em
      .createQueryBuilder(Resena, 'r')
      .where({ libro: libroId, resenaOriginal: null })
      .select(['r.calificacion', 'COUNT(r.id) as count'])
      .groupBy('r.calificacion')
      .execute();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    for (const result of results) {
      distribution[result.calificacion] = parseInt(result.count);
    }

    return distribution;
  }
}
