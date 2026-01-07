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
import { moderationService } from '../services/moderation.service';
import { 
  parseResenaInput, 
  parseResenaFilters, 
  parseResenaUpdateInput,
  buildResenaQuery,
  validateResenaId,
  parseResenaRespuesta
} from '../utils/resenaParser';
import {
  buildResenaWhereClause,
  procesarResenasConContadores,
  serializarResenaModeracion,
  filtrarYOrdenarResenasTopLevel,
  paginarResenas,
  serializarResenaCompleta
} from '../utils/resenaHelpers';
import {
  determinePopulateStrategy,
  findResenasWithStrategy,
  findResenaByIdWithStrategy,
  logPopulateStats
} from '../utils/resenaPopulateHelpers';

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
    const usuarioPayload = (req as AuthRequest).user;

    console.log('🔍 getResenas - libroId recibido:', libroId);

    // 1️⃣ Construir el WHERE clause usando helper
    const where = buildResenaWhereClause({
      libroId: libroId as string,
      usuarioId: usuarioId as string,
      estado: estado as string,
      user: usuarioPayload,
      em
    });

    console.log('🔍 WHERE clause para buscar reseñas:', JSON.stringify(where, null, 2));
    
    // 2️⃣ Determinar estrategia de populate según query params
    const populateStrategy = determinePopulateStrategy(req.query);
    logPopulateStats(populateStrategy);
    
    // 3️⃣ Buscar reseñas con estrategia optimizada
    const resenas = await findResenasWithStrategy(em, where, populateStrategy);
    
    console.log('🔍 Reseñas encontradas:', resenas.length);

    // 4️⃣ Agregar contadores de reacciones (solo si se cargaron reacciones)
    if (populateStrategy !== 'minimal') {
      procesarResenasConContadores(resenas);
    }

    // 5️⃣ Caso especial: reseñas pendientes (moderación)
    const estadoNormalizado = typeof estado === 'string' ? estado.toLowerCase() : '';
    if (estadoNormalizado === 'pendiente' || 
        estadoNormalizado === 'pending' || 
        estado === EstadoResena.PENDING || 
        where.estado?.$in?.includes(EstadoResena.PENDING)) {
      console.log('🔍 getResenas => moderation reviews:', resenas.length);
      const serialized = resenas.map(serializarResenaModeracion);
      res.json(serialized);
      return;
    }

    // 6️⃣ Filtrar y ordenar reseñas de nivel superior
    const topLevel = filtrarYOrdenarResenasTopLevel(resenas);

    // 7️⃣ Paginar resultados
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const paginatedTopLevel = paginarResenas(topLevel, page, limit);

    console.log('🔍 getResenas => where:', where, '| total top-level:', topLevel.length, '| page:', page, '| paginated:', paginatedTopLevel.length);
    
    // 8️⃣ Serializar reseñas para respuesta
    const serializedReviews = paginatedTopLevel.map(r => serializarResenaCompleta(r, false));
    
    console.log('📤 Enviando respuesta con reseñas:', serializedReviews.map(r => ({ 
      id: r.id, 
      reaccionesCount: r.reaccionesCount,
      reaccionesLength: r.reacciones?.length 
    })));
    
    res.json({
      reviews: serializedReviews,
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
    
    // Usar estrategia 'complete' para vistas de detalle
    const resena = await findResenaByIdWithStrategy(em, +req.params.id, 'complete');
    
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });
    
    // 📊 Agregar contadores de reacciones
    const reacciones = resena.reacciones.getItems();
    (resena as any).reaccionesCount = {
      likes: reacciones.filter(r => r.tipo === 'like').length,
      dislikes: reacciones.filter(r => r.tipo === 'dislike').length,
      corazones: reacciones.filter(r => r.tipo === 'corazon').length,
      total: reacciones.length
    };
    
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

    // ✅ Usar parser para validar input
    const validation = parseResenaInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const { comentario, estrellas, libroId } = validation.data!;
    const { libro: libroData } = req.body;

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (!libroData || !libroData.titulo)
      return res.status(400).json({ error: 'Datos del libro faltantes' });

    // Buscar libro por externalId o id
    const externalId = libroData.id || libroData.slug || libroId?.toString() || '';
    
    // 🔍 Búsqueda mejorada: primero por externalId, luego por nombre + autor para evitar duplicados
    let libro = await em.findOne(Libro, { externalId });
    
    // Si no se encuentra por externalId, buscar por nombre y autor (puede ser que ya exista con otro externalId)
    if (!libro && libroData.titulo) {
      const nombreSimilar = libroData.titulo.trim();
      const whereClause: any = { 
        nombre: nombreSimilar
      };
      
      if (libroData.autores && libroData.autores.length > 0) {
        whereClause.autor = { nombre: { $like: `${libroData.autores[0].split(' ')[0]}%` } };
      }
      
      libro = await em.findOne(Libro, whereClause as any, { populate: ['autor'] as any });
      
      if (libro) {
        console.log(`📚 Libro encontrado por nombre: "${libro.nombre}" (ID: ${libro.id})`);
        // Actualizar el externalId si no lo tenía
        if (!libro.externalId && externalId) {
          libro.externalId = externalId;
          await em.persistAndFlush(libro);
          console.log(`✅ ExternalId actualizado: ${externalId}`);
        }
      }
    }

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

    // Análisis de moderación automática
    const moderationResult = moderationService.analyzeReview(comentario, estrellas);
    console.log('🤖 Análisis de moderación:', {
      score: moderationResult.score,
      isApproved: moderationResult.isApproved,
      shouldAutoReject: moderationResult.shouldAutoReject,
      reasons: moderationResult.reasons
    });

    // 🚫 AUTO-RECHAZO: Si el contenido es extremadamente problemático, rechazar inmediatamente
    if (moderationResult.shouldAutoReject) {
      console.log('🚫 RESEÑA AUTO-RECHAZADA - Contenido extremadamente inapropiado');
      console.log('Razones:', moderationResult.reasons.join(', '));
      
      return res.status(400).json({
        error: 'Tu reseña contiene contenido inapropiado y no puede ser publicada',
        details: 'Por favor, revisa nuestras normas de comunidad y asegúrate de que tu comentario sea respetuoso y constructivo.',
        moderationScore: moderationResult.score,
        blocked: true
      });
    }

    // Determinar estado inicial basado en moderación
    let estadoInicial = EstadoResena.PENDING;
    if (moderationResult.isApproved && moderationResult.score >= 85) {
      // Auto-aprobar SOLO reseñas con score MUY alto (≥85) y sin flags críticos
      estadoInicial = EstadoResena.APPROVED;
      console.log('✅ Reseña auto-aprobada con score:', moderationResult.score);
    } else if (moderationResult.score < 30 || moderationResult.flags.profanity || moderationResult.flags.toxicity) {
      // Auto-flagged si: score muy bajo O contiene profanidad O toxicidad
      estadoInicial = EstadoResena.FLAGGED;
      console.log('⚠️ Reseña auto-flagged por:', moderationResult.reasons.join(', '));
    } else {
      // Enviar a moderación manual si está en zona gris (30-84) sin flags críticos
      estadoInicial = EstadoResena.PENDING;
      console.log('⏳ Reseña enviada a moderación manual - Score:', moderationResult.score);
    }

    // Crear la reseña
    const nuevaResena = em.create(Resena, {
      comentario,
      estrellas,
      libro,
      usuario,
      estado: estadoInicial,
      moderationScore: moderationResult.score,
      moderationReasons: JSON.stringify(moderationResult.reasons),
      autoModerated: moderationResult.score >= 85 || moderationResult.score < 30,
      autoRejected: moderationResult.shouldAutoReject,
      rejectionReason: moderationResult.shouldAutoReject 
        ? moderationResult.reasons.join('; ') 
        : undefined,
      deletedAt: moderationResult.shouldAutoReject ? new Date() : undefined,
      fechaResena: new Date(),
      createdAt: new Date(),
    });

    await em.persistAndFlush(nuevaResena);
    console.log('✅ Reseña guardada con ID:', nuevaResena.id, '| Estado:', estadoInicial);

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

    // ✅ Validar ID de reseña
    const idValidation = validateResenaId(req.params.id);
    if (!idValidation.valid) {
      return res.status(400).json({ error: idValidation.error });
    }

    const resena = await em.findOne(Resena, { id: idValidation.id! }, { populate: ['usuario'] });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (resena.usuario.id !== usuarioPayload.id)
      return res.status(403).json({ error: 'No autorizado para modificar esta reseña' });

    // ✅ Usar parser para validar update
    const validation = parseResenaUpdateInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    em.assign(resena, validation.data!);
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

    // ✅ Validar ID de reseña padre
    const idValidation = validateResenaId(req.params.id);
    if (!idValidation.valid) {
      return res.status(400).json({ error: idValidation.error });
    }

    const parentId = idValidation.id!;

    // ✅ Usar parser para validar respuesta
    const validation = parseResenaRespuesta(req.body, parentId);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const { comentario } = validation.data!;
    const estrellas = 0; // Las respuestas no tienen estrellas

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
      estrellas,
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

