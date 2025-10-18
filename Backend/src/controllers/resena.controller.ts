// src/controllers/resena.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Resena, EstadoResena } from '../entities/resena.entity';
import { Libro } from '../entities/libro.entity';
import { Usuario, RolUsuario } from '../entities/usuario.entity';
import { contieneMalasPalabras } from '../shared/filtrarMalasPalabras';
import { Autor } from '../entities/autor.entity';
import { ActividadService } from '../services/actividad.service';
import redis from '../redis';

interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

// =======================
// Obtener todas las reseñas
// =======================
export const getResenas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { libroId, usuarioId, estado } = req.query;

    const where: any = {};

    // Filtrado por libroId (siempre externalId, ya que libroId viene del frontend como external)
    if (libroId) {
      where.libro = { externalId: libroId.toString() };
    }

    if (usuarioId) where.usuario = +usuarioId;
    if (estado) where.estado = estado;

    // 🔹 Lógica de visibilidad
    if (!estado) {
      const usuarioPayload = (req as AuthRequest).user;

      if (libroId) {
        // ➤ Mostrar todas las reseñas del libro excepto las rechazadas
        where.estado = { $nin: [EstadoResena.FLAGGED] };
      } else {
        // ➤ Para listas generales, mantener solo aprobadas para no-admin
        if (!usuarioPayload) {
          where.estado = EstadoResena.APPROVED;
        } else {
          const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
          if (!usuario || usuario.rol !== RolUsuario.ADMIN) {
            where.estado = EstadoResena.APPROVED;
          }
        }
      }
    }

    const resenas = await em.find(Resena, where, {
      populate: [
        'usuario',
        'libro',
        'reacciones',
        'resenaPadre.usuario',
        'respuestas.usuario',
        'respuestas.resenaPadre.usuario',
        'respuestas.respuestas.usuario'
      ],
      orderBy: { createdAt: 'DESC' },
    });

    // Special handling for pending reviews (admin moderation): return flat array without pagination or top-level filtering
    if (estado === 'PENDING') {
      console.log('🔍 getResenas => pending reviews, returning flat array:', resenas.length);
      res.json(resenas);
      return;
    }

    // Filter top-level reviews (no parent)
    let topLevel = resenas.filter(r => !r.resenaPadre);

    // Recursive function to sort replies by fechaResena ASC
    const sortReplies = (resena: Resena) => {
      if (resena.respuestas && resena.respuestas.isInitialized()) {
        const sortedReplies = resena.respuestas.getItems().sort((a, b) => new Date(a.fechaResena).getTime() - new Date(b.fechaResena).getTime());
        resena.respuestas.set(sortedReplies);
        sortedReplies.forEach(sortReplies); // Recurse for deeper levels
      }
    };

    // Sort top-level by createdAt DESC, and sort their replies
    topLevel = topLevel.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    topLevel.forEach(sortReplies);

    // Paginate top-level reviews (10 per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const paginatedTopLevel = topLevel.slice(offset, offset + limit);

    console.log('🔍 getResenas => where:', where, '| total top-level:', topLevel.length, '| page:', page, '| paginated:', paginatedTopLevel.length);
    res.json({
      reviews: paginatedTopLevel,
      total: topLevel.length,
      page,
      pages: Math.ceil(topLevel.length / limit)
    });
  } catch (error) {
    console.error('Error en getResenas:', error);
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
};

// =======================
// Obtener una reseña por ID
// =======================
export const getResenaById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const resena = await em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario', 'libro'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(resena);
  } catch (error) {
    console.error('Error en getResenaById:', error);
    res.status(500).json({ error: 'Error al obtener la reseña' });
  }
};

// =======================
// Crear una nueva reseña
// =======================
export const createResena = async (req: Request, res: Response) => {
  try {
    console.log('📝 Creando reseña...');
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { comentario, estrellas, libroId, libro: libroData } = req.body;

    if (!comentario || typeof comentario !== 'string')
      return res.status(400).json({ error: 'Comentario inválido o faltante' });

    const estrellasNum = Number(estrellas);
    if (isNaN(estrellasNum) || estrellasNum < 1 || estrellasNum > 5)
      return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!libroData || !libroData.titulo)
      return res.status(400).json({ error: 'Datos del libro faltantes' });

    // Buscar libro por externalId o id
    const externalId = libroData.id || libroData.slug || libroId?.toString() || '';
    let libro = await em.findOne(Libro, { externalId });

    if (!libro) {
      let autor: Autor | undefined;
      if (libroData.autores && libroData.autores.length > 0) {
        const autorNombreCompleto = libroData.autores[0];
        // Split name into first and last name (simple split by space)
        const partesNombre = autorNombreCompleto.split(' ');
        const nombre = partesNombre[0] || autorNombreCompleto;
        const apellido = partesNombre.slice(1).join(' ') || '';

        autor = await em.findOne(Autor, { nombre, apellido }) || undefined;
        if (!autor) {
          autor = em.create(Autor, {
            nombre,
            apellido,
            createdAt: new Date()
          });
          await em.persist(autor);
        }
      }

      libro = em.create(Libro, {
        externalId,
        nombre: libroData.titulo,
        sinopsis: libroData.descripcion || null,
        imagen: libroData.imagen || libroData.coverUrl || null,
        enlace: libroData.enlace || null,
        autor,
        source: libroData.source || null,
        createdAt: new Date(),
      });
      await em.persistAndFlush(libro);
      console.log('📚 Nuevo libro creado:', libro.nombre);
    }

    // Crear la reseña
    const nuevaResena = em.create(Resena, {
      comentario,
      estrellas: estrellasNum,
      libro,
      usuario,
      estado: EstadoResena.PENDING,
      fechaResena: new Date(),
      createdAt: new Date(),
    });

    await em.persistAndFlush(nuevaResena);
    console.log('✅ Reseña guardada con ID:', nuevaResena.id);

    // Invalidar cache si existe
    if (redis && redis.del) {
      try {
        await redis.del(`reviews:book:${libro.externalId}`);
        console.log('🗑️ Caché invalidado para libro:', libro.externalId);
      } catch (err) {
        console.error('Error al invalidar caché:', err);
      }
    }

    // Crear registro de actividad
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadResena(usuarioPayload.id, nuevaResena.id);
    } catch (err) {
      console.error('⚠️ No se pudo registrar actividad:', err);
    }

    res.status(201).json({ message: 'Reseña creada', resena: nuevaResena });
  } catch (error) {
    console.error('❌ Error en createResena:', error);
    res.status(500).json({ error: 'Error al crear la reseña' });
  }
};

