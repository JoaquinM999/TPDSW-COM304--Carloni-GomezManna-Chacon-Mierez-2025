import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Categoria } from '../entities/categoria.entity';
import { LRUCache } from 'lru-cache';

// Cache for categorias with 5 minute TTL
const categoriasCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { categoriasCache };

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    // Search parameters
    const search = req.query.search as string;
    
    // Build cache key
    const cacheKey = `categorias:${page}:${limit}:${search || ''}`;
    
    // Check cache first
    const cached = categoriasCache.get(cacheKey);
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
    
    const [categorias, total] = await em.findAndCount(Categoria, filters, {
      limit,
      offset,
      orderBy: { nombre: 'ASC' }
    });
    
    const result = {
      data: categorias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Cache the result
    categoriasCache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error fetching categories from database' });
  }
};

export const getCategoriaById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }
    
    const categoria = await em.findOne(Categoria, { id }, {
      populate: ['libros']
    });
    
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(categoria);
  } catch (error) {
    console.error('Error fetching categoria by id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { nombre, descripcion } = req.body;
    
    // Validate required fields
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El campo nombre es requerido' 
      });
    }
    
    // Check if category already exists
    const existingCategoria = await em.findOne(Categoria, { 
      nombre: nombre.trim()
    });
    
    if (existingCategoria) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    
    const categoria = em.create(Categoria, req.body);
    await em.persistAndFlush(categoria);
    
    // Clear cache
    categoriasCache.clear();
    
    res.status(201).json(categoria);
  } catch (error) {
    console.error('Error creating categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }
    
    const categoria = await em.findOne(Categoria, { id });
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    const { nombre } = req.body;
    
    // Check for duplicates if name is being updated
    if (nombre && nombre !== categoria.nombre) {
      const existingCategoria = await em.findOne(Categoria, { 
        nombre: nombre.trim(),
        id: { $ne: id }
      });
      
      if (existingCategoria) {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      }
    }
    
    em.assign(categoria, req.body);
    await em.flush();
    
    // Clear cache
    categoriasCache.clear();
    
    res.json(categoria);
  } catch (error) {
    console.error('Error updating categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }
    
    const categoria = await em.findOne(Categoria, { id });
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    await em.removeAndFlush(categoria);
    
    // Clear cache
    categoriasCache.clear();
    
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error deleting categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
