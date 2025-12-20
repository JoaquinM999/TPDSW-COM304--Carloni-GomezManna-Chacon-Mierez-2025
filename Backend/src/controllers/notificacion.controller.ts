import { Request, Response } from 'express';
import { RequestContext, MikroORM } from '@mikro-orm/core';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Obtener notificaciones del usuario autenticado
 */
export const obtenerNotificaciones = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  await RequestContext.create(orm.em, async () => {
    try {
      const usuarioId = (req as any).usuarioId;
      const limit = parseInt(req.query.limit as string) || 20;

      const service = new NotificacionService(orm.em);
      const notificaciones = await service.obtenerNotificaciones(usuarioId, limit);

      res.json({ notificaciones });
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  });
};

/**
 * Contar notificaciones no leídas
 */
export const contarNoLeidas = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  await RequestContext.create(orm.em, async () => {
    try {
      const usuarioId = (req as any).usuarioId;

      const service = new NotificacionService(orm.em);
      const count = await service.contarNoLeidas(usuarioId);

      res.json({ count });
    } catch (error: any) {
      console.error('Error al contar notificaciones:', error);
      res.status(500).json({ error: 'Error al contar notificaciones' });
    }
  });
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  await RequestContext.create(orm.em, async () => {
    try {
      const usuarioId = (req as any).usuarioId;
      const { id } = req.params;

      const service = new NotificacionService(orm.em);
      await service.marcarComoLeida(parseInt(id), usuarioId);

      res.json({ message: 'Notificación marcada como leída' });
    } catch (error: any) {
      console.error('Error al marcar notificación:', error);
      res.status(500).json({ error: 'Error al marcar notificación como leída' });
    }
  });
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  await RequestContext.create(orm.em, async () => {
    try {
      const usuarioId = (req as any).usuarioId;

      const service = new NotificacionService(orm.em);
      await service.marcarTodasComoLeidas(usuarioId);

      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error: any) {
      console.error('Error al marcar notificaciones:', error);
      res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
    }
  });
};

/**
 * Eliminar notificación
 */
export const eliminarNotificacion = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  await RequestContext.create(orm.em, async () => {
    try {
      const usuarioId = (req as any).usuarioId;
      const { id } = req.params;

      const service = new NotificacionService(orm.em);
      await service.eliminarNotificacion(parseInt(id), usuarioId);

      res.json({ message: 'Notificación eliminada' });
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({ error: 'Error al eliminar notificación' });
    }
  });
};
