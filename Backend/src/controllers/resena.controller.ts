// src/controllers/resena.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Resena, EstadoResena } from '../entities/resena.entity';
import { Libro } from '../entities/libro.entity';
import { Usuario } from '../entities/usuario.entity';
import { contieneMalasPalabras } from '../shared/filtrarMalasPalabras';

// Extendemos Request para tipar req.user con un payload que tiene id
interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

export const getResenas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resenas = await orm.em.find(Resena, {}, { populate: ['usuario', 'libro'] });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
};

export const getResenaById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resena = await orm.em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario', 'libro'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(resena);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reseña' });
  }
};

export const createResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const { comentario, estrellas, libroId } = req.body;

    if (!comentario || typeof comentario !== 'string') {
      return res.status(400).json({ error: 'Comentario inválido o faltante' });
    }
    const estrellasNum = Number(estrellas);
    if (isNaN(estrellasNum) || estrellasNum < 1 || estrellasNum > 5) {
      return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });
    }
    if (!libroId) return res.status(400).json({ error: 'Falta libroId' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await orm.em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const libro = await orm.em.findOne(Libro, { id: libroId });
    if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

    const esOfensivo = await contieneMalasPalabras(comentario);
    if (esOfensivo) {
      return res.status(400).json({ error: 'El comentario contiene lenguaje inapropiado' });
    }

    const nuevaResena = orm.em.create(Resena, {
      comentario,
      estrellas: estrellasNum,
      fechaResena: new Date(),
      libro,
      usuario,
      estado: EstadoResena.PENDING,
      createdAt: new Date(),
    });

    await orm.em.persistAndFlush(nuevaResena);
    res.status(201).json({ message: 'Reseña creada', resena: nuevaResena });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al crear la reseña',
    });
  }
};

export const updateResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resena = await orm.em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    if (resena.usuario.id !== usuarioPayload.id) {
      return res.status(403).json({ error: 'No autorizado para modificar esta reseña' });
    }

    if (req.body.comentario) {
      if (typeof req.body.comentario !== 'string') {
        return res.status(400).json({ error: 'Comentario inválido' });
      }
      const esOfensivo = await contieneMalasPalabras(req.body.comentario);
      if (esOfensivo) {
        return res.status(400).json({ error: 'El comentario contiene lenguaje inapropiado' });
      }
    }

    if (req.body.estrellas !== undefined) {
      const estrellas = Number(req.body.estrellas);
      if (isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
        return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });
      }
    }

    orm.em.assign(resena, req.body);
    await orm.em.persistAndFlush(resena);
    res.json({ message: 'Reseña actualizada', resena });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al actualizar la reseña',
    });
  }
};

export const deleteResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resena = await orm.em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    if (resena.usuario.id !== usuarioPayload.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta reseña' });
    }

    await orm.em.removeAndFlush(resena);
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al eliminar la reseña',
    });
  }
};

export const approveResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resena = await orm.em.findOne(Resena, { id: +req.params.id });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (resena.estado !== EstadoResena.PENDING) {
      return res.status(400).json({ error: 'La reseña ya ha sido moderada' });
    }

    resena.estado = EstadoResena.APPROVED;
    await orm.em.persistAndFlush(resena);
    res.json({ message: 'Reseña aprobada', resena });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al aprobar la reseña',
    });
  }
};

export const rejectResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const resena = await orm.em.findOne(Resena, { id: +req.params.id });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (resena.estado !== EstadoResena.PENDING) {
      return res.status(400).json({ error: 'La reseña ya ha sido moderada' });
    }

    resena.estado = EstadoResena.FLAGGED;
    await orm.em.persistAndFlush(resena);
    res.json({ message: 'Reseña rechazada', resena });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al rechazar la reseña',
    });
  }
};
