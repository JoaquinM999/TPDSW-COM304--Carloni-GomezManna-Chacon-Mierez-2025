import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';

// Lista de autores populares que sabemos tienen muchos libros en Google Books
const AUTORES_POPULARES = [
  'gabriel garcía márquez',
  'isabel allende',
  'jorge luis borges',
  'paulo coelho',
  'julio cortázar',
  'mario vargas llosa',
  'octavio paz',
  'carlos ruiz zafón',
  'stephen king',
  'j.k. rowling',
  'george r.r. martin',
  'agatha christie',
  'ernest hemingway',
  'garcía lorca',
  'pablo neruda',
  'gabriel garcía',
  'garcía márquez',
  'miguel de cervantes',
  'william shakespeare',
  'jane austen',
  'charles dickens',
  'mark twain',
  'edgar allan poe',
  'oscar wilde',
  'virginia woolf',
  'franz kafka',
  'albert camus',
  'james joyce',
  'haruki murakami',
  'dan brown',
  'neil gaiman',
  'brandon sanderson'
];

// Función para calcular score de popularidad
const calcularScorePopularidad = (autor: Autor): number => {
  const nombreCompleto = `${autor.nombre} ${autor.apellido}`.toLowerCase();
  
  // Buscar coincidencia exacta
  if (AUTORES_POPULARES.includes(nombreCompleto)) {
    return 1000;
  }
  
  // Buscar coincidencia parcial (apellido coincide)
  const apellidoLower = autor.apellido.toLowerCase();
  for (const popular of AUTORES_POPULARES) {
    if (popular.includes(apellidoLower) && apellidoLower.length > 3) {
      return 500;
    }
  }
  
  // Buscar coincidencia parcial (nombre coincide)
  const nombreLower = autor.nombre.toLowerCase();
  for (const popular of AUTORES_POPULARES) {
    if (popular.includes(nombreLower) && nombreLower.length > 3) {
      return 250;
    }
  }
  
  return 0;
};

export const getAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Construir filtro de búsqueda mejorado
    const where: any = {};
    if (search && (search as string).trim().length > 0) {
      const searchTerm = (search as string).trim();
      // Búsqueda case-insensitive mejorada
      where.$or = [
        { nombre: { $ilike: `%${searchTerm}%` } },
        { apellido: { $ilike: `%${searchTerm}%` } }
      ];
    }
    
    // Obtener TODOS los autores que coinciden con el filtro
    const autoresCompletos = await em.find(Autor, where);
    
    // Ordenar por popularidad primero
    const autoresOrdenados = autoresCompletos.sort((a, b) => {
      const scoreA = calcularScorePopularidad(a);
      const scoreB = calcularScorePopularidad(b);
      
      // Si tienen diferente score, ordenar por score
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Mayor score primero
      }
      
      // Si tienen mismo score, ordenar alfabéticamente
      const nombreA = `${a.nombre} ${a.apellido}`;
      const nombreB = `${b.nombre} ${b.apellido}`;
      return nombreA.localeCompare(nombreB);
    });
    
    // Aplicar paginación después de ordenar
    const autoresPaginados = autoresOrdenados.slice(offset, offset + limitNum);
    const total = autoresOrdenados.length;
    
    res.json({
      autores: autoresPaginados.map((autor: Autor) => ({
        id: autor.id.toString(),
        nombre: autor.nombre,
        apellido: autor.apellido,
        name: `${autor.nombre} ${autor.apellido}`.trim(),
        createdAt: autor.createdAt,
        esPopular: calcularScorePopularidad(autor) > 0, // Indicador de popularidad
        scorePopularidad: calcularScorePopularidad(autor)
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum < Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error en getAutores:', error);
    res.status(500).json({ error: 'Error al obtener autores' });
  }
};

export const getAutorById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });
  res.json(autor);
};

export const createAutor = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { nombre, apellido } = req.body;

    // Validar que nombre y apellido estén presentes
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    // Verificar si ya existe un autor con el mismo nombre y apellido
    const existingAutor = await em.findOne(Autor, { 
      nombre: nombre.trim(), 
      apellido: apellido.trim() 
    });

    if (existingAutor) {
      return res.status(400).json({ 
        error: 'Ya existe un autor con ese nombre y apellido',
        autorExistente: {
          id: existingAutor.id,
          nombre: existingAutor.nombre,
          apellido: existingAutor.apellido
        }
      });
    }

    // Crear nuevo autor
    const autor = em.create(Autor, req.body);
    await em.persistAndFlush(autor);
    res.status(201).json(autor);
  } catch (error) {
    console.error('Error en createAutor:', error);
    res.status(500).json({ error: 'Error al crear autor' });
  }
};

export const updateAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  orm.em.assign(autor, req.body);
  await orm.em.flush();
  res.json(autor);
};

export const deleteAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  await orm.em.removeAndFlush(autor);
  res.json({ mensaje: 'Autor eliminado' });
};

export const searchAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    const autores = await em.find(Autor, {
      nombre: { $like: `%${query}%` }
    });

    res.json(autores);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar autores' });
  }
};

// Obtener estadísticas de un autor
export const getAutorStats = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const autorId = +req.params.id;

    // Verificar que el autor existe
    const autor = await em.findOne(Autor, { id: autorId }, { populate: ['libros'] });
    if (!autor) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    // Cargar libros del autor
    await autor.libros.loadItems();
    const libros = autor.libros.getItems();
    const totalLibros = libros.length;

    // Obtener IDs de los libros
    const libroIds = libros.map(l => l.id);

    // Contar reseñas totales de los libros del autor
    const totalResenas = await em.count('Resena', {
      libro: { id: { $in: libroIds } },
      deletedAt: null
    });

    // Calcular promedio de calificaciones
    const result = await em.getConnection().execute(
      `SELECT AVG(estrellas) as promedio 
       FROM resena 
       WHERE libro_id IN (?) AND deleted_at IS NULL AND estrellas IS NOT NULL`,
      [libroIds]
    );
    const promedioCalificacion = result[0]?.promedio ? parseFloat(result[0].promedio).toFixed(1) : '0.0';

    // Obtener libros más populares (más reseñas)
    const librosMasPopulares = libroIds.length > 0 ? await em.getConnection().execute(
      `SELECT l.id, l.nombre, l.imagen, COUNT(r.id) as total_resenas
       FROM libro l
       LEFT JOIN resena r ON r.libro_id = l.id AND r.deleted_at IS NULL
       WHERE l.id IN (?)
       GROUP BY l.id, l.nombre, l.imagen
       ORDER BY total_resenas DESC
       LIMIT 5`,
      [libroIds]
    ) : [];

    res.json({
      autorId,
      nombreCompleto: `${autor.nombre} ${autor.apellido}`.trim(),
      estadisticas: {
        totalLibros,
        totalResenas,
        promedioCalificacion: parseFloat(promedioCalificacion),
        librosMasPopulares: librosMasPopulares.map((libro: any) => ({
          id: libro.id,
          nombre: libro.nombre,
          imagen: libro.imagen,
          totalResenas: parseInt(libro.total_resenas)
        }))
      }
    });
  } catch (error) {
    console.error('Error en getAutorStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del autor' });
  }
};