// =======================
// Actualizar reseña
// =======================
export const updateResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const resena = await em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (resena.usuario.id !== usuarioPayload.id)
      return res.status(403).json({ error: 'No autorizado para modificar esta reseña' });

    if (req.body.comentario && typeof req.body.comentario !== 'string')
      return res.status(400).json({ error: 'Comentario inválido' });

    if (req.body.estrellas !== undefined) {
      const estrellas = Number(req.body.estrellas);
      if (isNaN(estrellas) || estrellas < 1 || estrellas > 5)
        return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });
    }

    em.assign(resena, req.body);
    await em.persistAndFlush(resena);

    res.json({ message: 'Reseña actualizada', resena });
  } catch (error) {
    console.error('Error en updateResena:', error);
    res.status(500).json({ error: 'Error al actualizar la reseña' });
  }
};

// =======================
// Eliminar reseña
// =======================
export const deleteResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const resena = await em.findOne(Resena, { id: +req.params.id }, { populate: ['usuario'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (resena.usuario.id !== usuarioPayload.id)
      return res.status(403).json({ error: 'No autorizado para eliminar esta reseña' });

    await em.removeAndFlush(resena);
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error('Error en deleteResena:', error);
    res.status(500).json({ error: 'Error al eliminar la reseña' });
  }
};

// =======================
// Aprobar / Rechazar reseñas (Admin)
// =======================
export const approveResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario || usuario.rol !== RolUsuario.ADMIN)
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });

    const resena = await em.findOne(Resena, { id: +req.params.id });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (resena.estado !== EstadoResena.PENDING)
      return res.status(400).json({ error: 'La reseña ya ha sido moderada' });

    resena.estado = EstadoResena.APPROVED;
    await em.persistAndFlush(resena);

    res.json({ message: 'Reseña aprobada', resena });
  } catch (error) {
    console.error('Error en approveResena:', error);
    res.status(500).json({ error: 'Error al aprobar la reseña' });
  }
};

export const rejectResena = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario || usuario.rol !== RolUsuario.ADMIN)
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });

    const resena = await em.findOne(Resena, { id: +req.params.id });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (resena.estado !== EstadoResena.PENDING)
      return res.status(400).json({ error: 'La reseña ya ha sido moderada' });

    resena.estado = EstadoResena.FLAGGED;
    await em.persistAndFlush(resena);

    res.json({ message: 'Reseña rechazada', resena });
  } catch (error) {
    console.error('Error en rejectResena:', error);
    res.status(500).json({ error: 'Error al rechazar la reseña' });
  }
};

// =======================
// Crear una respuesta a una reseña (reply)
// =======================
export const createRespuesta = async (req: Request, res: Response) => {
  try {
    console.log('📝 Creando respuesta...');
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { comentario, estrellas = 0 } = req.body;
    const parentId = +req.params.id;

    if (!comentario || typeof comentario !== 'string' || comentario.length > 2000) {
      return res.status(400).json({ error: 'Comentario inválido o demasiado largo (máx. 2000 caracteres)' });
    }

    const estrellasNum = Number(estrellas);
    if (isNaN(estrellasNum) || estrellasNum < 0 || estrellasNum > 5) {
      return res.status(400).json({ error: 'Estrellas debe ser un número entre 0 y 5' });
    }

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const parent = await em.findOne(Resena, { id: parentId }, { populate: ['libro'] });
    if (!parent) return res.status(404).json({ error: 'Reseña padre no encontrada' });



    // Heredar libro del padre
    const libro = parent.libro;

    // Crear la respuesta
    const nuevaResena = em.create(Resena, {
      comentario,
      estrellas: estrellasNum,
      resenaPadre: parent,
      libro,
      usuario,
      estado: EstadoResena.APPROVED, // Replies are approved automatically
      fechaResena: new Date(),
      createdAt: new Date(),
    });

    await em.persistAndFlush(nuevaResena);
    console.log('✅ Respuesta guardada con ID:', nuevaResena.id);

    // Invalidar cache si existe
    if (redis) {
      try {
        await redis.del(`reviews:book:${libro.externalId}`);
        console.log('🗑️ Caché invalidado para libro:', libro.externalId);
      } catch (err) {
        console.error('Error al invalidar caché:', err);
      }
    }

    // Crear registro de actividad (extend ActividadService to handle 'reply' type if needed)
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadResena(usuarioPayload.id, nuevaResena.id);
    } catch (err) {
      console.error('⚠️ No se pudo registrar actividad:', err);
    }

    res.status(201).json({ message: 'Respuesta creada', resena: nuevaResena });
  } catch (error) {
    console.error('❌ Error en createRespuesta:', error);
    res.status(500).json({ error: 'Error al crear la respuesta' });
  }
};
