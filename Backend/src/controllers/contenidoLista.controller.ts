// src/controllers/contenidoLista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { ContenidoLista } from '../entities/contenidoLista.entity';
import { Libro } from '../entities/libro.entity';

export const getContenidoLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const listaId = Number(req.params.listaId);

  if (isNaN(listaId)) {
    res.status(400).json({ error: 'ID de lista inválido' });
    return;
  }

  const contenidos = await orm.em.find(
    ContenidoLista,
    { lista: { id: listaId } },
    { populate: ['libro'] }
  );

  res.json(contenidos);
};

export const addLibroALista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = (req as any).lista;
  const { libroId } = req.body;

  if (!libroId) {
    res.status(400).json({ error: 'Falta libroId' });
    return;
  }

  const libro = await orm.em.findOne(Libro, { id: libroId });
  if (!libro) {
    res.status(404).json({ error: 'Libro no encontrado' });
    return;
  }

  const existente = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { id: libroId } });
  if (existente) {
    res.status(400).json({ error: 'El libro ya está en la lista' });
    return;
  }

  const contenido = orm.em.create(ContenidoLista, { lista, libro });
  lista.ultimaModificacion = new Date();

  await orm.em.persistAndFlush(contenido);
  await orm.em.flush();

  res.status(201).json(contenido);
};

export const removeLibroDeLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = (req as any).lista;
  const libroId = Number(req.params.libroId);

  const contenido = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { id: libroId } });
  if (!contenido) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await orm.em.removeAndFlush(contenido);

  lista.ultimaModificacion = new Date();
  await orm.em.flush();

  res.json({ mensaje: 'Eliminado' });
};
