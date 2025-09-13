// src/controllers/lista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Lista, TipoLista } from '../entities/lista.entity';
import { Usuario } from '../entities/usuario.entity';
import { LRUCache } from 'lru-cache';

interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

// Cache for listas with 5 minute TTL
const listasCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { listasCache };

export const getListas = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Filter parameters
    const tipo = req.query.tipo as TipoLista;
    const search = req.query.search as string;

    // Build cache key
    const cacheKey = `listas:${userId}:${page}:${limit}:${tipo || ''}:${search || ''}`;

    // Check cache first
    const cached = listasCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Build query filters
    const filters: any = { usuario: { id: userId } };
    if (tipo) filters.tipo = tipo;
    if (search) {
      filters.nombre = { $ilike: `%${search}%` };
    }

    const [listas, total] = await orm.em.findAndCount(Lista, filters, {
      populate: ['usuario'],
      limit,
      offset,
      orderBy: { ultimaModificacion: 'DESC' }
    });

    const result = {
      data: listas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    listasCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching listas:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
};

export const getListaById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const lista = await orm.em.findOne(Lista, { id: +req.params.id }, { populate: ['usuario'] });
    if (!lista) return res.status(404).json({ error: 'Lista no encontrada' });

    // Check if user owns this list or if it's public
    const userId = (req as AuthRequest).user?.id;
    if (lista.usuario.id !== userId) {
      return res.status(403).json({ error: 'No autorizado para ver esta lista' });
    }

    res.json(lista);
  } catch (error) {
    console.error('Error fetching lista by id:', error);
    res.status(500).json({ error: 'Error al obtener la lista' });
  }
};

export const createLista = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await orm.em.findOne(Usuario, { id: userId });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, tipo } = req.body;
    if (!nombre || !tipo) return res.status(400).json({ error: 'Nombre y tipo requeridos' });

    // Validate tipo
    if (!Object.values(TipoLista).includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de lista inválido' });
    }

    // Check if user already has a list with this name
    const existingLista = await orm.em.findOne(Lista, {
      nombre,
      usuario: { id: userId }
    });
    if (existingLista) {
      return res.status(409).json({ error: 'Ya tienes una lista con ese nombre' });
    }

    const lista = orm.em.create(Lista, {
      nombre,
      tipo: tipo as TipoLista,
      usuario,
      createdAt: new Date(),
      ultimaModificacion: new Date()
    });
    await orm.em.persistAndFlush(lista);

    // Clear cache
    listasCache.clear();

    res.status(201).json(lista);
  } catch (error) {
    console.error('Error creating lista:', error);
    res.status(500).json({ error: 'Error al crear lista' });
  }
};

export const updateLista = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const lista = await orm.em.findOne(Lista, { id: +req.params.id }, { populate: ['usuario'] });
    if (!lista) return res.status(404).json({ error: 'Lista no encontrada' });

    // Check authentication
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    // Check ownership
    if (lista.usuario.id !== userId) {
      return res.status(403).json({ error: 'No autorizado para modificar esta lista' });
    }

    const { nombre, tipo } = req.body;

    // Validate tipo if provided
    if (tipo && !Object.values(TipoLista).includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de lista inválido' });
    }

    // Check for duplicate name if changing name
    if (nombre && nombre !== lista.nombre) {
      const existingLista = await orm.em.findOne(Lista, {
        nombre,
        usuario: { id: userId },
        id: { $ne: lista.id }
      });
      if (existingLista) {
        return res.status(409).json({ error: 'Ya tienes una lista con ese nombre' });
      }
    }

    orm.em.assign(lista, { ...req.body, ultimaModificacion: new Date() });
    await orm.em.flush();

    // Clear cache
    listasCache.clear();

    res.json(lista);
  } catch (error) {
    console.error('Error updating lista:', error);
    res.status(500).json({ error: 'Error al actualizar lista' });
  }
};

export const deleteLista = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const lista = await orm.em.findOne(Lista, { id: +req.params.id }, { populate: ['usuario'] });
    if (!lista) return res.status(404).json({ error: 'Lista no encontrada' });

    // Check authentication
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    // Check ownership
    if (lista.usuario.id !== userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta lista' });
    }

    await orm.em.removeAndFlush(lista);

    // Clear cache
    listasCache.clear();

    res.json({ mensaje: 'Lista eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting lista:', error);
    res.status(500).json({ error: 'Error al eliminar lista' });
  }
};
