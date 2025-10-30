// src/controllers/recomendacion.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Usuario } from '../entities/usuario.entity';
import { RecomendacionService } from '../services/recomendacion.service';

/**
 * Obtiene recomendaciones personalizadas para el usuario autenticado
 * Considera: favoritos, reseñas, ratings, categorías, autores y recencia
 * Utiliza caché Redis para optimizar respuestas
 */
export const getRecomendaciones = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    const usuarioPayload = (req as any).user;
    if (!usuarioPayload || typeof usuarioPayload === 'string' || !('id' in usuarioPayload)) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const usuario = await orm.em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Obtener límite de resultados (por defecto 10, máximo 50)
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    // Usar el servicio de recomendaciones mejorado
    const recomendacionService = new RecomendacionService(orm);
    const recomendaciones = await recomendacionService.getRecomendacionesPersonalizadas(usuario.id, limit);

    res.json({ 
      recomendaciones,
      algoritmo: 'Basado en favoritos, reseñas 4+ estrellas, categorías y autores preferidos',
      total: recomendaciones.length
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error al obtener recomendaciones' 
    });
  }
};

/**
 * Invalida el caché de recomendaciones para el usuario autenticado
 * Útil después de agregar favoritos o reseñas
 */
export const invalidarCacheRecomendaciones = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    const usuarioPayload = (req as any).user;
    if (!usuarioPayload || typeof usuarioPayload === 'string' || !('id' in usuarioPayload)) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const recomendacionService = new RecomendacionService(orm);
    await recomendacionService.invalidarCache(usuarioPayload.id);

    res.json({ message: 'Caché de recomendaciones invalidado con éxito' });
  } catch (error) {
    console.error('Error al invalidar caché:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error al invalidar caché' 
    });
  }
};
