// src/controllers/resena.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Resena, EstadoResena } from '../entities/resena.entity';
import { Libro } from '../entities/libro.entity';
import { Usuario, RolUsuario } from '../entities/usuario.entity';
import { contieneMalasPalabras } from '../shared/filtrarMalasPalabras';
import { ActividadService } from '../services/actividad.service';

// Tipado extendido para req.user
interface AuthRequest extends Request {
  user?: { id: number; [key: string]: any };
}

// Obtener todas las reseñas
export const getResenas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork(); // fork para evitar conflictos
    const { libroId, usuarioId, estado } = req.query;

    if (estado === 'PENDING') {
      const usuarioPayload = (req as AuthRequest).user;
      if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

      const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
      if (!usuario || usuario.rol !== RolUsuario.ADMIN) {
        return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
      }
    }

    const where: any = {};
    if (libroId) where.libro = { externalId: libroId.toString() };
    if (usuarioId) where.usuario = +usuarioId;
    if (estado) where.estado = estado;

    const resenas = await em.find(Resena, where, { populate: ['usuario', 'libro', 'reacciones'] });
    res.json(resenas);
  } catch (error) {
    console.error('Error en getResenas:', error);
    res.status(500).json({ error: 'Error al obtener las reseñas' });
  }
};

// Obtener una reseña por ID
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

// Crear una nueva reseña
export const createResena = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Iniciando creación de reseña');
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { comentario, estrellas, libroId } = req.body;

    console.log('📝 Datos recibidos:', { comentario, estrellas, libroId });

    if (!comentario || typeof comentario !== 'string')
      return res.status(400).json({ error: 'Comentario inválido o faltante' });

    const estrellasNum = Number(estrellas);
    if (isNaN(estrellasNum) || estrellasNum < 1 || estrellasNum > 5)
      return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    console.log('👤 Buscando usuario con ID:', usuarioPayload.id);
    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    console.log('✅ Usuario encontrado:', usuario.id);

    // Obtener datos del libro del body
    const libroData = req.body.libro;
    if (!libroData || !libroData.titulo) {
      return res.status(400).json({ error: 'Datos del libro faltantes' });
    }

    console.log('📋 Datos del libro:', libroData);

    // Buscar libro existente por externalId para asegurar unicidad
    const externalId = libroData.id || libroData.slug || req.body.libroId || '';
    let libro = await em.findOne(Libro, { externalId });
    if (!libro) {
      console.log('📖 Libro no encontrado, creando nuevo');
      const nuevoLibro = em.create(Libro, {
        externalId,
        nombre: libroData.titulo,
        sinopsis: libroData.descripcion || null,
        imagen: libroData.imagen || libroData.coverUrl || null,
        enlace: libroData.enlace || null,
        source: libroData.source || null,
        createdAt: new Date(),
      });
      await em.persistAndFlush(nuevoLibro);
      libro = nuevoLibro;
      console.log('✅ Libro creado con ID:', libro.id);
    } else {
      console.log('✅ Libro existente encontrado con ID:', libro.id);
      // Actualizar campos si han cambiado o están vacíos
      if (libroData.titulo && libro.nombre !== libroData.titulo) {
        libro.nombre = libroData.titulo;
      }
      if (libroData.descripcion && (!libro.sinopsis || libro.sinopsis !== libroData.descripcion)) {
        libro.sinopsis = libroData.descripcion;
      }
      if (libroData.imagen && (!libro.imagen || libro.imagen !== libroData.imagen)) {
        libro.imagen = libroData.imagen || libroData.coverUrl || null;
      }
      if (libroData.enlace && libro.enlace !== libroData.enlace) {
        libro.enlace = libroData.enlace;
      }
      if (libroData.source && libro.source !== libroData.source) {
        libro.source = libroData.source;
      }
      em.persist(libro);
      await em.flush();
    }

    console.log('🔍 Verificando malas palabras');
    try {
      const esOfensivo = await contieneMalasPalabras(comentario);
      if (esOfensivo)
        return res.status(400).json({ error: 'El comentario contiene lenguaje inapropiado' });
    } catch (error) {
      console.error('Error en verificación de malas palabras:', error);
      // Si falla la verificación, asumir que no es ofensivo para permitir guardar la reseña
      console.log('⚠️ No se pudo verificar malas palabras, procediendo con la creación de la reseña');
    }

    console.log('📝 Creando reseña');
    const nuevaResena = em.create(Resena, {
      comentario,
      estrellas: estrellasNum,
      libro,
      usuario,
      estado: EstadoResena.PENDING,
      fechaResena: new Date(),
      createdAt: new Date(),
    });

    console.log('💾 Persistiendo reseña');
    await em.persistAndFlush(nuevaResena);

    console.log('✅ Reseña guardada con ID:', nuevaResena.id);

    // Crear actividad (no bloquear si falla)
    try {
      const actividadService = new ActividadService(orm);
      await actividadService.crearActividadResena(usuarioPayload.id, nuevaResena.id);
    } catch (actividadError) {
      console.error('Error al crear registro de actividad:', actividadError);
    }

    res.status(201).json({ message: 'Reseña creada', resena: nuevaResena });
  } catch (error) {
    console.error('❌ Error en createResena:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al crear la reseña',
    });
  }
};

// Actualizar una reseña
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

    if (req.body.comentario) {
      if (typeof req.body.comentario !== 'string')
        return res.status(400).json({ error: 'Comentario inválido' });

      try {
        const esOfensivo = await contieneMalasPalabras(req.body.comentario);
        if (esOfensivo)
          return res.status(400).json({ error: 'El comentario contiene lenguaje inapropiado' });
      } catch (error) {
        console.error('Error en verificación de malas palabras:', error);
        // Si falla la verificación, asumir que no es ofensivo para permitir actualizar la reseña
        console.log('⚠️ No se pudo verificar malas palabras, procediendo con la actualización de la reseña');
      }
    }

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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al actualizar la reseña',
    });
  }
};

// Eliminar reseña
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al eliminar la reseña',
    });
  }
};

// Aprobar reseña (ADMIN)
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al aprobar la reseña',
    });
  }
};

// Rechazar reseña (ADMIN)
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
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al rechazar la reseña',
    });
  }
};
