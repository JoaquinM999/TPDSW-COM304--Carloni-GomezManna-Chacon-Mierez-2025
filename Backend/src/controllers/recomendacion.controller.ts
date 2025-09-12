// src/controllers/recomendacion.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Favorito } from '../entities/favorito.entity';
import { Libro } from '../entities/libro.entity';
import { Usuario } from '../entities/usuario.entity';

export const getRecomendaciones = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    const usuarioPayload = (req as any).user;
    if (!usuarioPayload || typeof usuarioPayload === 'string' || !('id' in usuarioPayload)) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const usuario = await orm.em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Obtener favoritos con libro y su categoria poblados
    const favoritos = await orm.em.find(Favorito, { usuario: usuario.id }, { populate: ['libro', 'libro.categoria'] });

    if (favoritos.length === 0) {
      return res.json({ recomendaciones: [] }); // Sin favoritos no hay recomendaciones
    }

    // Obtener categorías más frecuentes en favoritos
    const categoriasCount: Record<number, number> = {};
    favoritos.forEach(fav => {
      const catId = fav.libro.categoria?.id;
      if (catId) {
        categoriasCount[catId] = (categoriasCount[catId] || 0) + 1;
      }
    });

    // Ordenar categorías por cantidad descendente
    const categoriasOrdenadas = Object.entries(categoriasCount)
      .sort(([, a], [, b]) => b - a)
      .map(([catId]) => Number(catId));

    if (categoriasOrdenadas.length === 0) {
      return res.json({ recomendaciones: [] });
    }

    // Buscar libros de esas categorías que no estén en favoritos
    const librosFavoritosIds = favoritos.map(fav => fav.libro.id);

    const recomendaciones = await orm.em.find(Libro, {
      categoria: { $in: categoriasOrdenadas },
      id: { $nin: librosFavoritosIds }
    }, { limit: 10 });

    res.json({ recomendaciones });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error al obtener recomendaciones' });
  }
};
