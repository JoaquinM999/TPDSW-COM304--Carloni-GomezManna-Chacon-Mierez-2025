import { EntityManager, FilterQuery, FindOptions } from '@mikro-orm/core';
import type { ILibroRepository } from '../../interfaces/ILibroRepository';
import { Libro } from '../../entities/libro.entity';

/**
 * Implementación de ILibroRepository usando MikroORM
 * Responsabilidad: Acceso a datos de libros
 */
export class MikroORMLibroRepository implements ILibroRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: number, options?: FindOptions<Libro>): Promise<Libro | null> {
    return this.em.findOne(Libro, { id }, options);
  }

  async findByISBN(isbn: string): Promise<Libro | null> {
    return this.em.findOne(Libro, { isbn });
  }

  async findBySlug(slug: string): Promise<Libro | null> {
    return this.em.findOne(Libro, { slug });
  }

  async find(
    filter: FilterQuery<Libro>,
    options?: FindOptions<Libro>
  ): Promise<Libro[]> {
    return this.em.find(Libro, filter, options);
  }

  async findOne(
    filter: FilterQuery<Libro>,
    options?: FindOptions<Libro>
  ): Promise<Libro | null> {
    return this.em.findOne(Libro, filter, options);
  }

  async count(filter?: FilterQuery<Libro>): Promise<number> {
    return this.em.count(Libro, filter);
  }

  async create(libro: Partial<Libro>): Promise<Libro> {
    const newLibro = this.em.create(Libro, libro);
    await this.em.persistAndFlush(newLibro);
    return newLibro;
  }

  async update(id: number, data: Partial<Libro>): Promise<Libro> {
    const libro = await this.findById(id);
    if (!libro) {
      throw new Error(`Libro con id ${id} no encontrado`);
    }

    this.em.assign(libro, data);
    await this.em.flush();
    return libro;
  }

  async delete(id: number): Promise<void> {
    const libro = await this.findById(id);
    if (!libro) {
      throw new Error(`Libro con id ${id} no encontrado`);
    }

    await this.em.removeAndFlush(libro);
  }

  async findByAutor(autorId: number, options?: FindOptions<Libro>): Promise<Libro[]> {
    return this.em.find(Libro, { autor: autorId }, options);
  }

  async findByEditorial(editorialId: number, options?: FindOptions<Libro>): Promise<Libro[]> {
    return this.em.find(Libro, { editorial: editorialId }, options);
  }

  async findByCategoria(categoriaId: number, options?: FindOptions<Libro>): Promise<Libro[]> {
    return this.em.find(
      Libro,
      { categorias: { $in: [categoriaId] } },
      options
    );
  }

  async findBySaga(sagaId: number, options?: FindOptions<Libro>): Promise<Libro[]> {
    return this.em.find(Libro, { saga: sagaId }, options);
  }

  async search(query: string, options?: FindOptions<Libro>): Promise<Libro[]> {
    return this.em.find(
      Libro,
      {
        $or: [
          { titulo: { $ilike: `%${query}%` } },
          { descripcion: { $ilike: `%${query}%` } },
        ],
      },
      options
    );
  }

  async existsByISBN(isbn: string): Promise<boolean> {
    const count = await this.em.count(Libro, { isbn });
    return count > 0;
  }

  async findMostPopular(limit: number): Promise<Libro[]> {
    // Libros con más reseñas
    const qb = this.em.createQueryBuilder(Libro, 'l');
    qb.leftJoin('l.resenas', 'r')
      .groupBy('l.id')
      .orderBy({ 'COUNT(r.id)': 'DESC' })
      .limit(limit);

    return qb.getResultList();
  }

  async findTopRated(limit: number): Promise<Libro[]> {
    // Libros con mejor calificación promedio (mínimo 5 reseñas)
    const qb = this.em.createQueryBuilder(Libro, 'l');
    qb.leftJoin('l.resenas', 'r')
      .select('l.*')
      .addSelect('AVG(r.calificacion)', 'avg_rating')
      .addSelect('COUNT(r.id)', 'review_count')
      .groupBy('l.id')
      .having('COUNT(r.id) >= 5')
      .orderBy({ avg_rating: 'DESC' })
      .limit(limit);

    return qb.getResultList();
  }
}
