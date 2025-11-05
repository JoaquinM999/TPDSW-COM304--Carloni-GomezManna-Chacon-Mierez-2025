import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Reaccion } from '../entities/reaccion.entity';
import { ActividadService } from '../services/actividad.service';

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const addOrUpdateReaccion = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { resenaId, tipo } = req.body;
    
    // Obtener usuarioId del token
    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    const usuarioId = usuarioPayload.id;

    if (!resenaId || !tipo) {
      return res.status(400).json({ error: 'Faltan datos requeridos: resenaId y tipo' });
    }

    // Validar tipo de reacción
    const tiposValidos = ['like', 'dislike', 'corazon'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reacción inválido' });
    }

    let reaccion = await em.findOne(Reaccion, {
      usuario: usuarioId,
      resena: resenaId,
    });

    let esNueva = false;

    if (reaccion) {
      // Actualizar reacción existente
      reaccion.tipo = tipo;
      reaccion.fecha = new Date();
    } else {
      // Crear nueva reacción
      reaccion = em.create(Reaccion, {
        usuario: usuarioId,
        resena: resenaId,
        tipo,
        fecha: new Date(),
      });
      esNueva = true;
    }

    await em.persistAndFlush(reaccion);

    // Crear registro de actividad solo para nuevas reacciones
    if (esNueva) {
      try {
        const actividadService = new ActividadService(orm);
        await actividadService.crearActividadReaccion(usuarioId, resenaId);
      } catch (actividadError) {
        console.error('Error al crear registro de actividad:', actividadError);
      }
    }

    res.status(esNueva ? 201 : 200).json(reaccion);
  } catch (error) {
    console.error('Error en addOrUpdateReaccion:', error);
    res.status(500).json({ error: 'Error al procesar la reacción' });
  }
};

export const getReaccionesByResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const resenaId = +req.params.resenaId;

    if (isNaN(resenaId)) {
      return res.status(400).json({ error: 'ID de reseña inválido' });
    }

    const reacciones = await em.find(
      Reaccion, 
      { resena: resenaId }, 
      { populate: ['usuario'] }
    );
    
    res.json(reacciones);
  } catch (error) {
    console.error('Error en getReaccionesByResena:', error);
    res.status(500).json({ error: 'Error al obtener reacciones' });
  }
};

export const deleteReaccion = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { usuarioId, resenaId } = req.params;
    
    // Verificar autenticación
    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validar que el usuario solo pueda eliminar sus propias reacciones
    if (usuarioPayload.id !== +usuarioId) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta reacción' });
    }

    const reaccion = await em.findOne(Reaccion, {
      usuario: +usuarioId,
      resena: +resenaId,
    });

    if (!reaccion) {
      return res.status(404).json({ error: 'Reacción no encontrada' });
    }

    await em.removeAndFlush(reaccion);
    res.json({ mensaje: 'Reacción eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteReaccion:', error);
    res.status(500).json({ error: 'Error al eliminar la reacción' });
  }
};
