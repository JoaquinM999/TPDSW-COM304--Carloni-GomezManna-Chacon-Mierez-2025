// src/controllers/libro.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Libro } from '../entities/libro.entity';
import { Categoria } from '../entities/categoria.entity';

export const getLibros = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libros = await em.find(Libro, {});
  res.json(libros);
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
  const nuevoLibro = em.create(Libro, req.body);
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

    const libros = await em.getConnection().execute(`
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
