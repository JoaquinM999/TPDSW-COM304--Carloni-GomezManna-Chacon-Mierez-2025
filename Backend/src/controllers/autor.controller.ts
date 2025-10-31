import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';

export const getAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Construir filtro de búsqueda
    const where: any = {};
    if (search && (search as string).trim().length > 0) {
      const searchTerm = (search as string).trim();
      where.$or = [
        { nombre: { $like: `%${searchTerm}%` } },
        { apellido: { $like: `%${searchTerm}%` } }
      ];
    }
    
    // Ejecutar query con paginación
    const autores = await em.find(Autor, where, {
      limit: limitNum,
      offset: offset,
      orderBy: { nombre: 'ASC', apellido: 'ASC' }
    });
    
    const total = await em.count(Autor, where);
    
    res.json({
      autores: autores.map((autor: Autor) => ({
        id: autor.id.toString(),
        nombre: autor.nombre,
        apellido: autor.apellido,
        name: `${autor.nombre} ${autor.apellido}`.trim(),
        createdAt: autor.createdAt
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum < Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error en getAutores:', error);
    res.status(500).json({ error: 'Error al obtener autores' });
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
