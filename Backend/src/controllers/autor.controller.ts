import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';
import { searchGoogleBooksAuthors, searchOpenLibraryAuthors } from '../services/autor.service';

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
    
    const { page = '1', limit = '20', search = '', sortBy = 'nombre' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 por página
    
    // Validación de parámetros
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: 'Parámetros de paginación inválidos' });
    }
    
    console.log('📚 getAutores - page:', pageNum, 'limit:', limitNum, 'search:', search);
    
    // Construir filtro de búsqueda mejorado
    const where: any = {};
    if (search && (search as string).trim().length > 0) {
      const searchTerm = (search as string).trim();
      
      // Validar longitud de búsqueda
      if (searchTerm.length < 2) {
        return res.status(400).json({ error: 'El término de búsqueda debe tener al menos 2 caracteres' });
      }
      
      // Búsqueda case-insensitive (MySQL usa LIKE, que es case-insensitive por defecto)
      where.$or = [
        { nombre: { $like: `%${searchTerm}%` } },
        { apellido: { $like: `%${searchTerm}%` } }
      ];
    }
    
    // ✅ OPTIMIZACIÓN: Usar findAndCount con paginación en BD
    const [autores, total] = await em.findAndCount(Autor, where, {
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      orderBy: { [sortBy as string]: 'ASC' }
    });
    
    console.log(`✅ Encontrados ${total} autores totales, mostrando ${autores.length}`);
    
    res.json({
      autores: autores.map((autor: Autor) => ({
        id: autor.id,
        nombre: autor.nombre,
        apellido: autor.apellido,
        name: `${autor.nombre} ${autor.apellido}`.trim(),
        foto: autor.foto,
        biografia: autor.biografia,
        googleBooksId: autor.googleBooksId,
        openLibraryKey: autor.openLibraryKey,
        createdAt: autor.createdAt,
        esPopular: calcularScorePopularidad(autor) > 0,
        scorePopularidad: calcularScorePopularidad(autor)
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum < Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('❌ Error en getAutores:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener autores',
      details: error.message 
    });
  }
};

export const getAutorById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const autorId = +req.params.id;
    
    console.log('🔍 getAutorById - ID:', autorId);
    
    // Validación robusta del ID
    if (isNaN(autorId) || autorId < 1) {
      return res.status(400).json({ error: 'ID de autor inválido. Debe ser un número positivo' });
    }
    
    const autor = await em.findOne(Autor, { id: autorId });
    
    if (!autor) {
      console.log('❌ Autor no encontrado');
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    console.log('✅ Autor encontrado:', autor.nombre, autor.apellido);
    res.json(autor);
  } catch (error: any) {
    console.error('❌ Error en getAutorById:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener autor',
      details: error.message 
    });
  }
};

export const createAutor = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { nombre, apellido } = req.body;

    // Validación robusta de inputs
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'Nombre es requerido y debe ser un string no vacío' });
    }

    if (!apellido || typeof apellido !== 'string' || apellido.trim().length === 0) {
      return res.status(400).json({ error: 'Apellido es requerido y debe ser un string no vacío' });
    }

    if (nombre.trim().length > 100) {
      return res.status(400).json({ error: 'El nombre no puede exceder 100 caracteres' });
    }

    if (apellido.trim().length > 100) {
      return res.status(400).json({ error: 'El apellido no puede exceder 100 caracteres' });
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
    const includeExternal = req.query.includeExternal === 'true';

    console.log('🔍 searchAutores - Query recibida:', query);

    // Validación robusta de inputs
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'El parámetro "q" es requerido y debe ser un string' });
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    if (trimmedQuery.length > 100) {
      return res.status(400).json({ error: 'La consulta de búsqueda no puede exceder 100 caracteres' });
    }

    // Paso 1: Buscar en BDD (fuente única de verdad)
    console.log('📚 Buscando en BDD local...');
    const autoresLocales = await em.find(Autor, {
      $or: [
        { nombre: { $like: `%${trimmedQuery}%` } },
        { apellido: { $like: `%${trimmedQuery}%` } }
      ]
    });

    console.log(`✅ Encontrados ${autoresLocales.length} autores locales`);

    // Paso 2 (opcional): Buscar en APIs externas si hay pocos resultados
    // y el usuario quiere descubrir más autores
    if (includeExternal && autoresLocales.length < 5) {
      try {
        console.log('🌐 Buscando en APIs externas...');
        
        // Buscar en paralelo en Google Books y OpenLibrary
        const [autoresGoogle, autoresOpenLibrary] = await Promise.all([
          searchGoogleBooksAuthors(em, trimmedQuery).catch((err) => {
            console.error('❌ Error en Google Books:', err.message);
            return [];
          }),
          searchOpenLibraryAuthors(em, trimmedQuery).catch((err) => {
            console.error('❌ Error en OpenLibrary:', err.message);
            return [];
          })
        ]);
        
        console.log(`✅ Encontrados ${autoresGoogle.length} autores en Google Books`);
        console.log(`✅ Encontrados ${autoresOpenLibrary.length} autores en OpenLibrary`);
        
        // Combinar resultados eliminando duplicados (por ID)
        const autoresMap = new Map<number, Autor>();
        
        // Añadir autores locales primero (prioridad)
        autoresLocales.forEach(autor => autoresMap.set(autor.id, autor));
        
        // Añadir autores de Google Books
        autoresGoogle.forEach(autor => {
          if (!autoresMap.has(autor.id)) {
            autoresMap.set(autor.id, autor);
          }
        });
        
        // Añadir autores de OpenLibrary
        autoresOpenLibrary.forEach(autor => {
          if (!autoresMap.has(autor.id)) {
            autoresMap.set(autor.id, autor);
          }
        });
        
        const autoresCombinados = Array.from(autoresMap.values());
        console.log(`✅ Total combinado: ${autoresCombinados.length} autores`);
        return res.json(autoresCombinados);
      } catch (error: any) {
        console.error('❌ Error buscando en APIs externas:', error.message);
        console.error('Stack:', error.stack);
        // Si falla la búsqueda externa, devolver solo los locales
        return res.json(autoresLocales);
      }
    }

    res.json(autoresLocales);
  } catch (error: any) {
    console.error('❌ Error en searchAutores:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al buscar autores',
      details: error.message 
    });
  }
};

