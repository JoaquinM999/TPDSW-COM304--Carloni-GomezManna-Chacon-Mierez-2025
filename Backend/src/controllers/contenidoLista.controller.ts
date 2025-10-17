// src/controllers/contenidoLista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { ContenidoLista } from '../entities/contenidoLista.entity';
import { Libro } from '../entities/libro.entity';
import { Lista } from '../entities/lista.entity'; // Asegúrate de importar la entidad Lista

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
  // --- CAMBIOS AQUÍ ---
  const { libroId, listaId } = req.body; // 1. Lee ambos IDs del body

  if (!libroId || !listaId) {
    res.status(400).json({ error: 'Faltan libroId o listaId' });
    return;
  }

  // 2. Busca la lista y el libro tú mismo, en lugar de depender de un middleware
  const lista = await orm.em.findOne(Lista, { id: listaId });
  if (!lista) {
    res.status(404).json({ error: 'Lista no encontrada' });
    return;
  }

  const libro = await orm.em.findOne(Libro, { externalId: libroId.toString() });
  if (!libro) {
    res.status(404).json({ error: 'Libro no encontrado' });
    return;
  }
  // --- FIN DE LOS CAMBIOS ---

  const existente = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { externalId: libroId.toString() } });
  if (existente) {
    res.status(400).json({ error: 'El libro ya está en la lista' });
    return;
  }

  const contenido = orm.em.create(ContenidoLista, { lista, libro, createdAt: new Date() });
  lista.ultimaModificacion = new Date();

  await orm.em.persistAndFlush(contenido);
  // La segunda llamada a flush no es necesaria si usas persistAndFlush
  // await orm.em.flush();

  res.status(201).json(contenido);
};

export const removeLibroDeLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = (req as any).lista;
  const libroId = req.params.libroId;

  const contenido = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { externalId: libroId } });
  if (!contenido) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await orm.em.removeAndFlush(contenido);

  lista.ultimaModificacion = new Date();
  await orm.em.flush();

  res.json({ mensaje: 'Eliminado' });
};
