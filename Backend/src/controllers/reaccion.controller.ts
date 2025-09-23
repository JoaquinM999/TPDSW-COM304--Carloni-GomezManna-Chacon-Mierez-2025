import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Reaccion } from '../entities/reaccion.entity';
import { ActividadService } from '../services/actividad.service';

export const addOrUpdateReaccion = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const { usuarioId, resenaId, tipo } = req.body;

  if (!usuarioId || !resenaId || !tipo) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  let reaccion = await orm.em.findOne(Reaccion, {
    usuario: usuarioId,
    resena: resenaId,
  });

  if (reaccion) {
    reaccion.tipo = tipo;
    reaccion.fecha = new Date();
  } else {
    reaccion = orm.em.create(Reaccion, {
      usuario: usuarioId,
      resena: resenaId,
      tipo,
      fecha: new Date(),
    });
    await orm.em.persist(reaccion);
  }

  await orm.em.flush();

  // Crear registro de actividad (solo para nuevas reacciones, no para actualizaciones)
  if (!reaccion.id) {
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadReaccion(usuarioId, resenaId);
    } catch (actividadError) {
      console.error('Error al crear registro de actividad:', actividadError);
      // No fallar la creación de reacción si falla el registro de actividad
    }
  }

  res.status(201).json(reaccion);
};

// 🔁 Renombrada para que coincida con el import
export const getReaccionesByResena = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const resenaId = +req.params.resenaId;

  const reacciones = await orm.em.find(Reaccion, { resena: resenaId }, { populate: ['usuario'] });
  res.json(reacciones);
};

export const deleteReaccion = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const { usuarioId, resenaId } = req.params;

  const reaccion = await orm.em.findOne(Reaccion, {
    usuario: +usuarioId,
    resena: +resenaId,
  });

  if (!reaccion) {
    return res.status(404).json({ error: 'Reacción no encontrada' });
  }

  await orm.em.removeAndFlush(reaccion);
  res.json({ mensaje: 'Reacción eliminada' });
};
