import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Favorito } from '../entities/favorito.entity';
import { Libro } from '../entities/libro.entity';
import { RatingLibro } from '../entities/ratingLibro.entity';
import { ActividadService } from '../services/actividad.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getFavoritos = async (req: AuthRequest, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  const favoritos = await orm.em.find(Favorito, {
    usuario: { id: usuarioId }
  }, {
    populate: ['libro.autor', 'libro.categoria']
  });

  // Get ratings for all libros
  const libroIds = favoritos.map(fav => fav.libro.id);
  const ratings = await orm.em.find(RatingLibro, { libro: { $in: libroIds } });
  const ratingMap = new Map(ratings.map(r => [r.libro.id, r.avgRating]));

  // Devolver array con datos completos del libro
  const result = favoritos.map(fav => ({
    id: fav.id, // ID del favorito
    libroId: fav.libro.id, // ID interno numérico del libro
    titulo: fav.libro.nombre,
    autor: fav.libro.autor?.nombre || 'Autor desconocido',
    categoria: fav.libro.categoria?.nombre || 'Sin categoría',
    rating: ratingMap.get(fav.libro.id) || 0,
    imagen: fav.libro.imagen,
    externalId: fav.libro.externalId,
    source: fav.libro.source,
    fechaAgregado: fav.fechaAgregado
  }));

  res.json(result);
};

export const addFavorito = async (req: AuthRequest, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;

  // 1. OBTENER ID DE USUARIO DEL TOKEN (SEGURO)
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  // 2. OBTENER DATOS DEL LIBRO DEL BODY
  const { libroData } = req.body;

  if (!libroData || !libroData.externalId || !libroData.source || !libroData.nombre) {
    res.status(400).json({ error: 'Faltan datos esenciales del libro (externalId, source, nombre).' });
    return;
  }

  try {
    // 3. BUSCAR O CREAR EL LIBRO (Tu lógica aquí ya es correcta)
    let libro = await orm.em.findOne(Libro, {
      externalId: libroData.externalId,
      source: libroData.source
    });

    if (!libro) {
      libro = orm.em.create(Libro, {
        externalId: libroData.externalId,
        source: libroData.source,
        nombre: libroData.nombre,
        sinopsis: libroData.sinopsis || null,
        imagen: libroData.imagen || null,
        enlace: libroData.enlace || null,
        createdAt: new Date(),
      });
      await orm.em.persistAndFlush(libro);
    }

    const libroId = libro.id; // Obtenemos el ID correcto, ya sea existente o nuevo.

    // 4. CREAR EL FAVORITO (usando el usuarioId del token)
    const favoritoExistente = await orm.em.findOne(Favorito, { usuario: usuarioId, libro: libroId });

    if (favoritoExistente) {
      res.status(409).json({ error: 'Este libro ya está en tus favoritos.' });
      return;
    }

    const nuevoFavorito = orm.em.create(Favorito, { usuario: usuarioId, libro: libroId, fechaAgregado: new Date() });
    await orm.em.persistAndFlush(nuevoFavorito);

    // Crear registro de actividad
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadFavorito(usuarioId, libroId);
    } catch (actividadError) {
      console.error('Error al crear registro de actividad:', actividadError);
      // No fallar la creación de favorito si falla el registro de actividad
    }

    res.status(201).json({ id: nuevoFavorito.id });

  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const deleteFavorito = async (req: AuthRequest, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;

  // 1. OBTENER ID DE USUARIO DEL TOKEN (SEGURO)
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  // 2. OBTENER ID DEL FAVORITO DE LOS PARÁMETROS DE LA URL
  const favoritoId = +req.params.favoritoId;

  if (!favoritoId) {
    res.status(400).json({ error: 'El favoritoId es requerido en la URL' });
    return;
  }

  // 3. BUSCAR Y ELIMINAR
  const favorito = await orm.em.findOne(Favorito, {
    id: favoritoId,
    usuario: { id: usuarioId }
  });

  if (!favorito) {
    res.status(404).json({ error: 'Favorito no encontrado' });
    return;
  }

  await orm.em.removeAndFlush(favorito);
  res.status(200).json({ mensaje: 'Favorito eliminado' });
  return;
};
