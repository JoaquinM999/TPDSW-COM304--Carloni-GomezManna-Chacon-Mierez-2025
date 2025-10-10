import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';

export const getAutores = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autores = await orm.em.find(Autor, {});
  res.json(autores);
};

export const getAutorById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });
  res.json(autor);
};

export const createAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = orm.em.create(Autor, req.body);
  await orm.em.persistAndFlush(autor);
  res.status(201).json(autor);
};

export const updateAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  orm.em.assign(autor, req.body);
  await orm.em.flush();
  res.json(autor);
};

export const deleteAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  await orm.em.removeAndFlush(autor);
  res.json({ mensaje: 'Autor eliminado' });
};

export const searchAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    const autores = await em.find(Autor, {
      nombre: { $like: `%${query}%` }
    });

    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar autores' });
  }
};
