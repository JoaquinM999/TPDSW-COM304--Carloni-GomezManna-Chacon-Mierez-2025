// src/controllers/libro.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Libro } from '../entities/libro.entity';
import { Categoria } from '../entities/categoria.entity';
import { Autor } from '../entities/autor.entity';
import { Editorial } from '../entities/editorial.entity';
import { Saga } from '../entities/saga.entity';
import { ContenidoLista } from '../entities/contenidoLista.entity';
import { getBookById } from '../services/googleBooks.service';
import { Resena } from '../entities/resena.entity';
import { 
  parseLibroFilters, 
  buildLibroQuery, 
  validateLibroId 
} from '../utils/libroParser';
import {
  findOrCreateAutorLibro,
  findLibroRelatedEntities,
  createLibroEntity,
  validateLibroCreationData
} from '../utils/libroHelpers';
import {
  validateSearchQuery,
  searchLibrosOptimized
} from '../utils/libroSearchHelpers';


export const getLibros = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();

  try {
    // ✅ Usar parser para validar y extraer filtros
    const filters = parseLibroFilters(req.query);
    
    // ✅ Construir query usando el parser
    const where = buildLibroQuery(filters);
    
    // Filtro opcional por autor (legacy support)
    const { autor, autorId } = req.query;
    if (autor || autorId) {
      const idAutor = (autor || autorId) as string;
      where.autor = +idAutor;
    }

    // Get total count for pagination
    const total = await em.count(Libro, where);

    // Get paginated results
    const libros = await em.find(Libro, where, {
      populate: ['autor', 'categoria', 'editorial', 'saga'],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      orderBy: { createdAt: 'DESC' }
    });

    const librosTransformados = libros.map((libro) => {
      let autores = ['Autor desconocido'];

      if (libro.autor) {
        autores = [`${libro.autor.nombre} ${libro.autor.apellido}`.trim()];
      }

      return {
        id: libro.id,
        slug: libro.slug,
        titulo: libro.nombre,
        autores,
        imagen: libro.imagen,
        averageRating: 0, // Simplified for now
      };
    });

    const totalPages = Math.ceil(total / filters.limit);

    console.log(`getLibros: page=${filters.page}, limit=${filters.limit}, total=${total}, totalPages=${totalPages}, librosCount=${librosTransformados.length}`);

    res.json({
      libros: librosTransformados,
      total,
      totalPages,
      currentPage: filters.page,
      hasNextPage: filters.page < totalPages,
      hasPrevPage: filters.page > 1
    });
  } catch (error) {
    console.error('Error in getLibros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getLibroById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
  res.json(libro);
};

/**
 * Obtener libro por slug con todas sus relaciones
 * Endpoint: GET /api/libros/slug/:slug
 * Formato compatible con DetalleLibro.tsx
 */
export const getLibroBySlug = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  
  try {
    const { slug } = req.params;
    
    // Buscar por slug o por externalId (para libros de Google Books)
    const libro = await em.findOne(
      Libro, 
      { $or: [{ slug }, { externalId: slug }] },
      { populate: ['autor', 'categoria', 'editorial', 'saga'] }
    );
    
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    
    // Formatear respuesta compatible con DetalleLibro.tsx
    const response = {
      id: libro.id,
      externalId: libro.externalId || null, // ✅ CRÍTICO: Devolver externalId
      source: libro.source || 'local', // ✅ CRÍTICO: Devolver source original
      titulo: libro.nombre || 'Título desconocido',
      title: libro.nombre || 'Título desconocido',
      autores: libro.autor 
        ? [`${libro.autor.nombre || ''} ${libro.autor.apellido || ''}`.trim()]
        : ['Autor desconocido'],
      autorId: libro.autor?.id || null, // ✅ NUEVO: ID del autor local
      descripcion: libro.sinopsis || 'No hay descripción disponible.',
      imagen: libro.imagen || null,
      coverUrl: libro.imagen || null,
      enlace: libro.enlace || null,
      slug: libro.slug || null,
      categoria: libro.categoria ? {
        id: libro.categoria.id,
        nombre: libro.categoria.nombre
      } : null,
      editorial: libro.editorial ? {
        id: libro.editorial.id,
        nombre: libro.editorial.nombre
      } : null,
      saga: libro.saga ? {
        id: libro.saga.id,
        nombre: libro.saga.nombre
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error al obtener libro por slug:', error);
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
};

export const createLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const { nombreAutor, apellidoAutor, categoriaId, editorialId, sagaId, ...libroData } = req.body;

  try {
    // 1️⃣ Validar datos de entrada
    const validation = validateLibroCreationData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 2️⃣ Buscar o crear autor
    const autor = await findOrCreateAutorLibro(em, nombreAutor, apellidoAutor);

    // 3️⃣ Buscar entidades relacionadas (categoría, editorial, saga)
    // Convertir IDs a números
    const categoriaIdNum = parseInt(categoriaId);
    const editorialIdNum = editorialId ? parseInt(editorialId) : undefined;
    const sagaIdNum = sagaId ? parseInt(sagaId) : undefined;
    
    const relatedEntities = await findLibroRelatedEntities(em, categoriaIdNum, editorialIdNum, sagaIdNum);
    
    if ('error' in relatedEntities) {
      return res.status(404).json({ error: relatedEntities.error });
    }

    relatedEntities.autor = autor;

    // 4️⃣ Crear y guardar el libro
    const nuevoLibro = createLibroEntity(em, libroData, relatedEntities);
    await em.persistAndFlush(nuevoLibro);

    // Formatear respuesta para incluir autorId
    const response = {
      id: nuevoLibro.id,
      slug: nuevoLibro.slug,
      nombre: nuevoLibro.nombre,
      sinopsis: nuevoLibro.sinopsis,
      imagen: nuevoLibro.imagen,
      autorId: nuevoLibro.autor?.id || null,
      autor: nuevoLibro.autor ? {
        id: nuevoLibro.autor.id,
        nombre: nuevoLibro.autor.nombre,
        apellido: nuevoLibro.autor.apellido
      } : null,
      categoria: nuevoLibro.categoria ? {
        id: nuevoLibro.categoria.id,
        nombre: nuevoLibro.categoria.nombre
      } : null,
      editorial: nuevoLibro.editorial ? {
        id: nuevoLibro.editorial.id,
        nombre: nuevoLibro.editorial.nombre
      } : null
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error al guardar el libro:', error);
    res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  }
};

export const updateLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  em.assign(libro, req.body);
  await em.flush();
  res.json(libro);
};

export const deleteLibro = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  const libro = await em.findOne(Libro, { id: +req.params.id });
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });

  await em.removeAndFlush(libro);
  res.json({ mensaje: 'Libro eliminado' });
};

