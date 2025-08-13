// src/controllers/libro.controller.ts
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { Libro } from '../entities/libro.entity';
import { Categoria } from '../entities/categoria.entity';

export const getLibros = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as EntityManager;
  const libros = await orm.find(Libro, {});
  res.json(libros);
};

export const getLibroById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as EntityManager;
  const libro = await orm.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
  res.json(libro);
};

export const createLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as EntityManager;
  const nuevoLibro = orm.create(Libro, req.body);
  await orm.persistAndFlush(nuevoLibro);
  res.status(201).json(nuevoLibro);
};

export const updateLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as EntityManager;
  const libro = await orm.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  orm.assign(libro, req.body);
  await orm.flush();
  res.json(libro);
};

export const deleteLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as EntityManager;
  const libro = await orm.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  await orm.removeAndFlush(libro);
  res.json({ mensaje: 'Libro eliminado' });
};

export const getLibrosByCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as EntityManager;
    const categoriaId = +req.params.categoriaId;

    const categoria = await orm.findOne(Categoria, { id: categoriaId });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

    const libros = await orm.find(Libro, { categoria: categoriaId });
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por categoría' });
  }
};

export const getLibrosByEstrellasMinimas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as EntityManager;
    const minEstrellas = Number(req.query.minEstrellas);

    if (isNaN(minEstrellas) || minEstrellas < 1 || minEstrellas > 5) {
      return res.status(400).json({ error: 'Parámetro minEstrellas inválido. Debe estar entre 1 y 5' });
    }

    // Consulta SQL nativa para obtener libros con promedio de estrellas >= minEstrellas
    const libros = await orm.getConnection().execute(`
      SELECT l.*, AVG(r.estrellas) AS promedio_estrellas
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
