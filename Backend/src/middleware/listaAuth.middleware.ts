// src/middleware/listaAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Lista } from '../entities/lista.entity';

export const authorizeListaOwner = async (req: Request, res: Response, next: NextFunction) => {
  const orm = req.app.get('orm') as MikroORM;
  const userId = (req as any).user?.id;  // Ajusta según tu middleware de auth
  const listaId = Number(req.params.listaId) || Number(req.body.listaId);

  if (!listaId) {
    return res.status(400).json({ error: 'Falta listaId' });
  }

  const lista = await orm.em.findOne(Lista, { id: listaId }, { populate: ['usuario'] });

  if (!lista) {
    return res.status(404).json({ error: 'Lista no encontrada' });
  }

  if (!userId || lista.usuario.id !== userId) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  // Pasa lista para evitar cargarla de nuevo
  (req as any).lista = lista;

  next();
};