// =======================
// Obtener reseñas auto-rechazadas (Solo Admin)
// =======================
export const getResenasRechazadas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    const usuarioPayload = (req as AuthRequest).user;
    if (!usuarioPayload) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const usuario = await em.findOne(Usuario, { id: usuarioPayload.id });
    if (!usuario || usuario.rol !== RolUsuario.ADMIN) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener todas las reseñas soft-deleted (auto-rechazadas)
    const resenasRechazadas = await em.find(Resena, {
      deletedAt: { $ne: null },
      autoRejected: true
    }, {
      populate: ['usuario', 'libro'],
      orderBy: { deletedAt: 'DESC' }
    });

    res.json({
      total: resenasRechazadas.length,
      resenas: resenasRechazadas.map(r => ({
        id: r.id,
        comentario: r.comentario,
        estrellas: r.estrellas,
        moderationScore: r.moderationScore,
        rejectionReason: r.rejectionReason,
        deletedAt: r.deletedAt,
        usuario: {
          id: r.usuario.id,
          nombre: r.usuario.nombre,
          email: r.usuario.email
        },
        libro: {
          id: r.libro.id,
          titulo: r.libro.nombre
        }
      }))
    });
  } catch (error) {
    console.error('❌ Error en getResenasRechazadas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas rechazadas' });
  }
};

