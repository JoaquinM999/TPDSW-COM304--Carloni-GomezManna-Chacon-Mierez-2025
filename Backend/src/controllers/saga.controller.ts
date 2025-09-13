import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Saga } from '../entities/saga.entity';
import { LRUCache } from 'lru-cache';

// Cache for sagas with 5 minute TTL
const sagasCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { sagasCache };

export const getSagas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    // Search parameters
    const search = req.query.search as string;
    
    // Build cache key
    const cacheKey = `sagas:${page}:${limit}:${search || ''}`;
    
    // Check cache first
    const cached = sagasCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Build query filters
    const filters: any = {};
    if (search) {
      filters.$or = [
        { nombre: { $ilike: `%${search}%` } },
        { descripcion: { $ilike: `%${search}%` } }
      ];
    }
    
    const [sagas, total] = await em.findAndCount(Saga, filters, {
      limit,
      offset,
      orderBy: { nombre: 'ASC' },
      populate: ['libros']
    });
    
    const result = {
      data: sagas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Cache the result
    sagasCache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching sagas:', error);
    res.status(500).json({ error: 'Error fetching sagas from database' });
  }
};

export const getSagaById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de saga inválido' });
    }
    
    const saga = await em.findOne(Saga, { id }, {
      populate: ['libros']
    });
    
    if (!saga) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }
    
    res.json(saga);
  } catch (error) {
    console.error('Error fetching saga by id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createSaga = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const { nombre } = req.body;
    
    // Validate required fields
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El campo nombre es requerido' 
      });
    }
    
    // Check if saga already exists
    const existingSaga = await em.findOne(Saga, { 
      nombre: nombre.trim()
    });
    
    if (existingSaga) {
      return res.status(409).json({ error: 'Ya existe una saga con ese nombre' });
    }
    
    const saga = em.create(Saga, req.body);
    await em.persistAndFlush(saga);
    
    // Clear cache
    sagasCache.clear();
    
    res.status(201).json(saga);
  } catch (error) {
    console.error('Error creating saga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateSaga = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de saga inválido' });
    }
    
    const saga = await em.findOne(Saga, { id });
    if (!saga) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }
    
    const { nombre } = req.body;
    
    // Check for duplicates if name is being updated
    if (nombre && nombre !== saga.nombre) {
      const existingSaga = await em.findOne(Saga, { 
        nombre: nombre.trim(),
        id: { $ne: id }
      });
      
      if (existingSaga) {
        return res.status(409).json({ error: 'Ya existe una saga con ese nombre' });
      }
    }
    
    em.assign(saga, req.body);
    await em.flush();
    
    // Clear cache
    sagasCache.clear();
    
    res.json(saga);
  } catch (error) {
    console.error('Error updating saga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteSaga = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de saga inválido' });
    }
    
    const saga = await em.findOne(Saga, { id });
    if (!saga) {
      return res.status(404).json({ error: 'Saga no encontrada' });
    }
    
    await em.removeAndFlush(saga);
    
    // Clear cache
    sagasCache.clear();
    
    res.json({ mensaje: 'Saga eliminada' });
  } catch (error) {
    console.error('Error deleting saga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