export const getLibrosByCategoria = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const categoriaId = +req.params.categoriaId;

    const categoria = await em.findOne(Categoria, { id: categoriaId });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

    const libros = await em.find(Libro, { categoria: categoriaId });
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por categoría' });
  }
};

export const getLibrosByEstrellasMinimas = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const minEstrellas = Number(req.query.minEstrellas);

    if (isNaN(minEstrellas) || minEstrellas < 1 || minEstrellas > 5) {
      return res.status(400).json({ error: 'Parámetro minEstrellas inválido. Debe estar entre 1 y 5' });
    }

    // Using COALESCE to treat books without reviews as 0 average
    const libros = await em.getConnection().execute(`
      SELECT l.*, COALESCE(AVG(r.estrellas), 0) AS promedio_estrellas
      FROM libro l
      LEFT JOIN resena r ON r.libro_id = l.id
      GROUP BY l.id
      HAVING promedio_estrellas >= ?
      ORDER BY promedio_estrellas DESC
    `, [minEstrellas]);

    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por estrellas' });
  }
};

// Optional alternative using raw SQL query
export const getLibrosByEstrellasMinimasQB = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const minEstrellas = Number(req.query.minEstrellas);

    if (isNaN(minEstrellas) || minEstrellas < 1 || minEstrellas > 5) {
      return res.status(400).json({ error: 'Parámetro minEstrellas inválido. Debe estar entre 1 y 5' });
    }

    const libros = await orm.em.getConnection().execute(`
      SELECT l.*, COALESCE(AVG(r.estrellas), 0) AS promedio_estrellas
      FROM libro l
      LEFT JOIN resena r ON r.libro_id = l.id
      GROUP BY l.id
      HAVING promedio_estrellas >= ?
      ORDER BY promedio_estrellas DESC
    `, [minEstrellas]);

    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros por estrellas (QueryBuilder)' });
  }
};

