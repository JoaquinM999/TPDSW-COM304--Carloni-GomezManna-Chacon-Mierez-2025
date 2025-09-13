import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Editorial } from '../entities/editorial.entity';
import { LRUCache } from 'lru-cache';

// Cache for editoriales with 5 minute TTL
const editorialesCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { editorialesCache };

export const getEditoriales = async (req: Request, res: Response) => {
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
    const cacheKey = `editoriales:${page}:${limit}:${search || ''}`;
    
    // Check cache first
    const cached = editorialesCache.get(cacheKey);
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
    
    const [editoriales, total] = await em.findAndCount(Editorial, filters, {
      limit,
      offset,
      orderBy: { nombre: 'ASC' },
      populate: ['libros']
    });
    
    const result = {
      data: editoriales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Cache the result
    editorialesCache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching editoriales:', error);
    res.status(500).json({ error: 'Error fetching editoriales from database' });
  }
};

export const getEditorialById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de editorial inválido' });
    }
    
    const editorial = await em.findOne(Editorial, { id }, {
      populate: ['libros']
    });
    
    if (!editorial) {
      return res.status(404).json({ error: 'Editorial no encontrada' });
    }
    
    res.json(editorial);
  } catch (error) {
    console.error('Error fetching editorial by id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createEditorial = async (req: Request, res: Response) => {
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
    
    // Check if editorial already exists
    const existingEditorial = await em.findOne(Editorial, { 
      nombre: nombre.trim()
    });
    
    if (existingEditorial) {
      return res.status(409).json({ error: 'Ya existe una editorial con ese nombre' });
    }
    
    const editorial = em.create(Editorial, req.body);
    await em.persistAndFlush(editorial);
    
    // Clear cache
    editorialesCache.clear();
    
    res.status(201).json(editorial);
  } catch (error) {
    console.error('Error creating editorial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateEditorial = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de editorial inválido' });
    }
    
    const editorial = await em.findOne(Editorial, { id });
    if (!editorial) {
      return res.status(404).json({ error: 'Editorial no encontrada' });
    }
    
    const { nombre } = req.body;
    
    // Check for duplicates if name is being updated
    if (nombre && nombre !== editorial.nombre) {
      const existingEditorial = await em.findOne(Editorial, { 
        nombre: nombre.trim(),
        id: { $ne: id }
      });
      
      if (existingEditorial) {
        return res.status(409).json({ error: 'Ya existe una editorial con ese nombre' });
      }
    }
    
    em.assign(editorial, req.body);
    await em.flush();
    
    // Clear cache
    editorialesCache.clear();
    
    res.json(editorial);
  } catch (error) {
    console.error('Error updating editorial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteEditorial = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de editorial inválido' });
    }
    
    const editorial = await em.findOne(Editorial, { id });
    if (!editorial) {
      return res.status(404).json({ error: 'Editorial no encontrada' });
    }
    
    await em.removeAndFlush(editorial);
    
    // Clear cache
    editorialesCache.clear();
    
    res.json({ mensaje: 'Editorial eliminada' });
  } catch (error) {
    console.error('Error deleting editorial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
