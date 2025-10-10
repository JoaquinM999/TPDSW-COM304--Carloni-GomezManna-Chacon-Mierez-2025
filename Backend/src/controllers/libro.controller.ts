// src/controllers/libro.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Libro } from '../entities/libro.entity';
import { Categoria } from '../entities/categoria.entity';
import { Autor } from '../entities/autor.entity';
import { Editorial } from '../entities/editorial.entity';
import { Saga } from '../entities/saga.entity';
import { getReviewsByBookId } from '../services/reviewService';

export const getLibros = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libros = await em.find(Libro, {});
  res.json(libros)
};

export const getLibroById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
  res.json(libro);
};

export const createLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();

  const { autorId, categoriaId, editorialId, sagaId, ...libroData } = req.body;

  // Fetch related entities
  const autor = await em.findOne(Autor, { id: autorId });
  const categoria = await em.findOne(Categoria, { id: categoriaId });
  const editorial = await em.findOne(Editorial, { id: editorialId });
  const saga = sagaId ? await em.findOne(Saga, { id: sagaId }) : undefined;

  if (!autor || !categoria || !editorial) {
    return res.status(404).json({ error: 'Autor, categoría o editorial no encontrado' });
  }

  const nuevoLibro = em.create(Libro, {
    ...libroData,
    autor,
    categoria,
    editorial,
    saga
  });

  await em.persistAndFlush(nuevoLibro);
  res.status(201).json(nuevoLibro);
};

export const updateLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  em.assign(libro, req.body);
  await em.flush();
  res.json(libro);
};

export const deleteLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  await em.removeAndFlush(libro);
  res.json({ mensaje: 'Libro eliminado' });
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
    const bookId = req.params.id;

    const reviews = await getReviewsByBookId(orm, bookId);
    res.json(reviews);
  } catch (error) {
    if (error instanceof Error && error.message === 'Libro no encontrado') {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

export const searchLibros = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    // Search by title
    const librosByTitle = await em.find(Libro, {
      nombre: { $like: `%${query}%` }
    }, { populate: ['autor', 'categoria'] });

    // Search by author name
    const librosByAuthor = await em.find(Libro, {
      autor: { nombre: { $like: `%${query}%` } }
    }, { populate: ['autor', 'categoria'] });

    // Combine and deduplicate results
    const allLibros = [...librosByTitle, ...librosByAuthor];
    const uniqueLibros = allLibros.filter((libro, index, self) =>
      index === self.findIndex(l => l.id === libro.id)
    );

    res.json(uniqueLibros);
  } catch (error) {
    console.error('Error en searchLibros:', error);
    res.status(500).json({ error: 'Error al buscar libros' });
  }
};