// =======================
// Analizar reseña con moderación automática
// =======================
export const analyzeResena = async (req: Request, res: Response) => {
  try {
    const { comentario, estrellas } = req.body;

    if (!comentario || typeof comentario !== 'string') {
      return res.status(400).json({ error: 'Comentario inválido o faltante' });
    }

    const estrellasNum = Number(estrellas);
    if (isNaN(estrellasNum) || estrellasNum < 1 || estrellasNum > 5) {
      return res.status(400).json({ error: 'Estrellas debe ser un número entre 1 y 5' });
    }

    // Realizar análisis de moderación
    const moderationResult = moderationService.analyzeReview(comentario, estrellasNum);

    res.json({
      analysis: moderationResult,
      recommendation: moderationResult.shouldAutoReject
        ? '🚫 Reseña será rechazada automáticamente - Contenido extremadamente inapropiado'
        : moderationResult.isApproved 
          ? '✅ Reseña será aprobada automáticamente' 
          : '⏳ Reseña requiere moderación manual',
      willBeBlocked: moderationResult.shouldAutoReject,
      cleanedText: moderationResult.hasProfanity 
        ? moderationService.cleanText(comentario)
        : comentario
    });
  } catch (error) {
    console.error('❌ Error en analyzeResena:', error);
    res.status(500).json({ error: 'Error al analizar la reseña' });
  }
};

