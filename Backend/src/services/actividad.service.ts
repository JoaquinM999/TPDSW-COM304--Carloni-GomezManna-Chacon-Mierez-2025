import { MikroORM } from '@mikro-orm/core';
import { Actividad, TipoActividad } from '../entities/actividad.entity';
import { Usuario } from '../entities/usuario.entity';
import { Libro } from '../entities/libro.entity';
import { Resena } from '../entities/resena.entity';

export class ActividadService {
  constructor(private orm: MikroORM) {}

  async crearActividad(
    usuarioId: number,
    tipo: TipoActividad,
    libroId?: number,
    resenaId?: number
  ): Promise<Actividad> {
    const usuario = await this.orm.em.findOne(Usuario, { id: usuarioId });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    let libro = null;
    if (libroId) {
      libro = await this.orm.em.findOne(Libro, { id: libroId });
    }

    let resena = null;
    if (resenaId) {
      resena = await this.orm.em.findOne(Resena, { id: resenaId });
    }

    const actividad = this.orm.em.create(Actividad, {
      usuario,
      tipo,
      libro,
      resena,
      fecha: new Date()
    });

    await this.orm.em.persistAndFlush(actividad);
    return actividad;
  }

  async crearActividadResena(usuarioId: number, resenaId: number): Promise<Actividad> {
    return this.crearActividad(usuarioId, TipoActividad.RESEÑA, undefined, resenaId);
  }

  async crearActividadFavorito(usuarioId: number, libroId: number): Promise<Actividad> {
    return this.crearActividad(usuarioId, TipoActividad.FAVORITO, libroId);
  }

  async crearActividadSeguimiento(usuarioId: number): Promise<Actividad> {
    return this.crearActividad(usuarioId, TipoActividad.SEGUIMIENTO);
  }

  async crearActividadLista(usuarioId: number): Promise<Actividad> {
    return this.crearActividad(usuarioId, TipoActividad.LISTA);
  }

  async crearActividadReaccion(usuarioId: number, resenaId: number): Promise<Actividad> {
    return this.crearActividad(usuarioId, TipoActividad.REACCION, undefined, resenaId);
  }
}
