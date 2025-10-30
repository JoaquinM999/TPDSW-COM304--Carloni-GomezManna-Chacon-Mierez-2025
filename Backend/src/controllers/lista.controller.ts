// src/controllers/lista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Lista, TipoLista } from '../entities/lista.entity';
import { Usuario } from '../entities/usuario.entity';
import { ActividadService } from '../services/actividad.service';

interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

export const getListas = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const listas = await orm.em.find(
      Lista, 
      { usuario: { id: userId } }, 
      { populate: ['contenidos.libro.autor', 'contenidos.libro.categoria', 'usuario'] }
    );
    res.json(listas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener listas' });
  }
};

export const getListaById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = await orm.em.findOne(
    Lista, 
    { id: +req.params.id },
    { populate: ['contenidos.libro.autor', 'contenidos.libro.categoria', 'usuario'] }
  );
  if (!lista) return res.status(404).json({ error: 'No encontrada' });
  res.json(lista);
};

export const createLista = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await orm.em.findOne(Usuario, { id: userId });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, tipo } = req.body;
    if (!nombre || !tipo) return res.status(400).json({ error: 'Nombre y tipo requeridos' });

    const lista = orm.em.create(Lista, {
      nombre,
      tipo: tipo as TipoLista,
      usuario,
      createdAt: new Date(),
      ultimaModificacion: new Date()
    });
    await orm.em.persistAndFlush(lista);

    // Crear registro de actividad
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadLista(userId);
    } catch (actividadError) {
      console.error('Error al crear registro de actividad:', actividadError);
      // No fallar la creación de lista si falla el registro de actividad
    }

    res.status(201).json(lista);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear lista' });
  }
};

export const updateLista = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = await orm.em.findOne(Lista, { id: +req.params.id });
  if (!lista) return res.status(404).json({ error: 'No encontrada' });

  // Check authentication
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

  // Check ownership
  if (lista.usuario.id !== userId) {
    return res.status(403).json({ error: 'No autorizado para modificar esta lista' });
  }

  orm.em.assign(lista, req.body);
  await orm.em.flush();
  res.json(lista);
};

export const deleteLista = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = await orm.em.findOne(Lista, { id: +req.params.id });
  if (!lista) return res.status(404).json({ error: 'No encontrada' });

  // Check authentication
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

  // Check ownership
  if (lista.usuario.id !== userId) {
    return res.status(403).json({ error: 'No autorizado para eliminar esta lista' });
  }

  await orm.em.removeAndFlush(lista);
  res.json({ mensaje: 'Eliminada' });
};