// Obtener estadísticas de un autor
export const getAutorStats = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const autorId = +req.params.id;

    console.log('📊 getAutorStats - ID:', autorId);

    // Validación robusta del ID
    if (isNaN(autorId) || autorId < 1) {
      return res.status(400).json({ error: 'ID de autor inválido. Debe ser un número positivo' });
    }

    // Verificar que el autor existe
    const autor = await em.findOne(Autor, { id: autorId }, { populate: ['libros'] });
    if (!autor) {
      console.log('❌ Autor no encontrado');
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    // Cargar libros del autor
    await autor.libros.loadItems();
    const libros = autor.libros.getItems();
    const totalLibros = libros.length;

    console.log(`✅ Autor encontrado con ${totalLibros} libros`);

    // Si no tiene libros, devolver estadísticas vacías
    if (totalLibros === 0) {
      return res.json({
        autorId,
        nombreCompleto: `${autor.nombre} ${autor.apellido}`.trim(),
        estadisticas: {
          totalLibros: 0,
          totalResenas: 0,
          promedioCalificacion: 0,
          librosMasPopulares: []
        }
      });
    }

    // Obtener IDs de los libros
    const libroIds = libros.map(l => l.id);

    // Contar reseñas totales de los libros del autor (usando QueryBuilder para evitar problemas)
    let totalResenas = 0;
    try {
      totalResenas = await em.count('Resena', {
        libro: { id: { $in: libroIds } },
        deletedAt: null
      });
    } catch (error: any) {
      console.warn('⚠️ Error contando reseñas:', error.message);
      totalResenas = 0;
    }

    // Calcular promedio de calificaciones (solo si hay libros)
    let promedioCalificacion = 0;
    try {
      const result = await em.getConnection().execute(
        `SELECT AVG(estrellas) as promedio 
         FROM resena 
         WHERE libro_id IN (${libroIds.join(',')}) AND deleted_at IS NULL AND estrellas IS NOT NULL`
      );
      promedioCalificacion = result[0]?.promedio ? parseFloat(result[0].promedio) : 0;
    } catch (error: any) {
      console.warn('⚠️ Error calculando promedio:', error.message);
      promedioCalificacion = 0;
    }

    // Obtener libros más populares (más reseñas)
    let librosMasPopulares: any[] = [];
    try {
      librosMasPopulares = await em.getConnection().execute(
        `SELECT l.id, l.nombre, l.imagen, COUNT(r.id) as total_resenas
         FROM libro l
         LEFT JOIN resena r ON r.libro_id = l.id AND r.deleted_at IS NULL
         WHERE l.id IN (${libroIds.join(',')})
         GROUP BY l.id, l.nombre, l.imagen
         ORDER BY total_resenas DESC
         LIMIT 5`
      );
    } catch (error: any) {
      console.warn('⚠️ Error obteniendo libros populares:', error.message);
      librosMasPopulares = [];
    }

    res.json({
      autorId,
      nombreCompleto: `${autor.nombre} ${autor.apellido}`.trim(),
      estadisticas: {
        totalLibros,
        totalResenas,
        promedioCalificacion: parseFloat(promedioCalificacion.toFixed(1)),
        librosMasPopulares: librosMasPopulares.map((libro: any) => ({
          id: libro.id,
          nombre: libro.nombre,
          imagen: libro.imagen,
          totalResenas: parseInt(libro.total_resenas || '0')
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Error en getAutorStats:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas del autor',
      details: error.message 
    });
  }
};