export const getReviewsByBookIdController = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const bookId = +req.params.id;

    const libro = await em.findOne(Libro, { id: bookId });
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    const resenas = await em.find(Resena, { libro: libro.id });
    res.json(resenas);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

export const searchLibros = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = (req.query.q || req.query.query) as string;

    // ✅ Validar query usando helper
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // ✅ Búsqueda optimizada con una sola query usando $or
    const libros = await searchLibrosOptimized(em, {
      query: validation.sanitizedQuery!,
      searchIn: ['titulo', 'autor'], // Buscar en título y autor simultáneamente
      limit: 50
    });

    res.json(libros);
  } catch (error) {
    console.error('Error en searchLibros:', error);
    res.status(500).json({ error: 'Error al buscar libros' });
  }
};

export const getListasForLibro = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = (req as any).user.id;
    const { externalId } = req.params;

    if (!userId || !externalId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Busca todas las relaciones ContenidoLista para este libro y usuario
    const contenidos = await orm.em.find(ContenidoLista, {
      libro: { externalId },
      lista: { usuario: { id: userId } },
    }, { populate: ['lista'] });

    // Extrae solo los IDs de las listas
    const listaIds = contenidos.map(c => c.lista.id);

    res.json(listaIds); // Devuelve un array de números, ej: [1, 5, 12]

  } catch (error) {
    console.error("Error al obtener listas para el libro:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// =======================
// Obtener libros recientes (últimos 30 días)
// =======================
export const getNuevosLanzamientos = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const limit = parseInt(req.query.limit as string) || 20;

    // Fecha de hace 180 días (6 meses) para mostrar más libros
    const monthsAgo = new Date();
    monthsAgo.setDate(monthsAgo.getDate() - 180);

    // Obtener libros creados en los últimos 6 meses
    const libros = await em.find(
      Libro,
      { createdAt: { $gte: monthsAgo } },
      {
        populate: ['autor', 'categoria', 'editorial', 'resenas'],
        orderBy: { createdAt: 'DESC' },
        limit,
      }
    );

    // Transformar libros con información completa
    const librosTransformados = await Promise.all(libros.map(async (libro) => {
      let autores = ['Autor desconocido'];

      if (libro.autor) {
        autores = [`${libro.autor.nombre} ${libro.autor.apellido}`.trim()];
      } else if (libro.externalId) {
        try {
          const googleBook = await getBookById(libro.externalId);
          if (googleBook && googleBook.autores && googleBook.autores.length > 0) {
            autores = googleBook.autores;
          }
        } catch (error) {
          console.error('Error fetching author from Google Books:', error);
        }
      }

      // Calcular rating promedio
      let avgRating = 0;
      if (libro.resenas.isInitialized() && libro.resenas.length > 0) {
        const resenasArray = libro.resenas.getItems();
        const sum = resenasArray.reduce((s, r) => s + (r?.estrellas ?? 0), 0);
        avgRating = sum / resenasArray.length;
      }

      return {
        id: libro.externalId || libro.id.toString(),
        slug: libro.externalId || libro.id.toString(),
        titulo: libro.nombre,
        autores,
        imagen: libro.imagen,
        descripcion: libro.sinopsis || null,
        averageRating: avgRating,
        categoria: libro.categoria ? libro.categoria.nombre : null,
        fechaPublicacion: libro.createdAt,
        esNuevo: true,
      };
    }));

    console.log(`📚 Nuevos lanzamientos: ${librosTransformados.length} libros encontrados`);
    res.json({
      total: librosTransformados.length,
      libros: librosTransformados,
    });
  } catch (error) {
    console.error('❌ Error al obtener nuevos lanzamientos:', error);
    res.status(500).json({ error: 'Error al obtener nuevos lanzamientos' });
  }
};

