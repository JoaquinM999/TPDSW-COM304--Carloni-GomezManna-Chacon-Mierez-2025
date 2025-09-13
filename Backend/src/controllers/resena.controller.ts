// src/controllers/resena.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Resena, EstadoResena } from '../entities/resena.entity';
import { Libro } from '../entities/libro.entity';
import { Usuario } from '../entities/usuario.entity';
import { contieneMalasPalabras } from '../shared/filtrarMalasPalabras';
import { LRUCache } from 'lru-cache';

// Extendemos Request para tipar req.user con un payload que tiene id
interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

// Cache for resenas with 5 minute TTL
const resenasCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { resenasCache };

export const getResenas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Filter parameters
    const libroId = req.query.libroId ? parseInt(req.query.libroId as string) : undefined;
    const usuarioId = req.query.usuarioId ? parseInt(req.query.usuarioId as string) : undefined;
    const estado = req.query.estado as EstadoResena;

    // Build cache key
    const cacheKey = `resenas:${page}:${limit}:${libroId || ''}:${usuarioId || ''}:${estado || ''}`;

    // Check cache first
    const cached = resenasCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Build query filters
    const filters: any = {};
    if (libroId) filters.libro = libroId;
    if (usuarioId) filters.usuario = usuarioId;
    if (estado) filters.estado = estado;

    const [resenas, total] = await orm.em.findAndCount(Resena, filters, {
      populate: ['usuario', 'libro'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' }
    });

    const result = {
      data: resenas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    resenasCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching resenas:', error);
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
    console.error('Error fetching resena by id:', error);
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

    // Check if user already has a review for this book
    const existingResena = await orm.em.findOne(Resena, {
      usuario: usuario.id,
      libro: libro.id
    });
    if (existingResena) {
      return res.status(409).json({ error: 'Ya has reseñado este libro' });
    }

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

    // Clear cache
    resenasCache.clear();

    res.status(201).json({ message: 'Reseña creada', resena: nuevaResena });
  } catch (error) {
    console.error('Error creating resena:', error);
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

    // Clear cache
    resenasCache.clear();

    res.json({ message: 'Reseña actualizada', resena });
  } catch (error) {
    console.error('Error updating resena:', error);
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

    // Clear cache
    resenasCache.clear();

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error('Error deleting resena:', error);
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

    // Clear cache
    resenasCache.clear();

    res.json({ message: 'Reseña aprobada', resena });
  } catch (error) {
    console.error('Error approving resena:', error);
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

    // Clear cache
    resenasCache.clear();

    res.json({ message: 'Reseña rechazada', resena });
  } catch (error) {
    console.error('Error rejecting resena:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al rechazar la reseña',
    });
  }
};
