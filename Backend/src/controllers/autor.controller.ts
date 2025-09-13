import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';
import { OpenLibraryService } from '../services/openLibrary.service';

const openLibraryService = new OpenLibraryService();

export const getAutores = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q ? String(req.query.q) : '';
    const authorsFromOpenLibrary = await openLibraryService.searchAuthors(searchQuery);
    res.json(authorsFromOpenLibrary);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching authors from Open Library API' });
  }
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

export const getAutoresWithBooks = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autores = await orm.em.find(Autor, {}, { populate: ['libros'] });
  const autoresWithBooks = autores.filter(autor => autor.libros.length > 0).map(autor => ({
    id: autor.id,
    nombre: autor.nombre,
    apellido: autor.apellido,
    libros: autor.libros.length
  }));
  res.json(autoresWithBooks);
};
