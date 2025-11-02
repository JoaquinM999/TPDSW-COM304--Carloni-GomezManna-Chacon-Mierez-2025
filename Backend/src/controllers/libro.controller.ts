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

export const getLibros = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();
  
  // Filtro opcional por autor
  const { autor, autorId } = req.query;
  const filtro: any = {};
  
  if (autor || autorId) {
    const idAutor = (autor || autorId) as string;
    filtro.autor = +idAutor; // Convertir a número
  }
  
  // Replace 'ratingLibro' (non-existing relation) with 'resenas' to match entity relations
  const libros = await em.find(Libro, filtro, { populate: ['autor', 'categoria', 'editorial', 'saga', 'resenas'] });

  const librosTransformados = await Promise.all(libros.map(async (libro) => {
    let autores = ['Autor desconocido'];

    if (libro.autor) {
      autores = [`${libro.autor.nombre} ${libro.autor.apellido}`.trim()];
    } else if (libro.externalId) {
      try {
        const googleBook = await getBookById(libro.externalId);
        if (googleBook && googleBook.autores && googleBook.autores.length > 0) {
          autores = googleBook.autores;

          // --- LÓGICA DE AUTOCORRECCIÓN ---
          const autorNombreCompleto = googleBook.autores[0];
          const partesNombre = autorNombreCompleto.split(' ');
          const nombre = partesNombre[0] || autorNombreCompleto;
          const apellido = partesNombre.slice(1).join(' ') || '';

          let autorEntity = await em.findOne(Autor, { nombre, apellido });
          if (!autorEntity) {
            autorEntity = em.create(Autor, { nombre, apellido, createdAt: new Date() });
            await em.persist(autorEntity);
          }
          libro.autor = autorEntity;
          await em.flush();
        }
      } catch (error) {
        console.error('Error fetching author from Google Books for book correction:', error);
      }
    }

    // Compute average rating from the populated 'resenas' relation
    let avgRating = 0;
    if (libro.resenas.isInitialized() && libro.resenas.length > 0) {
      const resenasArray = libro.resenas.getItems();
      const sum = resenasArray.reduce((s, r) => s + (r?.estrellas ?? 0), 0);
      avgRating = sum / resenasArray.length;
    }

    return {
      id: libro.id,
      titulo: libro.nombre,
      autores,
      imagen: libro.imagen,
      averageRating: avgRating,
    };
  }));

  res.json(librosTransformados);
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
      id: libro.id.toString(),
      titulo: libro.nombre || 'Título desconocido',
      title: libro.nombre || 'Título desconocido',
      autores: libro.autor 
        ? [`${libro.autor.nombre || ''} ${libro.autor.apellido || ''}`.trim()]
        : ['Autor desconocido'],
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
      } : null,
      source: 'local' as const
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
    // 1. Buscar si el autor ya existe en tu base de datos.
    let autor = await em.findOne(Autor, {
      nombre: nombreAutor,
      apellido: apellidoAutor,
    });

    // 2. Si el autor NO existe, crearlo.
    if (!autor) {
      console.log('El autor no existe, creando uno nuevo...');
      autor = em.create(Autor, {
        nombre: nombreAutor,
        apellido: apellidoAutor,
        createdAt: new Date()
      });
      await em.persist(autor); // Guardamos el nuevo autor para que tenga un ID
    } else {
      console.log('El autor ya existía en la base de datos.');
    }

    // Fetch other related entities
    const categoria = await em.findOne(Categoria, { id: categoriaId });
    const editorial = await em.findOne(Editorial, { id: editorialId });
    const saga = sagaId ? await em.findOne(Saga, { id: sagaId }) : undefined;

    if (!categoria || !editorial) {
      return res.status(404).json({ error: 'Categoría o editorial no encontrada' });
    }

    // 3. Crear la nueva entidad de Libro.
    const nuevoLibro = em.create(Libro, {
      ...libroData,
      // 4. ¡Aquí está la magia! Asignas el objeto completo del autor.
      // MikroORM se encargará de establecer el `autor_id` correcto en la base de datos.
      autor,
      categoria,
      editorial,
      saga
    });

    // 5. Guardar el libro en la base de datos.
    await em.persistAndFlush(nuevoLibro);

    res.status(201).json(nuevoLibro);
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
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    // Search by title
    const librosByTitle = await em.find(Libro, {
      nombre: { $like: `%${query}%` }
    }, { populate: ['autor', 'categoria'] });

    // Search by author name
    const librosByAuthor = await em.find(Libro, {
      autor: { nombre: { $like: `%${query}%` } }
    }, { populate: ['autor', 'categoria'] });

    // Combine and deduplicate results
    const allLibros = [...librosByTitle, ...librosByAuthor];
    const uniqueLibros = allLibros.filter((libro, index, self) =>
      index === self.findIndex(l => l.id === libro.id)
    );

    res.json(uniqueLibros);
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

    // Fecha de hace 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Obtener libros creados en los últimos 30 días
    const libros = await em.find(
      Libro,
      { createdAt: { $gte: thirtyDaysAgo } },
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
