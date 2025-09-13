// src/controllers/libro.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Libro } from '../entities/libro.entity';
import { Categoria } from '../entities/categoria.entity';
import { getReviewsByBookId } from '../services/reviewService';
import { LRUCache } from 'lru-cache';

// Cache for libros with 5 minute TTL
const librosCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { librosCache };

export const getLibros = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    // Search parameters
    const search = req.query.search as string;
    const categoriaId = req.query.categoria ? parseInt(req.query.categoria as string) : undefined;
    
    // Build cache key
    const cacheKey = `libros:${page}:${limit}:${search || ''}:${categoriaId || ''}`;
    
    // Check cache first
    const cached = librosCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Build query filters
    const filters: any = {};
    if (search) {
      filters.$or = [
        { nombre: { $ilike: `%${search}%` } },
        { sinopsis: { $ilike: `%${search}%` } }
      ];
    }
    if (categoriaId) {
      filters.categoria = categoriaId;
    }
    
    const [libros, total] = await em.findAndCount(Libro, filters, {
      limit,
      offset,
      orderBy: { nombre: 'ASC' },
      populate: ['categoria', 'autor', 'editorial', 'saga']
    });
    
    const result = {
      data: libros,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Cache the result
    librosCache.set(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching libros:', error);
    res.status(500).json({ error: 'Error fetching books from database' });
  }
};

export const getLibroById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }
    
    const libro = await em.findOne(Libro, { id }, {
      populate: ['categoria', 'autor', 'editorial', 'saga', 'resenas']
    });
    
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    res.json(libro);
  } catch (error) {
    console.error('Error fetching libro by id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createLibro = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { nombre, sinopsis, autor, categoria, editorial, saga } = req.body;
    
    // Validate required fields
    if (!nombre || !sinopsis || !autor || !categoria || !editorial) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: nombre, sinopsis, autor, categoria, editorial' 
      });
    }
    
    // Check if book already exists
    const existingLibro = await em.findOne(Libro, { 
      nombre: nombre.trim(),
      autor: autor
    });
    
    if (existingLibro) {
      return res.status(409).json({ error: 'Ya existe un libro con ese nombre y autor' });
    }
    
    // Verify related entities exist
    const autorEntity = await em.findOne('Autor', { id: autor });
    if (!autorEntity) {
      return res.status(400).json({ error: 'Autor no encontrado' });
    }
    const categoriaEntity = await em.findOne('Categoria', { id: categoria });
    const editorialEntity = await em.findOne('Editorial', { id: editorial });
    
    if (!categoriaEntity) {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }
    if (!editorialEntity) {
      return res.status(400).json({ error: 'Editorial no encontrada' });
    }
    
    if (saga) {
      const sagaEntity = await em.findOne('Saga', { id: saga });
      if (!sagaEntity) {
        return res.status(400).json({ error: 'Saga no encontrada' });
      }
    }
    
    const nuevoLibro = em.create(Libro, req.body);
    await em.persistAndFlush(nuevoLibro);
    
    // Clear cache
    librosCache.clear();
    
    res.status(201).json(nuevoLibro);
  } catch (error) {
    console.error('Error creating libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateLibro = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }
    
    const libro = await em.findOne(Libro, { id });
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    const { nombre, autor } = req.body;
    
    // Check for duplicates if name or author is being updated
    if ((nombre && nombre !== libro.nombre) || (autor && autor !== libro.autor.id)) {
      const existingLibro = await em.findOne(Libro, { 
        nombre: nombre || libro.nombre,
        autor: autor || libro.autor.id,
        id: { $ne: id }
      });
      
      if (existingLibro) {
        return res.status(409).json({ error: 'Ya existe un libro con ese nombre y autor' });
      }
    }
    
    // Verify related entities exist if they're being updated
    if (req.body.autor) {
      const autorEntity = await em.findOne('Autor', { id: req.body.autor });
      if (!autorEntity) {
        return res.status(400).json({ error: 'Autor no encontrado' });
      }
    }
    if (req.body.categoria) {
      const categoriaEntity = await em.findOne('Categoria', { id: req.body.categoria });
      if (!categoriaEntity) {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }
    if (req.body.editorial) {
      const editorialEntity = await em.findOne('Editorial', { id: req.body.editorial });
      if (!editorialEntity) {
        return res.status(400).json({ error: 'Editorial no encontrada' });
      }
    }
    if (req.body.saga) {
      const sagaEntity = await em.findOne('Saga', { id: req.body.saga });
      if (!sagaEntity) {
        return res.status(400).json({ error: 'Saga no encontrada' });
      }
    }
    
    em.assign(libro, req.body);
    await em.flush();
    
    // Clear cache
    librosCache.clear();
    
    res.json(libro);
  } catch (error) {
    console.error('Error updating libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteLibro = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }
    
    const libro = await em.findOne(Libro, { id });
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    await em.removeAndFlush(libro);
    
    // Clear cache
    librosCache.clear();
    
    res.json({ mensaje: 'Libro eliminado' });
  } catch (error) {
    console.error('Error deleting libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getLibrosByCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const categoriaId = +req.params.categoriaId;

    const categoria = await em.findOne(Categoria, { id: categoriaId });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

    const libros = await em.find(Libro, { categoria: categoriaId });
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por categoría' });
  }
};

export const getLibrosByEstrellasMinimas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const minEstrellas = Number(req.query.minEstrellas);

    if (isNaN(minEstrellas) || minEstrellas < 1 || minEstrellas > 5) {
      return res.status(400).json({ error: 'Parámetro minEstrellas inválido. Debe estar entre 1 y 5' });
    }

    // Using COALESCE to treat books without reviews as 0 average
    const libros = await em.getConnection().execute(`
      SELECT l.*, COALESCE(AVG(r.estrellas), 0) AS promedio_estrellas
      FROM libro l
      LEFT JOIN resena r ON r.libro_id = l.id
      GROUP BY l.id
      HAVING promedio_estrellas >= ?
      ORDER BY promedio_estrellas DESC
    `, [minEstrellas]);

    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por estrellas' });
  }
};

// Optional alternative using raw SQL query
export const getLibrosByEstrellasMinimasQB = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const minEstrellas = Number(req.query.minEstrellas);

    if (isNaN(minEstrellas) || minEstrellas < 1 || minEstrellas > 5) {
      return res.status(400).json({ error: 'Parámetro minEstrellas inválido. Debe estar entre 1 y 5' });
    }

    const libros = await orm.em.getConnection().execute(`
      SELECT l.*, COALESCE(AVG(r.estrellas), 0) AS promedio_estrellas
      FROM libro l
      LEFT JOIN resena r ON r.libro_id = l.id
      GROUP BY l.id
      HAVING promedio_estrellas >= ?
      ORDER BY promedio_estrellas DESC
    `, [minEstrellas]);

    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por estrellas (QueryBuilder)' });
  }
};

export const getReviewsByBookIdController = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const bookId = +req.params.id;

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }

    const reviews = await getReviewsByBookId(orm, bookId);
    res.json(reviews);
  } catch (error) {
    if (error instanceof Error && error.message === 'Libro no encontrado') {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};