// =======================
// Obtener reseñas populares (ordenadas por reacciones)
// =======================
export const getResenasPopulares = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { libroId, limit = 10 } = req.query;

    const where: any = {
      deletedAt: null,
      estado: EstadoResena.APPROVED
    };

    if (libroId) {
      // Buscar tanto por externalId como por id interno
      const libroIdStr = libroId.toString();
      const isNumeric = /^\d+$/.test(libroIdStr);
      
      if (isNumeric) {
        // Si es numérico, buscar por id O externalId
        where.libro = { $or: [{ id: +libroIdStr }, { externalId: libroIdStr }] };
      } else {
        // Si no es numérico, solo por externalId
        where.libro = { externalId: libroIdStr };
      }
    }

    // Obtener todas las reseñas con sus reacciones
    const resenas = await em.find(Resena, where, {
      populate: ['usuario', 'libro', 'reacciones', 'respuestas'],
      orderBy: { createdAt: 'DESC' },
    });

    // Calcular popularidad y agregar contadores
    const resenasConPopularidad = resenas.map(resena => {
      const reacciones = resena.reacciones.getItems();
      const likes = reacciones.filter(r => r.tipo === 'like').length;
      const corazones = reacciones.filter(r => r.tipo === 'corazon').length;
      const dislikes = reacciones.filter(r => r.tipo === 'dislike').length;
      
      // Score de popularidad: likes + corazones*2 - dislikes
      const popularityScore = likes + (corazones * 2) - dislikes;
      
      return {
        ...resena,
        reaccionesCount: {
          likes,
          dislikes,
          corazones,
          total: reacciones.length
        },
        popularityScore
      };
    });

    // Ordenar por popularidad
    resenasConPopularidad.sort((a, b) => b.popularityScore - a.popularityScore);

    // Limitar resultados
    const limitNum = Math.min(parseInt(limit.toString()), 50);
    const topResenas = resenasConPopularidad.slice(0, limitNum);

    console.log(`📊 Reseñas populares: ${topResenas.length} resultados`);
    res.json({
      total: resenas.length,
      showing: topResenas.length,
      reviews: topResenas
    });
  } catch (error) {
    console.error('❌ Error en getResenasPopulares:', error);
    res.status(500).json({ error: 'Error al obtener reseñas populares' });
  }
};

// =======================
// Obtener estadísticas de moderación (ADMIN)
// =======================
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { range = '30d' } = req.query;

    // Calcular fecha de inicio según el rango
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[range as string] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener todas las reseñas en el rango (incluyendo eliminadas para estadísticas)
    const allResenas = await em.find(Resena, {
      createdAt: { $gte: startDate }
    }, {
      populate: ['usuario']
    });

    // Contadores por estado
    const total = allResenas.length;
    const autoApproved = allResenas.filter(r => r.estado === EstadoResena.APPROVED && r.autoRejected === false).length;
    const autoRejected = allResenas.filter(r => r.estado === EstadoResena.FLAGGED && r.autoRejected === true).length;
    const pending = allResenas.filter(r => r.estado === EstadoResena.PENDING).length;
    const flagged = allResenas.filter(r => r.estado === EstadoResena.FLAGGED).length;
    const manuallyReviewed = allResenas.filter(r => 
      (r.estado === EstadoResena.APPROVED && r.autoRejected === true) || // Aprobadas después de rechazo automático
      (r.estado === EstadoResena.FLAGGED && r.autoRejected === false) // Rechazadas manualmente
    ).length;

    // Calcular score promedio
    const scoresSum = allResenas.reduce((sum, r) => sum + (r.moderationScore || 0), 0);
    const averageScore = total > 0 ? Math.round((scoresSum / total) * 10) / 10 : 0;

    // Razones de rechazo más comunes
    const reasonsCount: Record<string, number> = {};
    allResenas
      .filter(r => r.estado === EstadoResena.FLAGGED && r.moderationReasons)
      .forEach(r => {
        const reasons: string[] = JSON.parse(r.moderationReasons || '[]');
        reasons.forEach((reason: string) => {
          reasonsCount[reason] = (reasonsCount[reason] || 0) + 1;
        });
      });

    const topReasons = Object.entries(reasonsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    // Tendencia de los últimos 7 días
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayResenas = allResenas.filter(r => {
        const rDate = new Date(r.createdAt);
        return rDate >= date && rDate < nextDate;
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        approved: dayResenas.filter(r => r.estado === EstadoResena.APPROVED).length,
        rejected: dayResenas.filter(r => r.estado === EstadoResena.REJECTED).length,
        pending: dayResenas.filter(r => r.estado === EstadoResena.PENDING || r.estado === EstadoResena.FLAGGED).length
      });
    }

    const stats = {
      total,
      autoApproved,
      autoRejected,
      pending: pending + flagged, // Combinamos pending y flagged
      manuallyReviewed,
      averageScore,
      topReasons,
      recentTrend: last7Days
    };

    console.log(`📊 Estadísticas de moderación generadas (${range}):`, {
      total,
      autoApproved,
      autoRejected,
      pending: pending + flagged,
      averageScore
    });

    res.json(stats);
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de moderación:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de moderación' });
  }
};
