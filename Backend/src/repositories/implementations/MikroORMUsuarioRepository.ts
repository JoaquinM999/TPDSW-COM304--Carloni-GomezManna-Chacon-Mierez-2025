import { EntityManager, FilterQuery, FindOptions } from '@mikro-orm/core';
import type { IUsuarioRepository } from '../../interfaces/IUsuarioRepository';
import { Usuario } from '../../entities/usuario.entity';

/**
 * Implementación de IUsuarioRepository usando MikroORM
 * Responsabilidad: Acceso a datos de usuarios
 */
export class MikroORMUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: number, options?: FindOptions<Usuario>): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { id }, options);
  }

  async findByUsername(username: string, options?: FindOptions<Usuario>): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { username }, options);
  }

  async findByEmail(email: string, options?: FindOptions<Usuario>): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { email }, options);
  }

  async find(
    filter: FilterQuery<Usuario>,
    options?: FindOptions<Usuario>
  ): Promise<Usuario[]> {
    return this.em.find(Usuario, filter, options);
  }

  async findOne(
    filter: FilterQuery<Usuario>,
    options?: FindOptions<Usuario>
  ): Promise<Usuario | null> {
    return this.em.findOne(Usuario, filter, options);
  }

  async count(filter?: FilterQuery<Usuario>): Promise<number> {
    return this.em.count(Usuario, filter);
  }

  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    const newUsuario = this.em.create(Usuario, usuario);
    await this.em.persistAndFlush(newUsuario);
    return newUsuario;
  }

  async update(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new Error(`Usuario con id ${id} no encontrado`);
    }

    this.em.assign(usuario, data);
    await this.em.flush();
    return usuario;
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new Error(`Usuario con id ${id} no encontrado`);
    }

    await this.em.removeAndFlush(usuario);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.em.count(Usuario, { username });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.em.count(Usuario, { email });
    return count > 0;
  }

  async findByRole(role: string, options?: FindOptions<Usuario>): Promise<Usuario[]> {
    return this.em.find(Usuario, { role }, options);
  }

  async getFavoritos(usuarioId: number): Promise<any[]> {
    const usuario = await this.em.findOne(
      Usuario,
      { id: usuarioId },
      { populate: ['favoritos'] }
    );

    return usuario?.favoritos?.toArray() || [];
  }

  async getListas(usuarioId: number): Promise<any[]> {
    const usuario = await this.em.findOne(
      Usuario,
      { id: usuarioId },
      { populate: ['listas'] }
    );

    return usuario?.listas?.toArray() || [];
  }

  async getResenas(usuarioId: number): Promise<any[]> {
    const usuario = await this.em.findOne(
      Usuario,
      { id: usuarioId },
      { populate: ['resenas'] }
    );

    return usuario?.resenas?.toArray() || [];
  }

  async getActividades(usuarioId: number, limit: number = 20): Promise<any[]> {
    const usuario = await this.em.findOne(
      Usuario,
      { id: usuarioId },
      {
        populate: ['actividades'],
        orderBy: { 'actividades.fechaCreacion': 'DESC' },
        limit,
      }
    );

    return usuario?.actividades?.toArray() || [];
  }
}
