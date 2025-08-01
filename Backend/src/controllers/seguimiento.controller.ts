// src/controllers/seguimiento.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Seguimiento } from '../entities/seguimiento.entity';
import { Usuario } from '../entities/usuario.entity';

export const followUser = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const seguidorPayload = (req as any).user;
  const { seguidoId } = req.body;

  if (!seguidorPayload || !seguidorPayload.id) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  if (!seguidoId) {
    return res.status(400).json({ error: 'Falta el ID del usuario a seguir' });
  }
  if (seguidorPayload.id === seguidoId) {
    return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
  }

  const seguidor = await orm.em.findOne(Usuario, { id: seguidorPayload.id });
  const seguido = await orm.em.findOne(Usuario, { id: seguidoId });
  if (!seguidor || !seguido) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const existente = await orm.em.findOne(Seguimiento, { seguidor: seguidor.id, seguido: seguido.id });
  if (existente) {
    return res.status(400).json({ error: 'Ya sigues a este usuario' });
  }

  const nuevoSeguimiento = orm.em.create(Seguimiento, {
    seguidor,
    seguido,
    fechaSeguido: new Date(),
  });
  await orm.em.persistAndFlush(nuevoSeguimiento);
  res.status(201).json({ message: `Ahora sigues a ${seguido.username}` });
};

export const unfollowUser = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const seguidorPayload = (req as any).user;
  const seguidoId = Number(req.params.seguidoId);

  if (!seguidorPayload || !seguidorPayload.id) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const seguimiento = await orm.em.findOne(Seguimiento, {
    seguidor: seguidorPayload.id,
    seguido: seguidoId,
  });

  if (!seguimiento) {
    return res.status(404).json({ error: 'No estás siguiendo a este usuario' });
  }

  await orm.em.removeAndFlush(seguimiento);
  res.json({ message: 'Dejaste de seguir al usuario' });
};

export const getSeguidores = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const seguidoId = Number(req.params.usuarioId);

  const seguidores = await orm.em.find(Seguimiento, { seguido: seguidoId }, { populate: ['seguidor'] });
  const usuariosSeguidores = seguidores.map(s => s.seguidor);

  res.json(usuariosSeguidores);
};

export const getSeguidos = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const seguidorPayload = (req as any).user;

  if (!seguidorPayload || !seguidorPayload.id) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const seguidos = await orm.em.find(Seguimiento, { seguidor: seguidorPayload.id }, { populate: ['seguido'] });
  const usuariosSeguidos = seguidos.map(s => s.seguido);

  res.json(usuariosSeguidos);
};