/**
 * Obtener o crear un libro desde una API externa (Google Books)
 * Si el libro no existe en la BD, lo crea automáticamente
 */
export const getOrCreateLibroFromExternal = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();

  try {
    const externalIdParam = req.params.externalId;
    // Handle both string and string[] cases from req.params
    const externalId = Array.isArray(externalIdParam) ? externalIdParam[0] : externalIdParam;

    if (!externalId) {
      return res.status(400).json({ error: 'externalId es requerido' });
    }

    console.log(`🔍 Buscando libro con externalId: ${externalId}`);

    // 1. Verificar si el libro ya existe en la BD
    let libro = await em.findOne(Libro, { externalId }, { 
      populate: ['autor', 'categoria', 'editorial', 'saga'] 
    });

    if (libro) {
      console.log(`✅ Libro encontrado en BD: ${libro.nombre}`);
      return res.json(libro);
    }

    // 2. Si no existe, obtener datos de Google Books
    console.log(`📡 Obteniendo datos de Google Books API...`);
    const googleBook = await getBookById(externalId);

    if (!googleBook) {
      return res.status(404).json({ error: 'Libro no encontrado en Google Books' });
    }

    // 3. Crear o buscar el autor
    let autorEntity = null;
    if (googleBook.autores && googleBook.autores.length > 0) {
      const autorNombreCompleto = googleBook.autores[0];
      const partesNombre = autorNombreCompleto.split(' ');
      const nombre = partesNombre[0] || autorNombreCompleto;
      const apellido = partesNombre.slice(1).join(' ') || '';

      autorEntity = await em.findOne(Autor, { nombre, apellido });
      if (!autorEntity) {
        console.log(`👤 Creando nuevo autor: ${nombre} ${apellido}`);
        autorEntity = em.create(Autor, { 
          nombre, 
          apellido,
          createdAt: new Date() 
        });
        await em.persistAndFlush(autorEntity);
      }
    }

    // 4. Obtener categoría por defecto o crear una
    let categoriaEntity = await em.findOne(Categoria, { nombre: 'General' });
    if (!categoriaEntity) {
      categoriaEntity = em.create(Categoria, { 
        nombre: 'General',
        createdAt: new Date() 
      });
      await em.persistAndFlush(categoriaEntity);
    }

    // 5. Crear el libro en la BD
    console.log(`📚 Creando libro en BD: ${googleBook.titulo}`);
    libro = em.create(Libro, {
      nombre: googleBook.titulo,
      sinopsis: googleBook.descripcion || '',
      imagen: googleBook.imagen || '',
      enlace: googleBook.enlace || '',
      externalId: externalId,
      slug: externalId, // Usamos externalId como slug
      source: 'google',
      autor: autorEntity,
      categoria: categoriaEntity,
      createdAt: new Date(),
    });

    await em.persistAndFlush(libro);

    console.log(`✅ Libro creado exitosamente: ${libro.nombre} (ID: ${libro.id})`);

    // 6. Retornar el libro recién creado con relaciones
    await em.populate(libro, ['autor', 'categoria', 'editorial', 'saga']);
    
    return res.status(201).json(libro);

  } catch (error) {
    console.error('❌ Error al obtener/crear libro desde API externa:', error);
    res.status(500).json({ error: 'Error al procesar el libro' });
  }
};
