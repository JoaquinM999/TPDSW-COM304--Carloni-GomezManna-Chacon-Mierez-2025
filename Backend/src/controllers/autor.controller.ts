import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';
import { OpenLibraryService } from '../services/openLibrary.service';
import { LRUCache } from 'lru-cache';

const openLibraryService = new OpenLibraryService();

export const autoresCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const getAutores = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const cacheKey = `autores_page_${page}_limit_${limit}`;

  try {
    // Check cache first
    const cached = autoresCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [autores, total] = await orm.em.findAndCount(Autor, {}, {
      limit,
      offset,
      orderBy: { nombre: 'ASC', apellido: 'ASC' }
    });

    const result = {
      data: autores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    autoresCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Error fetching authors from database' });
  }
};

export const getAutorById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  try {
    const autor = await orm.em.findOne(Autor, { id: +req.params.id });
    if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });
    res.json(autor);
  } catch (error) {
    console.error('Error fetching author by id:', error);
    res.status(500).json({ error: 'Error fetching author from database' });
  }
};

export const createAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const { nombre, apellido } = req.body;

  try {
    // Check if author already exists
    const existingAutor = await orm.em.findOne(Autor, { nombre, apellido });
    if (existingAutor) {
      return res.status(409).json({ error: 'El autor ya existe' });
    }

    const autor = orm.em.create(Autor, req.body);
    await orm.em.persistAndFlush(autor);

    // Invalidate cache
    autoresCache.clear();

    res.status(201).json(autor);
  } catch (error) {
    console.error('Error creating author:', error);
    if (error instanceof Error && error.message.includes('duplicate')) {
      res.status(409).json({ error: 'El autor ya existe' });
    } else {
      res.status(500).json({ error: 'Error creating author' });
    }
  }
};

export const updateAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const { nombre, apellido } = req.body;

  try {
    const autor = await orm.em.findOne(Autor, { id: +req.params.id });
    if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

    // Check if updating to an existing author
    if (nombre !== autor.nombre || apellido !== autor.apellido) {
      const existingAutor = await orm.em.findOne(Autor, { nombre, apellido });
      if (existingAutor && existingAutor.id !== autor.id) {
        return res.status(409).json({ error: 'Ya existe un autor con ese nombre y apellido' });
      }
    }

    orm.em.assign(autor, req.body);
    await orm.em.flush();

    // Invalidate cache
    autoresCache.clear();

    res.json(autor);
  } catch (error) {
    console.error('Error updating author:', error);
    if (error instanceof Error && error.message.includes('duplicate')) {
      res.status(409).json({ error: 'Ya existe un autor con ese nombre y apellido' });
    } else {
      res.status(500).json({ error: 'Error updating author' });
    }
  }
};

export const deleteAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  try {
    const autor = await orm.em.findOne(Autor, { id: +req.params.id });
    if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

    await orm.em.removeAndFlush(autor);

    // Invalidate cache
    autoresCache.clear();

    res.json({ mensaje: 'Autor eliminado' });
  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({ error: 'Error deleting author' });
  }
};

export const getAutoresWithBooks = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;

  // Pagination params with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Count total authors with books
  const totalAuthors = await orm.em.count(Autor, {
    libros: { $ne: null }
  });

  // Fetch paginated authors with books
  const autores = await orm.em.find(
    Autor,
    {
      libros: { $ne: null }
    },
    {
      populate: ['libros'],
      limit,
      offset,
      orderBy: { id: 'ASC' },
    }
  );

  const autoresWithBooks = autores.map(autor => ({
    id: autor.id,
    nombre: autor.nombre,
    apellido: autor.apellido,
    libros: autor.libros.length,
  }));

  const totalPages = Math.ceil(totalAuthors / limit);

  res.json({
    data: autoresWithBooks,
    pagination: {
      page,
      limit,
      total: totalAuthors,
      totalPages,
    },
  });
};
